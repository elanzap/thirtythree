import React, { useState } from 'react';
import Layout from './components/Layout';
import { PatientList } from './components/patients/PatientList';
import { PrescriptionList } from './components/prescription/PrescriptionList';
import { LabOrderInvoice } from './components/lab-orders/LabOrderInvoice';
import { PharmacySupplier } from './components/pharmacy/PharmacySupplier';
import { AddToPharmacy } from './components/pharmacy/AddToPharmacy';
import { PharmacyOrders } from './components/pharmacy/PharmacyOrders';
import { ConsultationBill } from './components/consultation/ConsultationBill';
import { DoctorList } from './components/doctors/DoctorList';
import { DiagnosisManager } from './components/diagnosis/DiagnosisManager';
import { DiagnosticTestList } from './components/diagnostic-tests/DiagnosticTestList';
import { DoseDurationManager } from './components/duration/DoseDurationManager';
import { DoseIntervalManager } from './components/interval/DoseIntervalManager';
import { DosageManager } from './components/dosage/DosageManager';
import { DrugList } from './components/drugs/DrugList';
import { PrescriptionForm } from './components/prescription/PrescriptionForm';
import type { Patient, Prescription } from './types';
import { usePatientStore } from './stores/patientStore';
import { usePrescriptionStore } from './stores/prescriptionStore';

const App: React.FC = () => {
  const { patients } = usePatientStore();
  const { 
    prescriptions, 
    addPrescription, 
    updatePrescription 
  } = usePrescriptionStore();
  
  const [activeSection, setActiveSection] = useState('patients');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handlePrescriptionSubmit = (prescriptionData: Partial<Prescription>) => {
    if (!selectedPatient) return;

    try {
      const newPrescription = addPrescription({
        ...prescriptionData,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        gender: selectedPatient.gender,
        age: selectedPatient.age.toString(),
        phone: selectedPatient.phoneNumber,
      });

      // Optional: Generate PDF or perform additional actions
      // generatePrescriptionPDF(newPrescription);

      setSelectedPatient(null);
      setActiveSection('prescriptions');
    } catch (error) {
      console.error('Failed to add prescription:', error);
      // Optionally show error to user
    }
  };

  const handleUpdatePrescription = (id: string, updatedPrescription: Partial<Prescription>) => {
    try {
      updatePrescription(id, updatedPrescription);
    } catch (error) {
      console.error('Failed to update prescription:', error);
      // Optionally show error to user
    }
  };

  const renderContent = () => {
    if (selectedPatient) {
      return (
        <>
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                New Prescription for {selectedPatient.name}
              </h2>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Patients
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <PrescriptionForm
              patientId={selectedPatient.id}
              onSubmit={handlePrescriptionSubmit}
            />
          </div>
        </>
      );
    }

    switch (activeSection) {
      case 'patients':
        return (
          <div className="space-y-6">
            <PatientList 
              patients={patients || []}
              prescriptions={prescriptions || []}
              onSelectPatient={setSelectedPatient}
            />
          </div>
        );
      
      case 'prescriptions':
        return (
          <div className="space-y-6">
            <PrescriptionList 
              prescriptions={prescriptions || []}
              onUpdatePrescription={handleUpdatePrescription}
              patients={patients || []}
            />
          </div>
        );

      case 'lab-orders':
        return (
          <div className="space-y-6">
            <LabOrderInvoice prescriptions={prescriptions || []} />
          </div>
        );

      case 'pharmacy-supplier':
        return <PharmacySupplier />;
      
      case 'add-to-pharmacy':
        return <AddToPharmacy />;
      
      case 'pharmacy-orders':
        return <PharmacyOrders />;
      
      case 'consultation-bill':
        return <ConsultationBill />;
      
      case 'doctors':
        return <DoctorList />;
      
      case 'diagnosis':
        return <DiagnosisManager />;
      
      case 'diagnostic-tests':
        return <DiagnosticTestList />;
      
      case 'dose-duration':
        return <DoseDurationManager />;
      
      case 'dose-interval':
        return <DoseIntervalManager />;
      
      case 'dosage':
        return <DosageManager />;
      
      case 'drugs':
        return <DrugList />;
      
      default:
        return (
          <div className="space-y-6">
            <PatientList 
              patients={patients || []}
              prescriptions={prescriptions || []}
              onSelectPatient={setSelectedPatient}
            />
          </div>
        );
    }
  };

  return (
    <Layout 
      activeSection={activeSection} 
      onNavigate={setActiveSection}
    >
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
