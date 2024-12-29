import React, { useState } from 'react';
import { FileText, Calendar, User, Printer, AlertTriangle } from 'lucide-react';
import type { Patient, Prescription } from '../../types';
import { generatePrescriptionPDF } from '../../utils/pdf/prescriptionPdfGenerator';

interface PrescriptionItemProps {
  prescription: Prescription;
  patient?: Patient;
  onEdit: (prescription: Partial<Prescription>) => void;
}

export const PrescriptionItem: React.FC<PrescriptionItemProps> = ({
  prescription,
  patient,
  onEdit,
}) => {
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleViewPDF = async () => {
    // Ensure we don't trigger multiple PDF generations
    if (isGeneratingPDF) return;

    try {
      // Reset any previous errors
      setPdfError(null);
      
      // Set loading state
      setIsGeneratingPDF(true);

      // Attempt to generate PDF
      const pdfUrl = await generatePrescriptionPDF(prescription);
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Set a user-friendly error message
      setPdfError(
        error instanceof Error 
          ? error.message 
          : 'Could not generate prescription PDF. Please try again.'
      );
    } finally {
      // Reset loading state
      setIsGeneratingPDF(false);
    }
  };

  return (
    <li className="py-5">
      <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {patient?.name || 'Unknown Patient'}
                </p>
                <p className="text-sm text-gray-500">
                  Patient ID: {prescription.patientId}
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                {new Date(prescription.date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                <p>
                  <strong>Prescription ID:</strong> {prescription.prescriptionId}
                  {prescription.visitId && (
                    <span className="ml-2 text-gray-400">
                      (Visit ID: {prescription.visitId})
                    </span>
                  )}
                </p>
                <p><strong>Diagnosis:</strong> {prescription.diagnoses?.join(', ') || 'No diagnosis'}</p>
                {prescription.medications && prescription.medications.length > 0 && (
                  <div className="mt-1">
                    <strong>Medications:</strong>
                    <ul className="ml-4 list-disc">
                      {prescription.medications.map((med, idx) => (
                        <li key={idx}>
                          {med.name} - {med.dosage} ({med.interval} for {med.duration})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex space-x-2">
            <button
              onClick={() => onEdit(prescription)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </button>
            <button
              onClick={handleViewPDF}
              disabled={isGeneratingPDF}
              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                isGeneratingPDF 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-green-700 bg-green-100 hover:bg-green-200'
              }`}
            >
              {isGeneratingPDF ? (
                <Printer className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Printer className="h-4 w-4 mr-2" />
              )}
              {isGeneratingPDF ? 'Generating...' : 'View & Print'}
            </button>
          </div>
        </div>
      </div>
      {pdfError && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {pdfError}
        </div>
      )}
    </li>
  );
};
