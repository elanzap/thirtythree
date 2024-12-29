import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Prescription, Patient } from '../types';

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
type LegacyPrescriptionState = {
  prescriptions?: Prescription[];
  prescription?: Prescription[]; // Potential previous key
}

interface PrescriptionState {
  prescriptions: Prescription[];
}

interface PrescriptionActions {
  // Core CRUD operations
  addPrescription: (prescription: Omit<Prescription, 'id' | 'prescriptionId' | 'date'>) => Prescription;
  updatePrescription: (id: string, updates: Partial<Prescription>) => void;
  deletePrescription: (id: string) => void;

  // Query methods
  getPrescriptionsByPatient: (patientId: string) => Prescription[];
  getLatestPrescription: (patientId: string) => Prescription | null;
  searchPrescriptions: (query: string) => Prescription[];

  // Advanced filtering
  filterPrescriptionsByDateRange: (
    startDate: string, 
    endDate: string, 
    patientId?: string
  ) => Prescription[];

  // Debugging methods
  debugPrintPrescriptions: () => void;
  clearAllPrescriptions: () => void;
}

export const usePrescriptionStore = create<PrescriptionState & PrescriptionActions>()(
  persist(
    (set, get) => ({
      prescriptions: [],
      
      // Modify addPrescription to log more details
      addPrescription: (prescriptionData) => {
        const newPrescription: Prescription = {
          ...prescriptionData,
          id: safeUUID(),
          prescriptionId: `RX-${Date.now()}`, // Consistent ID generation
          date: new Date().toISOString(),
          visitId: safeUUID(), // Generate a unique visit ID
        };

        console.log('Adding Prescription:', newPrescription);

        set(state => {
          const updatedPrescriptions = [...state.prescriptions, newPrescription];
          console.log('Total Prescriptions After Add:', updatedPrescriptions.length);
          console.log('All Prescription IDs:', updatedPrescriptions.map(p => p.prescriptionId));
          return { prescriptions: updatedPrescriptions };
        });

        return newPrescription;
      },

      updatePrescription: (id, updates) => {
        set(state => ({
          prescriptions: state.prescriptions.map(prescription => 
            prescription.id === id 
              ? { ...prescription, ...updates } 
              : prescription
          )
        }));
      },

      deletePrescription: (id) => {
        set(state => ({
          prescriptions: state.prescriptions.filter(prescription => prescription.id !== id)
        }));
      },

      getPrescriptionsByPatient: (patientId) => {
        return get().prescriptions
          .filter(prescription => prescription.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getLatestPrescription: (patientId) => {
        const patientPrescriptions = get().getPrescriptionsByPatient(patientId);
        return patientPrescriptions.length > 0 ? patientPrescriptions[0] : null;
      },

      searchPrescriptions: (query) => {
        const lowercaseQuery = query.toLowerCase().trim();
        console.log('Search Query:', lowercaseQuery);
        console.log('Total Prescriptions:', get().prescriptions.length);
        console.log('Prescription IDs:', get().prescriptions.map(p => p.prescriptionId));
        
        const results = get().prescriptions.filter(prescription => 
          prescription.patientName.toLowerCase().includes(lowercaseQuery) ||
          prescription.prescriptionId.toLowerCase() === lowercaseQuery
        );
        
        console.log('Search Results:', results);
        return results;
      },

      filterPrescriptionsByDateRange: (startDate, endDate, patientId) => {
        return get().prescriptions.filter(prescription => {
          const prescriptionDate = new Date(prescription.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          const dateInRange = prescriptionDate >= start && prescriptionDate <= end;
          const patientMatch = !patientId || prescription.patientId === patientId;
          
          return dateInRange && patientMatch;
        });
      },

      // Debugging method to print all prescriptions
      debugPrintPrescriptions: () => {
        const prescriptions = get().prescriptions;
        console.log('=== DEBUG: All Prescriptions ===');
        console.log('Total Prescriptions:', prescriptions.length);
        prescriptions.forEach((prescription, index) => {
          console.log(`Prescription ${index + 1}:`, prescription);
        });
      },

      // Method to clear all prescriptions (use with caution)
      clearAllPrescriptions: () => {
        console.warn('CLEARING ALL PRESCRIPTIONS');
        set({ prescriptions: [] });
      }
    }),
    {
      name: 'prescription-storage',
      version: 2, // Increment version
      
      // Migration function to handle state changes
      migrate: (persistedState: unknown, version: number) => {
        console.log('Migrating Prescription Store - Current Version:', version);
        
        const state = persistedState as LegacyPrescriptionState;
        
        // Handle migration from version 1 to 2
        if (version === 1) {
          // Check for potential legacy storage keys
          const prescriptions = state.prescriptions || state.prescription || [];
          
          console.log('Legacy Prescriptions Found:', prescriptions.length);
          
          // Ensure each prescription has required fields
          const migratedPrescriptions = prescriptions.map(prescription => {
            const migratedPrescription = {
              ...prescription,
              // Add any missing fields or do transformations
              id: prescription.id || safeUUID(),
              prescriptionId: prescription.prescriptionId || `RX-${Date.now()}`,
              date: prescription.date || new Date().toISOString(),
              visitId: prescription.visitId || safeUUID(),
              
              // Add default values for any potentially missing fields
              patientId: prescription.patientId || 'UNKNOWN',
              patientName: prescription.patientName || 'Unknown Patient',
              
              // Ensure structured fields have defaults
              vitalSigns: prescription.vitalSigns || {},
              medications: prescription.medications || [],
              labTests: prescription.labTests || []
            };
            
            console.log('Migrated Prescription:', migratedPrescription);
            return migratedPrescription;
          });

          return { prescriptions: migratedPrescriptions };
        }

        // For any other version, return the state as-is
        return state as PrescriptionState;
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

// Validation function for prescriptions
export const validatePrescription = (prescription: Partial<Prescription>): string[] => {
  const errors: string[] = [];

  if (!prescription.patientId) {
    errors.push('Patient ID is required');
  }

  if (!prescription.date) {
    errors.push('Prescription date is required');
  }

  // Add more validation as needed
  if (!prescription.medications || prescription.medications.length === 0) {
    errors.push('At least one medication is required');
  }

  return errors;
};

// Utility function to help with debugging
export const prescriptionStoreUtils = {
  clearStorage: () => {
    try {
      localStorage.removeItem('prescription-storage');
      console.log('Prescription storage cleared');
    } catch (error) {
      console.error('Error clearing prescription storage:', error);
    }
  },
  
  printStorageContents: () => {
    try {
      const storedData = localStorage.getItem('prescription-storage');
      console.log('Stored Prescription Data:', storedData ? JSON.parse(storedData) : 'No data');
    } catch (error) {
      console.error('Error reading prescription storage:', error);
    }
  }
};
