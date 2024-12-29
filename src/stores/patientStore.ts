import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Patient } from '../types';

// Fallback UUID generation if import fails
const generateUUID = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

const safeUUID = () => {
  try {
    return uuidv4();
  } catch {
    return generateUUID();
  }
};

// Define a type for the stored state to handle potential legacy data
type LegacyPatientState = {
  patients?: Patient[];
  patient?: Patient[]; // Potential previous key
}

interface PatientState {
  patients: Patient[];
}

interface PatientActions {
  // Core CRUD operations
  addPatient: (patient: Omit<Patient, 'id' | 'patientId'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  // Query methods
  getPatientById: (id: string) => Patient | null;
  searchPatients: (query: string) => Patient[];

  // Debugging methods
  debugPrintPatients: () => void;
  clearAllPatients: () => void;
}

export const usePatientStore = create<PatientState & PatientActions>()(
  persist(
    (set, get) => ({
      patients: [],

      addPatient: (patientData) => {
        const newPatient: Patient = {
          ...patientData,
          id: safeUUID(),
          patientId: `PT-${Date.now()}`,
        };

        set(state => {
          const updatedPatients = [...state.patients, newPatient];
          console.log('Patient Added:', newPatient);
          console.log('Total Patients:', updatedPatients.length);
          return { patients: updatedPatients };
        });

        return newPatient;
      },

      updatePatient: (id, updates) => {
        set(state => ({
          patients: state.patients.map(patient => 
            patient.id === id 
              ? { ...patient, ...updates } 
              : patient
          )
        }));
      },

      deletePatient: (id) => {
        set(state => ({
          patients: state.patients.filter(patient => patient.id !== id)
        }));
      },

      getPatientById: (id) => {
        return get().patients.find(patient => patient.id === id) || null;
      },

      searchPatients: (query) => {
        const lowercaseQuery = query.toLowerCase().trim();
        return get().patients.filter(patient => 
          patient.name.toLowerCase().includes(lowercaseQuery) ||
          patient.patientId.toLowerCase().includes(lowercaseQuery) ||
          patient.phoneNumber.toLowerCase().includes(lowercaseQuery)
        );
      },

      // Debugging method to print all patients
      debugPrintPatients: () => {
        const patients = get().patients;
        console.log('=== DEBUG: All Patients ===');
        console.log('Total Patients:', patients.length);
        patients.forEach((patient, index) => {
          console.log(`Patient ${index + 1}:`, patient);
        });
      },

      // Method to clear all patients (use with caution)
      clearAllPatients: () => {
        console.warn('CLEARING ALL PATIENTS');
        set({ patients: [] });
      }
    }),
    {
      name: 'patient-storage',
      version: 2, // Increment version
      
      // Migration function to handle state changes
      migrate: (persistedState: unknown, version: number) => {
        console.log('Migrating Patient Store - Current Version:', version);
        
        const state = persistedState as LegacyPatientState;
        
        // Handle migration from version 1 to 2
        if (version === 1) {
          // Check for potential legacy storage keys
          const patients = state.patients || state.patient || [];
          
          console.log('Legacy Patients Found:', patients.length);
          
          // Ensure each patient has required fields
          const migratedPatients = patients.map(patient => {
            const migratedPatient = {
              ...patient,
              // Add any missing fields or do transformations
              id: patient.id || safeUUID(),
              patientId: patient.patientId || `PT-${Date.now()}`,
              // Add default values for any potentially missing fields
              name: patient.name || 'Unknown Patient',
              age: patient.age || 0,
              gender: patient.gender || 'Not Specified',
              phoneNumber: patient.phoneNumber || ''
            };
            
            console.log('Migrated Patient:', migratedPatient);
            return migratedPatient;
          });

          return { patients: migratedPatients };
        }

        // For any other version, return the state as-is
        return state as PatientState;
      },

      // Use a more explicit storage mechanism
      storage: {
        getItem: (name) => {
          console.log('Retrieving storage item:', name);
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          console.log('Setting storage item:', name, value);
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          console.log('Removing storage item:', name);
          localStorage.removeItem(name);
        }
      }
    }
  )
);

// Validation function for patients
export const validatePatient = (patient: Partial<Patient>): string[] => {
  const errors: string[] = [];

  if (!patient.name || patient.name.trim() === '') {
    errors.push('Patient name is required');
  }

  if (!patient.phoneNumber || patient.phoneNumber.trim() === '') {
    errors.push('Phone number is required');
  }

  if (!patient.age || patient.age < 0) {
    errors.push('Valid age is required');
  }

  if (!patient.gender) {
    errors.push('Gender is required');
  }

  return errors;
};

// Utility function to help with debugging
export const patientStoreUtils = {
  clearStorage: () => {
    try {
      localStorage.removeItem('patient-storage');
      console.log('Patient storage cleared');
    } catch (error) {
      console.error('Error clearing patient storage:', error);
    }
  },
  
  printStorageContents: () => {
    try {
      const storedData = localStorage.getItem('patient-storage');
      console.log('Stored Patient Data:', storedData ? JSON.parse(storedData) : 'No data');
    } catch (error) {
      console.error('Error reading patient storage:', error);
    }
  }
};
