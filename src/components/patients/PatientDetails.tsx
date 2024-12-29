import React, { useState, useEffect } from 'react';
import { 
  User, FileText, ArrowLeft, Plus, Activity, Eye, Printer, 
  Stethoscope, Pill, TestTubes, Heart, Thermometer, Scale, 
  Clock, BarChart, Phone 
} from 'lucide-react';
import type { Patient, Prescription, LabTest } from '../../types';
import { PrescriptionView } from '../prescription/PrescriptionView';
import { usePrescriptionStore } from '../../stores/prescriptionStore';

interface PatientDetailsProps {
  patient: Patient;
  onBack: () => void;
  onNewPrescription: (patientId: string) => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  onBack,
  onNewPrescription,
}) => {
  const { getPrescriptionsByPatient } = usePrescriptionStore();
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const patientPrescriptions = getPrescriptionsByPatient(patient.id);
    console.log('Patient Prescriptions:', {
      patientId: patient.id,
      prescriptionsCount: patientPrescriptions.length,
      prescriptions: patientPrescriptions
    });

    // Additional detailed logging for lab tests
    patientPrescriptions.forEach((prescription, index) => {
      console.log(`Prescription ${index + 1} Lab Tests:`, prescription.labTests);
      console.log(`Prescription ${index + 1} Raw Data:`, prescription);
    });

    setPrescriptions(patientPrescriptions);
  }, [patient.id, getPrescriptionsByPatient]);

  const handleViewDetails = (prescription: Prescription) => {
    setViewingPrescription(prescription);
  };

  const handleViewPDF = (prescription: Prescription) => {
    if (prescription.pdfUrl) {
      window.open(prescription.pdfUrl, '_blank');
    }
  };

  const renderVitalSigns = (vitalSigns?: any) => {
    if (!vitalSigns) return null;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center border-b border-gray-200 pb-3 mb-3">
          <Stethoscope className="mr-3 h-5 w-5 text-blue-500" />
          <h4 className="text-sm font-semibold text-gray-700">Vital Signs</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Blood Pressure */}
          <div className="flex items-center bg-red-50 rounded-md p-3">
            <Heart className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <span className="text-xs text-red-600 block">Blood Pressure</span>
              <span className="text-sm font-medium text-gray-800">
                {vitalSigns.bloodPressure || 
                 <span className="text-gray-400">Not Recorded</span>}
              </span>
            </div>
          </div>

          {/* Pulse Rate */}
          <div className="flex items-center bg-green-50 rounded-md p-3">
            <Clock className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <span className="text-xs text-green-600 block">Pulse Rate</span>
              <span className="text-sm font-medium text-gray-800">
                {vitalSigns.pulseRate ? 
                 `${vitalSigns.pulseRate} bpm` : 
                 <span className="text-gray-400">Not Recorded</span>}
              </span>
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-center bg-orange-50 rounded-md p-3">
            <Thermometer className="h-5 w-5 text-orange-500 mr-3" />
            <div>
              <span className="text-xs text-orange-600 block">Temperature</span>
              <span className="text-sm font-medium text-gray-800">
                {vitalSigns.temperature ? 
                 `${vitalSigns.temperature}°C` : 
                 <span className="text-gray-400">Not Recorded</span>}
              </span>
            </div>
          </div>

          {/* Weight */}
          <div className="flex items-center bg-purple-50 rounded-md p-3">
            <Scale className="h-5 w-5 text-purple-500 mr-3" />
            <div>
              <span className="text-xs text-purple-600 block">Weight</span>
              <span className="text-sm font-medium text-gray-800">
                {vitalSigns.weight ? 
                 `${vitalSigns.weight} kg` : 
                 <span className="text-gray-400">Not Recorded</span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMedications = (medications?: any[]) => {
    if (!medications || medications.length === 0) return null;
    
    return (
      <div className="bg-blue-50 p-3 rounded-lg mb-2">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Pill className="mr-2 h-4 w-4 text-blue-500" /> Medications
        </h4>
        <div className="space-y-1 text-xs text-gray-600">
          {medications.map((med, index) => (
            <div key={index} className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Pill className="h-3 w-3 text-gray-400" />
                <span>{med.name}</span>
              </div>
              <div className="text-right">
                <span>{med.dosage}</span>
                {med.frequency && <span className="ml-2 text-gray-500">({med.frequency})</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLabTests = (labTests?: LabTest[] | string[]) => {
    // Extensive logging for lab tests
    console.log('Rendering Lab Tests:', labTests);

    if (!labTests || labTests.length === 0) {
      console.warn('No lab tests found or labTests is undefined');
      return null;
    }
    
    return (
      <div className="bg-green-50 p-3 rounded-lg mb-2">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <TestTubes className="mr-2 h-4 w-4 text-green-500" /> Lab Tests
        </h4>
        <div className="space-y-1 text-xs text-gray-600">
          {labTests.map((test, index) => {
            // Log each test for debugging
            console.log(`Lab Test ${index + 1}:`, test);

            // Handle both string and LabTest types
            let testName: string;
            let testResult: string | null;

            if (typeof test === 'string') {
              // If it's a string, use the string as the name
              testName = test;
              testResult = null;
            } else {
              // If it's a LabTest object
              testName = test.name || 'Unnamed Test';
              testResult = test.result === 'Pending' ? null : test.result || null;
            }

            return (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <BarChart className="h-3 w-3 text-gray-400" />
                  <span>{testName}</span>
                </div>
                <div className="text-right">
                  {testResult && (
                    <span className={`
                      ${testResult === 'Normal' ? 'text-green-600' : 
                        testResult === 'Abnormal' ? 'text-red-600' : 'text-gray-500'}
                    `}>
                      {testResult}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleNewPrescription = () => {
    onNewPrescription(patient.patientId);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{patient.name}</h2>
              <p className="text-xs text-gray-500">Patient ID: {patient.patientId}</p>
            </div>
          </div>
          <button 
            onClick={handleNewPrescription}
            className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md text-sm hover:bg-indigo-100 transition-colors"
          >
            New Prescription
          </button>
        </div>
        
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <span className="block text-xs text-gray-500 mb-1">Age</span>
              <span className="text-sm text-gray-700">
                {patient.age} years
              </span>
            </div>
            
            <div>
              <span className="block text-xs text-gray-500 mb-1">Gender</span>
              <span className="text-sm text-gray-700">
                {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
              </span>
            </div>
            
            <div>
              <span className="block text-xs text-gray-500 mb-1">Phone</span>
              <span className="text-sm text-gray-700">
                {patient.phoneNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription History Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Prescription History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {prescriptions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No prescriptions found for this patient.
            </div>
          ) : (
            prescriptions.map((prescription) => (
              <div 
                key={prescription.id} 
                className="bg-white shadow rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FileText className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Prescription ID: {prescription.prescriptionId}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(prescription.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {renderVitalSigns(prescription.vitalSigns)}
                    {renderMedications(prescription.medications)}
                    {renderLabTests(prescription.labTests)}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewDetails(prescription)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleViewPDF(prescription)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Printer className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {viewingPrescription && (
        <PrescriptionView 
          prescription={viewingPrescription}
          onClose={() => setViewingPrescription(null)}
          onEdit={() => {/* Implement edit functionality */}}
        />
      )}
    </div>
  );
};
