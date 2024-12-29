import React, { useState, useEffect } from 'react';
import { usePharmacyStore } from '../../stores/pharmacyStore';
import { useDrugStore } from '../../stores/drugStore';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface MedicineEntry {
  id: string;
  medicineName: string;
  drugId: string;
  batchNo: string;
  expiryDate: string;
  quantity: string;
  purchasePrice: string;
  salePrice: string;
  tax: string;
  amount: number;
}

export const AddToPharmacy: React.FC = () => {
  const { suppliers, pharmacyItems, addPharmacyItem } = usePharmacyStore();
  const { drugs } = useDrugStore();
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [medicines, setMedicines] = useState<MedicineEntry[]>([]);
  const [discount, setDiscount] = useState('0');

  // Group pharmacy items by supplier
  const groupedItems = pharmacyItems.reduce((acc, item) => {
    if (!acc[item.supplier]) {
      acc[item.supplier] = [];
    }
    acc[item.supplier].push(item);
    return acc;
  }, {} as Record<string, typeof pharmacyItems>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const addNewRow = () => {
    setMedicines([
      ...medicines,
      {
        id: Date.now().toString(),
        medicineName: '',
        drugId: '',
        batchNo: '',
        expiryDate: '',
        quantity: '',
        purchasePrice: '',
        salePrice: '',
        tax: '',
        amount: 0
      }
    ]);
  };

  const removeRow = (id: string) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const handleMedicineChange = (id: string, field: keyof MedicineEntry, value: string) => {
    setMedicines(medicines.map(med => {
      if (med.id === id) {
        const updatedMed = { ...med, [field]: value };
        // Calculate amount if quantity or price changes
        if (field === 'quantity' || field === 'purchasePrice' || field === 'tax') {
          const quantity = parseFloat(updatedMed.quantity) || 0;
          const price = parseFloat(updatedMed.purchasePrice) || 0;
          const tax = parseFloat(updatedMed.tax) || 0;
          const subtotal = quantity * price;
          const taxAmount = (subtotal * tax) / 100;
          updatedMed.amount = subtotal + taxAmount;
        }
        return updatedMed;
      }
      return med;
    }));
  };

  const calculateTotals = () => {
    const subtotal = medicines.reduce((sum, med) => sum + (med.amount || 0), 0);
    const discountAmount = (subtotal * (parseFloat(discount) || 0)) / 100;
    const totalTax = medicines.reduce((sum, med) => {
      const quantity = parseFloat(med.quantity) || 0;
      const price = parseFloat(med.purchasePrice) || 0;
      const tax = parseFloat(med.tax) || 0;
      return sum + ((quantity * price * tax) / 100);
    }, 0);
    const total = subtotal - discountAmount;

    return { subtotal, discountAmount, totalTax, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSupplier && medicines.length > 0) {
      medicines.forEach(medicine => {
        if (medicine.medicineName && medicine.batchNo) {
          addPharmacyItem({
            id: Date.now().toString(),
            supplier: selectedSupplier,
            medicineName: medicine.medicineName,
            batchNo: medicine.batchNo,
            expiryDate: medicine.expiryDate,
            quantity: parseFloat(medicine.quantity) || 0,
            purchasePrice: parseFloat(medicine.purchasePrice) || 0,
            salePrice: parseFloat(medicine.salePrice) || 0,
            tax: parseFloat(medicine.tax) || 0,
            amount: medicine.amount
          });
        }
      });
      setMedicines([]);
      setSelectedSupplier('');
      setDiscount('0');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add to Pharmacy</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        {/* Supplier Selection */}
        <div className="mb-6">
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
            Select Supplier *
          </label>
          <select
            id="supplier"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        {/* Medicines Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicine Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch No</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purchase Price</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax %</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {medicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td className="px-3 py-2">
                    <select
                      value={medicine.drugId}
                      onChange={(e) => {
                        const selectedDrug = drugs.find(d => d.id === e.target.value);
                        if (selectedDrug) {
                          // Format medicine name consistently: Type. Name Strength
                          const formattedName = `${selectedDrug.type}. ${selectedDrug.name} ${selectedDrug.strength}`;
                          const updatedMedicine = {
                            ...medicine,
                            drugId: e.target.value,
                            medicineName: formattedName
                          };
                          setMedicines(medicines.map(med => 
                            med.id === medicine.id ? updatedMedicine : med
                          ));
                        }
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Select Medicine</option>
                      {drugs.map((drug) => (
                        <option key={drug.id} value={drug.id}>
                          {drug.name} - {drug.type} - {drug.strength}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={medicine.batchNo}
                      onChange={(e) => handleMedicineChange(medicine.id, 'batchNo', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={medicine.expiryDate}
                      onChange={(e) => handleMedicineChange(medicine.id, 'expiryDate', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={medicine.quantity}
                      onChange={(e) => handleMedicineChange(medicine.id, 'quantity', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={medicine.purchasePrice}
                      onChange={(e) => handleMedicineChange(medicine.id, 'purchasePrice', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={medicine.salePrice}
                      onChange={(e) => handleMedicineChange(medicine.id, 'salePrice', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={medicine.tax}
                      onChange={(e) => handleMedicineChange(medicine.id, 'tax', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-gray-900">₹{medicine.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(medicine.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={addNewRow}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>
        </div>

        {/* Totals Section */}
        <div className="border-t pt-4 mt-6">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Sub Total:</span>
              <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <span>%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Tax:</span>
              <span className="font-medium">₹{totals.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </form>

      {/* Added Items List */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Added Items</h3>
        {Object.entries(groupedItems).map(([supplierId, items]) => {
          const supplier = suppliers.find(s => s.id === supplierId);
          return (
            <div key={supplierId} className="mb-6 bg-white rounded-lg shadow">
              <div className="px-4 py-3 bg-gray-50 rounded-t-lg border-b">
                <h4 className="text-lg font-medium text-gray-900">
                  Supplier: {supplier?.name || 'Unknown'}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Expiry
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => {
                      const drug = drugs.find(d => d.id === item.drugId);
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900">{item.medicineName}</div>
                              {drug && (
                                <div className="text-sm text-gray-500">
                                  {drug.type} - {drug.strength}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{item.batchNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                            {formatDate(item.expiryDate)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{item.quantity}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{item.availableQuantity || item.quantity}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">₹{item.purchasePrice}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">₹{item.salePrice}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{item.tax}%</td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            ₹{item.amount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-4 py-3 text-right font-medium">
                        Total Amount:
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        ₹{items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AddToPharmacy;
