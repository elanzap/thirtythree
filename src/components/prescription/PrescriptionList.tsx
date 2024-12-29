import React, { useState } from 'react';
import { FileText, Search, Filter } from 'lucide-react';
import type { Patient, Prescription } from '../../types';
import { PrescriptionItem } from './PrescriptionItem';
import { usePrescriptionStore } from '../../stores/prescriptionStore';
import { usePatientStore } from '../../stores/patientStore';

export const PrescriptionList: React.FC = () => {
  const { prescriptions, updatePrescription, deletePrescription } = usePrescriptionStore();
  const { patients } = usePatientStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prescription.prescriptionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDateRange = (!dateFilter.startDate || new Date(prescription.date) >= new Date(dateFilter.startDate)) &&
                             (!dateFilter.endDate || new Date(prescription.date) <= new Date(dateFilter.endDate));
    
    return matchesSearch && matchesDateRange;
  });

  const handleUpdatePrescription = (id: string, updatedPrescription: Partial<Prescription>) => {
    updatePrescription(id, updatedPrescription);
  };

  const handleDeletePrescription = (id: string) => {
    deletePrescription(id);
  };

  if (filteredPrescriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new prescription for a patient.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Section */}
      <div className="flex space-x-4 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flow-root">
        <ul className="-my-5 divide-y divide-gray-200">
          {filteredPrescriptions.map((prescription) => (
            <PrescriptionItem
              key={prescription.id}
              prescription={prescription}
              patient={patients.find(p => p.id === prescription.patientId)}
              onEdit={(updatedPrescription) => handleUpdatePrescription(prescription.id!, updatedPrescription)}
              onDelete={() => handleDeletePrescription(prescription.id!)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};
