import React, { useState, useEffect } from 'react';
import { useDoctorStore } from '../../stores/doctorStore';
import { usePrescriptionStore } from '../../stores/prescriptionStore';

interface ConsultationBill {
  id: string;
  prescriptionId: string;
  patientName: string;
  age: string;
  gender: string;
  phoneNumber: string;
  doctorName: string;
  consultationFee: number;
  subtotal: number;
  discount: number;
  total: number;
  date: string;
}

export const ConsultationBill: React.FC = () => {
  const [prescriptionId, setPrescriptionId] = useState('');
  const [bill, setBill] = useState<ConsultationBill | null>(null);
  const [error, setError] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [savedBills, setSavedBills] = useState<ConsultationBill[]>([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [foundPrescriptions, setFoundPrescriptions] = useState<any[]>([]);
  const { doctors } = useDoctorStore();
  const { searchPrescriptions, addPrescription, debugPrintPrescriptions } = usePrescriptionStore();

  useEffect(() => {
    const bills = localStorage.getItem('consultationBills');
    if (bills) {
      setSavedBills(JSON.parse(bills));
    }
    // Log available prescriptions on component mount
    const storeSearchResults = searchPrescriptions('');
    console.log('Store Search Results:', storeSearchResults);
  }, []);

  const getNextBillNumber = () => {
    if (savedBills.length === 0) return 'CN1';
    const lastBill = savedBills[0]; // Bills are stored newest first
    const lastNumber = parseInt(lastBill.id.replace('CN', ''));
    return `CN${lastNumber + 1}`;
  };

  const generateBill = () => {
    if (!prescriptionId.trim()) {
      setError('Please enter a prescription ID');
      return;
    }

    const storeResults = searchPrescriptions(prescriptionId);
    console.log('Store Search Results:', storeResults);
    
    const prescription = storeResults[0];
    if (!prescription) {
      setError(`Prescription not found. Please check the ID and try again.`);
      return;
    }

    // Find the doctor's consultation fee from doctorStore
    const doctor = doctors.find(d => d.name === prescription.doctorName);
    const consultationFee = doctor?.consultationFee || prescription.doctorConsultationFee || 500; // Use doctor's fee, prescription fee, or default to 500
    const feeType = doctor?.consultationFeeType || prescription.doctorConsultationFeeType || 'Pay';

    // If it's a review, set fee to 0
    const finalFee = feeType === 'Review' ? 0 : consultationFee;
    const subtotal = finalFee;

    const newBill: ConsultationBill = {
      id: getNextBillNumber(),
      prescriptionId: prescriptionId,
      patientName: prescription.patientName || '',
      age: prescription.age?.toString() || '',
      gender: prescription.gender || '',
      phoneNumber: prescription.phoneNumber || '',
      doctorName: prescription.doctorName || '',
      consultationFee: finalFee,
      subtotal,
      discount: 0,
      total: subtotal,
      date: new Date().toLocaleDateString()
    };

    console.log('Generated Bill:', newBill);
    console.log('Prescription Details:', prescription);
    setBill(newBill);
    setError('');
  };

  const handleDiscountChange = (value: string) => {
    const newDiscount = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
    setDiscount(newDiscount);
    
    if (bill) {
      setBill({
        ...bill,
        discount: newDiscount,
        total: bill.subtotal * (1 - newDiscount / 100)
      });
    }
  };

  const saveBill = () => {
    if (!bill) return;

    if (!bill.patientName.trim()) {
      setError('Please enter patient name');
      return;
    }

    try {
      const updatedBills = [bill, ...savedBills];
      setSavedBills(updatedBills);
      localStorage.setItem('consultationBills', JSON.stringify(updatedBills));
      setShowPrintPreview(true);
      window.print(); // Automatically open print dialog
      setError('');
    } catch (err) {
      setError('Failed to save bill. Please try again.');
      console.error('Error saving bill:', err);
    }
  };

  const BillPreview = ({ bill }: { bill: ConsultationBill }) => (
    <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto bill-preview">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Consultation Bill</h2>
      </div>

      <div className="border-b pb-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Bill No: <span className="font-medium text-black">{bill.id}</span></p>
            <p className="text-gray-600">Prescription ID: <span className="font-medium text-black">{bill.prescriptionId}</span></p>
            <p className="text-gray-600">Date: <span className="font-medium text-black">{bill.date}</span></p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Doctor: <span className="font-medium text-black">{bill.doctorName}</span></p>
          </div>
        </div>
      </div>

      <div className="border-b pb-4 mb-4">
        <h3 className="font-semibold mb-2">Patient Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <p className="text-gray-600">Name: <span className="font-medium text-black">{bill.patientName}</span></p>
          <p className="text-gray-600">Age: <span className="font-medium text-black">{bill.age}</span></p>
          <p className="text-gray-600">Gender: <span className="font-medium text-black">{bill.gender}</span></p>
          <p className="text-gray-600">Phone: <span className="font-medium text-black">{bill.phoneNumber}</span></p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Consultation Fee:</span>
          <span className="font-medium text-black">₹{bill.consultationFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium text-black">₹{bill.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Discount ({bill.discount}%):</span>
          <span className="font-medium text-black">-₹{(bill.subtotal * (bill.discount / 100)).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-3">
          <span>Total Amount:</span>
          <span>₹{bill.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">Thank you for visiting!</p>
      </div>
    </div>
  );

  const handleSearch = () => {
    console.log('Searching for prescription ID:', prescriptionId);
    debugPrintPrescriptions();
    const storeResults = searchPrescriptions(prescriptionId);
    console.log('Store Search Results:', storeResults);
    
    setFoundPrescriptions(storeResults);
  };

  // Add a method to manually add a prescription for debugging
  const addTestPrescription = () => {
    const testPrescription = {
      patientId: 'test-patient-id',
      patientName: 'Test Patient',
      diagnoses: ['Test Diagnosis'],
      medications: [],
    };
    const addedPrescription = addPrescription(testPrescription);
    console.log('Added Test Prescription:', addedPrescription);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6">
      <div className="no-print">
        <h2 className="text-2xl font-bold mb-6">Consultation Bills</h2>

        {!showPrintPreview && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setBill(null);
                    setPrescriptionId('');
                    setError('');
                  }}
                  className={`${
                    activeTab === 'create'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Create Bill
                </button>
                <button
                  onClick={() => {
                    setActiveTab('view');
                    setBill(null);
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
        )}

        {showPrintPreview && bill ? (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => {
                  setShowPrintPreview(false);
                  setBill(null);
                  setPrescriptionId('');
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Print Bill
                </button>
                <button
                  onClick={() => {
                    setShowPrintPreview(false);
                    setActiveTab('create');
                    setBill(null);
                    setPrescriptionId('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Create New Bill
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {showPrintPreview && bill ? (
        <BillPreview bill={bill} />
      ) : activeTab === 'create' ? (
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
                onClick={generateBill}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Generate Bill
              </button>
              <button
                onClick={addTestPrescription}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Add Test Prescription
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
                    <p className="text-gray-600">Bill ID: {bill.id}</p>
                    <p className="text-gray-600">Prescription ID: {bill.prescriptionId}</p>
                    <p className="text-gray-600">Patient: {bill.patientName}</p>
                    <p className="text-gray-600">Doctor: {bill.doctorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Date: {bill.date}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-medium">₹{bill.consultationFee.toFixed(2)}</span>
                  </div>
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
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total:</span>
                    <span>₹{bill.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={saveBill}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Save Bill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {savedBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-4 py-3">{bill.id}</td>
                    <td className="px-4 py-3">{bill.date}</td>
                    <td className="px-4 py-3">{bill.patientName}</td>
                    <td className="px-4 py-3">{bill.doctorName}</td>
                    <td className="px-4 py-3 text-right">₹{bill.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationBill;
