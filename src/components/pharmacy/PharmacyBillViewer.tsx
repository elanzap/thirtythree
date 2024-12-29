import React, { useState, useEffect } from 'react';
import { PharmacyBillPDF } from './PharmacyBillPDF';
import { PharmacyBill } from '../../types/pharmacy';

interface SavedBill extends PharmacyBill {
  id: string;
  date: string;
}

export const PharmacyBillViewer: React.FC = () => {
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);
  const [selectedBill, setSelectedBill] = useState<SavedBill | null>(null);

  useEffect(() => {
    const loadSavedBills = () => {
      const bills = localStorage.getItem('pharmacyBills');
      if (bills) {
        setSavedBills(JSON.parse(bills));
      }
    };

    loadSavedBills();
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6">
      <h2 className="text-2xl font-bold mb-6">Pharmacy Bills</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bills List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Saved Bills</h3>
          </div>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savedBills.map((bill) => (
                  <tr
                    key={bill.id}
                    onClick={() => setSelectedBill(bill)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedBill?.id === bill.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">{bill.id}</td>
                    <td className="px-4 py-3 text-sm">{bill.prescriptionId}</td>
                    <td className="px-4 py-3 text-sm">{bill.date}</td>
                    <td className="px-4 py-3 text-sm">{bill.patientName}</td>
                    <td className="px-4 py-3 text-sm text-right">{bill.discount}%</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">₹{bill.total.toFixed(2)}</td>
                  </tr>
                ))}
                {savedBills.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No saved bills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Bill Preview</h3>
          </div>
          <div className="h-[600px]">
            {selectedBill ? (
              <PharmacyBillPDF bill={selectedBill} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a bill to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
