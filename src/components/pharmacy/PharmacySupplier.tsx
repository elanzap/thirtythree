import React, { useState } from 'react';
import { usePharmacyStore } from '../../stores/pharmacyStore';

interface Supplier {
  id: string;
  name: string;
}

export const PharmacySupplier: React.FC = () => {
  const { suppliers, addSupplier, removeSupplier } = usePharmacyStore();
  const [supplierInput, setSupplierInput] = useState('');

  const handleAddSupplier = () => {
    if (supplierInput.trim()) {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        name: supplierInput.trim()
      };
      addSupplier(newSupplier);
      setSupplierInput('');
    }
  };

  const handleDeleteSupplier = (id: string) => {
    removeSupplier(id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Pharmacy Supplier</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={supplierInput}
              onChange={(e) => setSupplierInput(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter supplier name"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddSupplier}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Suppliers List</h3>
          {suppliers.length === 0 ? (
            <p className="text-gray-500">No suppliers added yet</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <li key={supplier.id} className="py-4 flex justify-between items-center">
                  <span className="text-gray-900">{supplier.name}</span>
                  <button
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacySupplier;
