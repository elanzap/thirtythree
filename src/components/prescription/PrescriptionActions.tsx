import React from 'react';
import { Save, Printer } from 'lucide-react';
import type { Prescription } from '../../types';
import { generatePrescriptionPDF } from '../../utils/pdf/prescriptionPdfGenerator';

interface PrescriptionActionsProps {
  prescription: Partial<Prescription>;
  onSave: (prescription: Partial<Prescription>) => void;
}

export const PrescriptionActions: React.FC<PrescriptionActionsProps> = ({
  prescription,
  onSave,
}) => {
  const handleSaveAndPrint = async () => {
    try {
      // Generate PDF inline
      await generatePrescriptionPDF(prescription, 'inline');
      
      // Prepare prescription data for saving
      const updatedPrescription = {
        ...prescription,
        date: new Date().toISOString(), // Add current timestamp
        status: 'completed'
      };

      // Save the prescription
      onSave(updatedPrescription);
    } catch (error) {
      console.error('Error generating prescription PDF:', error);
      alert('Error generating prescription PDF. Please try again.');
    }
  };

  return (
    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={handleSaveAndPrint}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Save className="h-4 w-4 mr-2" />
        Save & Print
      </button>
    </div>
  );
};
