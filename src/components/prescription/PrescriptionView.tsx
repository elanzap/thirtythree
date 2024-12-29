import React from 'react';
import { Pencil, Printer, FileDown, Activity } from 'lucide-react';
import type { Prescription } from '../../types';
import { formatPrescriptionDetails } from '../../utils/prescriptionFormatter';
import { generatePrescriptionPDF } from '../../utils/pdfGenerator';

interface PrescriptionViewProps {
  prescription: Partial<Prescription>;
  onClose: () => void;
  onEdit?: () => void;
}

export const PrescriptionView: React.FC<PrescriptionViewProps> = ({
  prescription,
  onClose,
  onEdit,
}) => {
  const details = formatPrescriptionDetails(prescription);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePrescriptionPDF(prescription);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const renderVitalSignsCard = () => {
    const { vitalSigns } = prescription;
    if (!vitalSigns) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="mr-3 text-gray-500" /> Vital Signs
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
            <p className="text-lg font-semibold text-gray-900">
              {vitalSigns.bloodPressure || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pulse Rate</p>
            <p className="text-lg font-semibold text-gray-900">
              {vitalSigns.pulseRate ? `${vitalSigns.pulseRate} bpm` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Temperature</p>
            <p className="text-lg font-semibold text-gray-900">
              {vitalSigns.temperature ? `${vitalSigns.temperature}°F` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Weight</p>
            <p className="text-lg font-semibold text-gray-900">
              {vitalSigns.weight ? `${vitalSigns.weight} kg` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Prescription Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {renderVitalSignsCard()}

          <div className="space-y-6">
            {Object.entries(details).map(([section, content]) => (
              section !== 'Vital Signs' && (
                <div key={section} className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{section}</h3>
                  <div className="text-gray-600 whitespace-pre-line">{content}</div>
                </div>
              )
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
