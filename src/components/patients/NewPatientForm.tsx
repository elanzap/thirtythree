import React from 'react';
import type { Patient } from '../../types';
import PatientForm from '../PatientForm';
import { generatePatientId } from '../../utils/idGenerator';

interface NewPatientFormProps {
  onSubmit: (patient: Omit<Patient, 'id'>) => void;
  onClose?: () => void;
}

export const NewPatientForm: React.FC<NewPatientFormProps> = ({ onSubmit, onClose }) => {
  const handleSubmit = (patientData: Omit<Patient, 'id' | 'patientId' | 'visits'>) => {
    const newPatient = {
      ...patientData,
      patientId: generatePatientId(),
      visits: []
    };
    onSubmit(newPatient);
  };

  return <PatientForm onSubmit={handleSubmit} onClose={onClose} />;
};
