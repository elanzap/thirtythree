import React, { useState, useEffect } from 'react';
import { usePharmacyStore } from '../../stores/pharmacyStore';
import { loadPrescriptions } from '../../utils/storage';
import { PharmacyBill } from '../../types/pharmacy';
import { PharmacyBillPDF } from './PharmacyBillPDF';
import { Eye } from 'lucide-react';

interface PharmacyBill {
  patientName: string;
  age: string;
  gender: string;
  phoneNumber: string;
  prescriptionId: string;
  items: {
    medicineName: string;
    batchNo: string;
    expiryDate: string;
    quantity: number;
    availableQuantity: number;
    tax: number;
    amount: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
}

export const PharmacyOrders: React.FC = () => {
  const { pharmacyItems, getBatchesForMedicine } = usePharmacyStore();
  const [prescriptionId, setPrescriptionId] = useState('');
  const [bill, setBill] = useState<PharmacyBill | null>(null);
  const [error, setError] = useState('');
  const [selectedBatches, setSelectedBatches] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState<number>(0);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');
  const [savedBills, setSavedBills] = useState<Array<{
    id: string;
    prescriptionId: string;
    patientName: string;
    date: string;
    total: number;
    discount: number;
    items: {
      medicineName: string;
      batchNo: string;
      expiryDate: string;
      quantity: number;
      availableQuantity: number;
      tax: number;
      amount: number;
    }[];
    subtotal: number;
    age: string;
    gender: string;
  }>>([]);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);

  useEffect(() => {
    const bills = localStorage.getItem('pharmacyBills');
    if (bills) {
      setSavedBills(JSON.parse(bills));
    }
  }, []);

  useEffect(() => {
    console.log('Initial pharmacy items:', pharmacyItems);
  }, [pharmacyItems]);

  const handleBatchSelect = (medicineName: string, batchNo: string) => {
    console.log('Selecting batch:', { medicineName, batchNo });
    setSelectedBatches(prev => ({ ...prev, [medicineName]: batchNo }));
    
    if (bill) {
      const updatedItems = bill.items.map(item => {
        if (item.medicineName === medicineName) {
          const batches = getBatchesForMedicine(medicineName);
          console.log('Available batches for', medicineName, ':', batches);
          const selectedBatchDetails = batches.find(b => b.batchNo === batchNo);
          
          if (selectedBatchDetails) {
            console.log('Selected batch details:', selectedBatchDetails);
            return {
              ...item,
              batchNo: selectedBatchDetails.batchNo,
              expiryDate: selectedBatchDetails.expiryDate,
              availableQuantity: selectedBatchDetails.quantity,
              amount: selectedBatchDetails.salePrice * item.quantity,
              tax: selectedBatchDetails.tax
            };
          }
        }
        return item;
      });

      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      setBill({
        ...bill,
        items: updatedItems,
        subtotal,
        total: subtotal * (1 - bill.discount / 100)
      });
    }
  };

  const handleQuantityChange = (medicineName: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setQuantities(prev => ({ ...prev, [medicineName]: quantity }));
    
    if (bill) {
      const updatedItems = bill.items.map(item => {
        if (item.medicineName === medicineName) {
          const batches = getBatchesForMedicine(medicineName);
          const selectedBatch = selectedBatches[medicineName] || item.batchNo;
          const batchDetails = batches.find(b => b.batchNo === selectedBatch);
          
          if (batchDetails) {
            return {
              ...item,
              quantity,
              amount: batchDetails.salePrice * quantity
            };
          }
        }
        return item;
      });

      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      setBill({
        ...bill,
        items: updatedItems,
        subtotal,
        total: subtotal * (1 - bill.discount / 100)
      });
    }
  };

  const handleDiscountChange = (value: string) => {
    const newDiscount = Math.min(Math.max(parseFloat(value) || 0, 0), 100); // Clamp between 0 and 100
    setDiscount(newDiscount);
    
    if (bill) {
      setBill({
        ...bill,
        discount: newDiscount,
        total: bill.subtotal * (1 - newDiscount / 100)
      });
    }
  };

  const generateBill = () => {
    if (!prescriptionId.trim()) {
      setError('Please enter a prescription ID');
      return;
    }

    const prescriptions = loadPrescriptions();
    console.log('Available Prescriptions:', prescriptions);
    console.log('Searching for Prescription ID:', prescriptionId);

    if (!prescriptions || prescriptions.length === 0) {
      setError('No prescriptions found in the system');
      return;
    }

    const searchId = prescriptionId.trim();
    const prescription = prescriptions.find(p => {
      const prescriptionMainId = p.id?.toString().trim();
      const prescriptionSecondaryId = p.prescriptionId?.toString().trim();
      console.log('Comparing:', { 
        mainId: prescriptionMainId, 
        secondaryId: prescriptionSecondaryId, 
        searchId 
      });
      return prescriptionMainId === searchId || prescriptionSecondaryId === searchId;
    });

    if (!prescription) {
      setError(`Prescription not found. Please check the ID and try again.`);
      console.log('Available Prescription IDs:', prescriptions.map(p => ({
        id: p.id,
        prescriptionId: p.prescriptionId
      })));
      return;
    }

    console.log('Found Prescription:', prescription);

    const prescribedItems = prescription.medications?.map(med => {
      const [type, name, strength] = med.name.split(' ');
      const formattedName = `${type} ${name} ${strength}`;
      console.log('Looking for medicine:', { 
        original: med.name,
        formatted: formattedName
      });
      
      const availableBatches = getBatchesForMedicine(formattedName);
      console.log('Available batches:', availableBatches);
      
      if (availableBatches.length > 0) {
        const defaultBatch = availableBatches[0];
        return {
          medicineName: formattedName,
          batchNo: defaultBatch.batchNo,
          expiryDate: defaultBatch.expiryDate,
          quantity: med.quantity || 1,
          availableQuantity: defaultBatch.quantity,
          tax: defaultBatch.tax,
          amount: defaultBatch.salePrice * (med.quantity || 1)
        };
      }
      
      return {
        medicineName: formattedName,
        batchNo: '',
        expiryDate: '',
        quantity: med.quantity || 1,
        availableQuantity: 0,
        tax: 0,
        amount: 0
      };
    }) || [];

    const mockBill: PharmacyBill = {
      patientName: prescription.patientName || '',
      age: prescription.age || '',
      gender: prescription.gender || '',
      phoneNumber: prescription.phone || '',
      prescriptionId: prescriptionId,
      items: prescribedItems,
      subtotal: 0,
      discount: 10,
      total: 0
    };

    mockBill.subtotal = mockBill.items.reduce((sum, item) => sum + item.amount, 0);
    mockBill.total = mockBill.subtotal * (1 - mockBill.discount / 100);

    setBill(mockBill);
    setError('');
  };

  const getNextBillNumber = () => {
    if (savedBills.length === 0) return 'PH1';
    const lastBill = savedBills[0]; // Bills are stored newest first
    const lastNumber = parseInt(lastBill.id.replace('PH', ''));
    return `PH${lastNumber + 1}`;
  };

  const saveBillAndGeneratePdf = () => {
    if (!bill) return;

    // Create new bill with current discount
    const currentBill = {
      ...bill,
      discount,
      total: bill.subtotal * (1 - discount / 100)
    };

    // Update available quantities in pharmacy store
    currentBill.items.forEach(item => {
      usePharmacyStore.getState().updatePharmacyItemQuantity(
        item.medicineName,
        item.batchNo,
        item.quantity
      );
    });

    // Save bill to localStorage with sequential bill number
    const newBill = {
      id: getNextBillNumber(),
      prescriptionId: currentBill.prescriptionId,
      patientName: currentBill.patientName,
      date: new Date().toLocaleDateString(),
      total: currentBill.total,
      discount: currentBill.discount,
      items: currentBill.items,
      subtotal: currentBill.subtotal,
      age: currentBill.age,
      gender: currentBill.gender
    };

    const updatedBills = [newBill, ...savedBills];
    setSavedBills(updatedBills);
    localStorage.setItem('pharmacyBills', JSON.stringify(updatedBills));

    // Show print preview with current bill
    setBill(currentBill);
    setShowPrintPreview(true);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6">
      <h2 className="text-2xl font-bold mb-6">Pharmacy Orders</h2>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Order
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'view'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              View Bills
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'create' ? (
        <>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-md">
                <label htmlFor="prescriptionId" className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription ID
                </label>
                <input
                  type="text"
                  id="prescriptionId"
                  value={prescriptionId}
                  onChange={(e) => setPrescriptionId(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter Prescription ID"
                />
              </div>
              <button
                onClick={generateBill}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Generate Bill
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          {bill && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Bill Details</h3>
                    <p className="text-gray-600">Prescription ID: {prescriptionId}</p>
                    <p className="text-gray-600">Patient: {bill.patientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {bill.items.map((item, index) => {
                      const batches = getBatchesForMedicine(item.medicineName);
                      const selectedBatch = selectedBatches[item.medicineName] || item.batchNo;
                      const currentBatchDetails = batches.find(b => b.batchNo === selectedBatch);

                      return (
                        <tr key={index}>
                          <td className="px-4 py-3">{item.medicineName}</td>
                          <td className="px-4 py-3">
                            <select
                              value={selectedBatch}
                              onChange={(e) => handleBatchSelect(item.medicineName, e.target.value)}
                              className="border rounded px-3 py-1.5 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Select Batch</option>
                              {batches.length > 0 ? (
                                batches.map(batch => (
                                  <option key={batch.batchNo} value={batch.batchNo}>
                                    Batch {batch.batchNo} (Qty: {batch.quantity})
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>No batches available</option>
                              )}
                            </select>
                          </td>
                          <td className="px-4 py-3">{currentBatchDetails?.expiryDate || item.expiryDate}</td>
                          <td className="px-4 py-3 text-right">
                            {currentBatchDetails?.availableQuantity || currentBatchDetails?.quantity || item.availableQuantity || item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">₹{currentBatchDetails?.salePrice.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={quantities[item.medicineName] || item.quantity}
                              onChange={(e) => handleQuantityChange(item.medicineName, e.target.value)}
                              className="border rounded px-3 py-1.5 w-24 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">₹{item.amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-start">
                  <button
                    onClick={saveBillAndGeneratePdf}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    View and Print
                  </button>
                  <div className="max-w-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{bill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount (%):</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                        className="border rounded px-3 py-1.5 w-24 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                      <span>Total:</span>
                      <span>₹{bill.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 gap-6">
            {/* Bills Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill No</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescription ID</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {savedBills.map((bill) => (
                    <tr
                      key={bill.id}
                      className={`hover:bg-gray-50 ${
                        selectedBill === bill.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm">{bill.id}</td>
                      <td className="px-4 py-3 text-sm">{bill.prescriptionId}</td>
                      <td className="px-4 py-3 text-sm">{bill.date}</td>
                      <td className="px-4 py-3 text-sm">{bill.patientName}</td>
                      <td className="px-4 py-3 text-sm text-right">{bill.discount}%</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">₹{bill.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <button
                          onClick={() => {
                            setSelectedBill(bill.id);
                            setShowPrintPreview(true);
                          }}
                          className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                          title="View Bill"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {savedBills.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No saved bills found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PDF Preview Modal */}
            {showPrintPreview && selectedBill && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Bill Preview</h3>
                    <button
                      onClick={() => {
                        setShowPrintPreview(false);
                        setSelectedBill(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className="h-[800px]">
                    <PharmacyBillPDF bill={savedBills.find(b => b.id === selectedBill)!} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showPrintPreview && bill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Bill Preview</h3>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="h-[800px]">
              <PharmacyBillPDF bill={bill} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyOrders;
