import type { Patient, Prescription } from '../types';

const STORAGE_KEYS = {
  PATIENTS: 'medscript_patients',
  PRESCRIPTIONS: 'medscript_prescriptions'
} as const;

export const loadPatients = (): Patient[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading patients:', error);
    return [];
  }
};

export const savePatients = (patients: Patient[]): void => {
  try {
    if (!Array.isArray(patients)) {
      console.error('Invalid patients data:', patients);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  } catch (error) {
    console.error('Error saving patients:', error);
  }
};

export const loadPrescriptions = (): Prescription[] => {
  try {
    const storedPrescriptions = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    if (storedPrescriptions) {
      const parsedPrescriptions = JSON.parse(storedPrescriptions);
      console.log('Loaded Prescriptions:', parsedPrescriptions);
      console.log('Number of Loaded Prescriptions:', parsedPrescriptions.length);
      console.log('Loaded Prescription IDs:', parsedPrescriptions.map((p: Prescription) => p.prescriptionId));
      return parsedPrescriptions;
    }
    return [];
  } catch (error) {
    console.error('Error loading prescriptions:', error);
    return [];
  }
};

export const savePrescriptions = (prescriptions: Prescription[]): void => {
  try {
    console.log('Saving Prescriptions:', prescriptions);
    console.log('Number of Prescriptions to Save:', prescriptions.length);
    console.log('Prescription IDs:', prescriptions.map(p => p.prescriptionId));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
  } catch (error) {
    console.error('Error saving prescriptions:', error);
  }
};
