import React, { useState, useEffect } from 'react';
import { usePharmacyStore } from '../../stores/pharmacyStore';
import { usePrescriptionStore } from '../../stores/prescriptionStore';
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
  const { searchPrescriptions, addPrescription } = usePrescriptionStore();
  const [prescriptionId, setPrescriptionId] = useState('');
  const [bill, setBill] = useState<PharmacyBill>({
    patientName: '',
    age: '',
    gender: '',
    phoneNumber: '',
    prescriptionId: '',
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0
  });
  const [error, setError] = useState('');
  const [selectedBatches, setSelectedBatches] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState<number>(0);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'view' | 'new'>('create');
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
    phoneNumber: string;
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
              availableQuantity: selectedBatchDetails.availableQuantity !== undefined ? selectedBatchDetails.availableQuantity : selectedBatchDetails.quantity,
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
              availableQuantity: batchDetails.availableQuantity !== undefined ? batchDetails.availableQuantity : batchDetails.quantity,
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

  const handleMedicineSelect = (index: number, medicineName: string) => {
    if (bill) {
      const batches = getBatchesForMedicine(medicineName);
      const defaultBatch = batches[0];
      
      const newItems = [...bill.items];
      newItems[index] = {
        ...newItems[index],
        medicineName,
        batchNo: defaultBatch?.batchNo || '',
        expiryDate: defaultBatch?.expiryDate || '',
        availableQuantity: defaultBatch?.availableQuantity !== undefined ? defaultBatch.availableQuantity : defaultBatch?.quantity || 0,
        tax: defaultBatch?.tax || 0,
        amount: (defaultBatch?.salePrice || 0) * newItems[index].quantity
      };
      
      setBill({
        ...bill,
        items: newItems,
        subtotal: newItems.reduce((sum, item) => sum + item.amount, 0)
      });
    }
  };

  const handleAddItem = () => {
    if (bill) {
      const newItem = {
        medicineName: '',
        batchNo: '',
        expiryDate: '',
        quantity: 1,
        availableQuantity: 0,
        tax: 0,
        amount: 0
      };
      setBill({
        ...bill,
        items: [...bill.items, newItem]
      });
    }
  };

  const handleSearchPrescription = () => {
    if (!prescriptionId.trim()) {
      setError('Please enter a prescription ID');
      return;
    }

    console.log('Searching for Prescription ID:', prescriptionId);
    
    // First, try searching in the prescription store
    const prescriptionStore = usePrescriptionStore.getState();
    const storeResults = prescriptionStore.searchPrescriptions(prescriptionId);
    console.log('Store Search Results:', storeResults);
    
    // If store search fails, try loading from storage
    if (storeResults.length === 0) {
      const storedPrescriptions = loadPrescriptions();
      console.log('Stored Prescriptions:', storedPrescriptions);
      
      const manualSearchResults = storedPrescriptions.filter(p => 
        p.prescriptionId.toLowerCase() === prescriptionId.toLowerCase() ||
        p.id.toLowerCase() === prescriptionId.toLowerCase()
      );
      
      console.log('Manual Storage Search Results:', manualSearchResults);
      
      // If manual search finds something, add it back to the store
      if (manualSearchResults.length > 0) {
        manualSearchResults.forEach(prescription => {
          prescriptionStore.addPrescription(prescription);
        });
      }
      
      // If still no results, show error
      if (manualSearchResults.length === 0) {
        setError('No prescription found. Please check the ID and try again.');
        console.log('Available Prescription IDs:', storedPrescriptions.map(p => ({
          id: p.id,
          prescriptionId: p.prescriptionId
        })));
        return;
      }
      
      // Use the first matching prescription
      const prescription = manualSearchResults[0];
      
      // Prepare bill details
      const billItems = prescription.medications.map(med => {
        const [type, name, strength] = med.name.split(' ');
        const formattedName = `${type} ${name} ${strength}`;
        const availableBatches = getBatchesForMedicine(formattedName);
        
        console.log('Medicine Details:', { 
          original: med.name,
          formatted: formattedName,
          availableBatches: availableBatches
        });
        
        // Use first available batch if exists
        const defaultBatch = availableBatches.length > 0 ? availableBatches[0] : null;
        
        return {
          medicineName: formattedName,
          batchNo: defaultBatch?.batchNo || '',
          expiryDate: defaultBatch?.expiryDate || '',
          quantity: med.quantity || 1,
          availableQuantity: defaultBatch?.availableQuantity !== undefined 
            ? defaultBatch.availableQuantity 
            : defaultBatch?.quantity || 0,
          tax: defaultBatch?.tax || 0,
          amount: defaultBatch 
            ? defaultBatch.salePrice * (med.quantity || 1) 
            : 0
        };
      });
      
      const subtotal = billItems.reduce((sum, item) => sum + item.amount, 0);
      
      setBill({
        patientName: prescription.patientName,
        age: prescription.age || '',
        gender: prescription.gender || '',
        phoneNumber: prescription.phone || '',
        prescriptionId: prescription.prescriptionId,
        items: billItems,
        subtotal,
        discount: 0,
        total: subtotal
      });
      
      setError('');
      return;
    }
    
    // Use the first matching prescription from store
    const prescription = storeResults[0];
    
    // Prepare bill items
    const billItems = prescription.medications.map(med => {
      const [type, name, strength] = med.name.split(' ');
      const formattedName = `${type} ${name} ${strength}`;
      const availableBatches = getBatchesForMedicine(formattedName);
      
      console.log('Medicine Details:', { 
        original: med.name,
        formatted: formattedName,
        availableBatches: availableBatches
      });
      
      // Use first available batch if exists
      const defaultBatch = availableBatches.length > 0 ? availableBatches[0] : null;
      
      return {
        medicineName: formattedName,
        batchNo: defaultBatch?.batchNo || '',
        expiryDate: defaultBatch?.expiryDate || '',
        quantity: med.quantity || 1,
        availableQuantity: defaultBatch?.availableQuantity !== undefined 
          ? defaultBatch.availableQuantity 
          : defaultBatch?.quantity || 0,
        tax: defaultBatch?.tax || 0,
        amount: defaultBatch 
          ? defaultBatch.salePrice * (med.quantity || 1) 
          : 0
      };
    });
    
    const subtotal = billItems.reduce((sum, item) => sum + item.amount, 0);
    
    setBill({
      patientName: prescription.patientName,
      age: prescription.age || '',
      gender: prescription.gender || '',
      phoneNumber: prescription.phone || '',
      prescriptionId: prescription.prescriptionId,
      items: billItems,
      subtotal,
      discount: 0,
      total: subtotal
    });
    
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

    if (!bill.patientName.trim()) {
      setError('Please enter patient name');
      return;
    }

    if (bill.items.length === 0) {
      setError('Please add at least one medicine to the bill');
      return;
    }

    // Create new bill with current discount
    const currentBill = {
      ...bill,
      discount,
      total: bill.subtotal * (1 - discount / 100)
    };

    // Save bill to localStorage with sequential bill number
    const newBill = {
      id: getNextBillNumber(),
      prescriptionId: currentBill.prescriptionId,
      patientName: currentBill.patientName,
      phoneNumber: currentBill.phoneNumber,
      date: new Date().toLocaleDateString(),
      total: currentBill.total,
      discount: currentBill.discount,
      items: currentBill.items,
      subtotal: currentBill.subtotal,
      age: currentBill.age,
      gender: currentBill.gender
    };

    // Update available quantities in pharmacy store
    try {
      currentBill.items.forEach(item => {
        usePharmacyStore.getState().updatePharmacyItemQuantity(
          item.medicineName,
          item.batchNo,
          item.quantity
        );
      });

      const updatedBills = [newBill, ...savedBills];
      setSavedBills(updatedBills);
      localStorage.setItem('pharmacyBills', JSON.stringify(updatedBills));

      // Show print preview with current bill
      setBill(currentBill);
      setShowPrintPreview(true);
      setError('');
    } catch (err) {
      setError('Failed to save bill. Please try again.');
      console.error('Error saving bill:', err);
    }
  };

  const handleNewOrder = () => {
    const newBill: PharmacyBill = {
      patientName: '',
      age: '',
      gender: '',
      phoneNumber: '',
      prescriptionId: '',
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0
    };
    setBill(newBill);
    setError('');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6">
      <h2 className="text-2xl font-bold mb-6">Pharmacy Orders</h2>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('create');
                setBill({
                  patientName: '',
                  age: '',
                  gender: '',
                  phoneNumber: '',
                  prescriptionId: '',
                  items: [],
                  subtotal: 0,
                  discount: 0,
                  total: 0
                });
                setPrescriptionId('');
                setError('');
              }}
              className={`${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Create Order
            </button>
            <button
              onClick={() => {
                setActiveTab('new');
                handleNewOrder();
              }}
              className={`${
                activeTab === 'new'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              New Order
            </button>
            <button
              onClick={() => {
                setActiveTab('view');
                setBill({
                  patientName: '',
                  age: '',
                  gender: '',
                  phoneNumber: '',
                  prescriptionId: '',
                  items: [],
                  subtotal: 0,
                  discount: 0,
                  total: 0
                });
                setPrescriptionId('');
                setError('');
              }}
              className={`${
                activeTab === 'view'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              View Bills
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'create' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="prescriptionId" className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription ID
                </label>
                <input
                  type="text"
                  id="prescriptionId"
                  value={prescriptionId}
                  onChange={(e) => setPrescriptionId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter Prescription ID"
                />
              </div>
              <button
                onClick={handleSearchPrescription}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Search Prescription
              </button>
            </div>

            {error && (
              <div className="mt-4 text-red-600 text-sm">{error}</div>
            )}
          </div>

          {bill && (
            <div className="mt-6 bg-white rounded-lg shadow">
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

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    {bill.items.length} items in bill
                  </div>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Medicine
                  </button>
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
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {bill.items.map((item, index) => {
                        const batches = getBatchesForMedicine(item.medicineName);
                        const selectedBatch = selectedBatches[item.medicineName] || item.batchNo;
                        const currentBatchDetails = batches.find(b => b.batchNo === selectedBatch);
                        const availableQty = currentBatchDetails?.availableQuantity !== undefined ? currentBatchDetails.availableQuantity : currentBatchDetails?.quantity || 0;

                        return (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <select
                                value={item.medicineName}
                                onChange={(e) => handleMedicineSelect(index, e.target.value)}
                                className="border rounded px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">Select Medicine</option>
                                <optgroup label="All Medicines">
                                  {Array.from(new Set(pharmacyItems.map(item => item.medicineName))).map((name, idx) => (
                                    <option key={`medicine-${idx}`} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={selectedBatch}
                                onChange={(e) => handleBatchSelect(item.medicineName, e.target.value)}
                                className="border rounded px-3 py-1.5 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">Select Batch</option>
                                {batches.map(batch => (
                                  <option key={batch.batchNo} value={batch.batchNo}>
                                    Batch {batch.batchNo} (Qty: {batch.quantity})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">{currentBatchDetails?.expiryDate || ''}</td>
                            <td className="px-4 py-3 text-right">{availableQty}</td>
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
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  const newItems = bill.items.filter((_, i) => i !== index);
                                  const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
                                  setBill({
                                    ...bill,
                                    items: newItems,
                                    subtotal,
                                    total: subtotal * (1 - bill.discount / 100)
                                  });
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Remove Item"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 space-y-4">
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

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={saveBillAndGeneratePdf}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={!bill || bill.items.length === 0}
                  >
                    Save Bill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'new' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                  Patient Name
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={bill?.patientName || ''}
                  onChange={(e) => bill && setBill({ ...bill, patientName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={bill?.phoneNumber || ''}
                  onChange={(e) => bill && setBill({ ...bill, phoneNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="text"
                  id="age"
                  value={bill?.age || ''}
                  onChange={(e) => bill && setBill({ ...bill, age: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  value={bill?.gender || ''}
                  onChange={(e) => bill && setBill({ ...bill, gender: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mt-4 text-red-600 text-sm">{error}</div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {bill?.items.length || 0} items in bill
              </div>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Medicine
              </button>
            </div>

            {bill?.items && bill.items.length > 0 && (
              <div className="mt-6">
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
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {bill.items.map((item, index) => {
                        const batches = getBatchesForMedicine(item.medicineName);
                        const selectedBatch = selectedBatches[item.medicineName] || item.batchNo;
                        const currentBatchDetails = batches.find(b => b.batchNo === selectedBatch);
                        const availableQty = currentBatchDetails?.availableQuantity !== undefined ? currentBatchDetails.availableQuantity : currentBatchDetails?.quantity || 0;

                        return (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <select
                                value={item.medicineName}
                                onChange={(e) => handleMedicineSelect(index, e.target.value)}
                                className="border rounded px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">Select Medicine</option>
                                <optgroup label="All Medicines">
                                  {Array.from(new Set(pharmacyItems.map(item => item.medicineName))).map((name, idx) => (
                                    <option key={`medicine-${idx}`} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={selectedBatch}
                                onChange={(e) => handleBatchSelect(item.medicineName, e.target.value)}
                                className="border rounded px-3 py-1.5 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">Select Batch</option>
                                {batches.map(batch => (
                                  <option key={batch.batchNo} value={batch.batchNo}>
                                    Batch {batch.batchNo} (Qty: {batch.quantity})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">{currentBatchDetails?.expiryDate || ''}</td>
                            <td className="px-4 py-3 text-right">{availableQty}</td>
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
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  const newItems = bill.items.filter((_, i) => i !== index);
                                  const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
                                  setBill({
                                    ...bill,
                                    items: newItems,
                                    subtotal,
                                    total: subtotal * (1 - bill.discount / 100)
                                  });
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Remove Item"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 space-y-4">
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

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={saveBillAndGeneratePdf}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={!bill || bill.items.length === 0}
                  >
                    Save Bill
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'view' && (
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
