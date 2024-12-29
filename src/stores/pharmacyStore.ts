import { create } from 'zustand';

const STORAGE_KEYS = {
  PHARMACY_ITEMS: 'medscript_pharmacy_items',
  SUPPLIERS: 'medscript_suppliers'
};

// Load data from localStorage
const loadFromStorage = () => {
  try {
    const pharmacyItems = localStorage.getItem(STORAGE_KEYS.PHARMACY_ITEMS);
    const suppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return {
      pharmacyItems: pharmacyItems ? JSON.parse(pharmacyItems) : [],
      suppliers: suppliers ? JSON.parse(suppliers) : []
    };
  } catch (error) {
    console.error('Error loading pharmacy data:', error);
    return { pharmacyItems: [], suppliers: [] };
  }
};

// Save data to localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving pharmacy data:', error);
  }
};

interface Supplier {
  id: string;
  name: string;
}

interface PharmacyItem {
  id: string;
  supplier: string;
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  tax: number;
  amount: number;
}

interface PharmacyStore {
  suppliers: Supplier[];
  pharmacyItems: PharmacyItem[];
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  removeSupplier: (id: string) => void;
  addPharmacyItem: (item: PharmacyItem) => void;
  getBatchesForMedicine: (medicineName: string) => Array<{
    batchNo: string;
    expiryDate: string;
    quantity: number;
    salePrice: number;
    tax: number;
  }>;
}

// Load initial data
const initialData = loadFromStorage();

export const usePharmacyStore = create<PharmacyStore>((set, get) => ({
  suppliers: initialData.suppliers,
  pharmacyItems: initialData.pharmacyItems,
  setSuppliers: (suppliers) => {
    set({ suppliers });
    saveToStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  },
  addSupplier: (supplier) =>
    set((state) => {
      const newSuppliers = [...state.suppliers, supplier];
      saveToStorage(STORAGE_KEYS.SUPPLIERS, newSuppliers);
      return { suppliers: newSuppliers };
    }),
  removeSupplier: (id) =>
    set((state) => {
      const newSuppliers = state.suppliers.filter((supplier) => supplier.id !== id);
      saveToStorage(STORAGE_KEYS.SUPPLIERS, newSuppliers);
      return { suppliers: newSuppliers };
    }),
  addPharmacyItem: (item) =>
    set((state) => {
      const newItems = [...state.pharmacyItems, item];
      saveToStorage(STORAGE_KEYS.PHARMACY_ITEMS, newItems);
      return { pharmacyItems: newItems };
    }),
  getBatchesForMedicine: (medicineName: string) => {
    const { pharmacyItems } = get();
    console.log('Getting batches for medicine:', medicineName);
    
    // Normalize the medicine name for comparison
    const normalizedSearchName = medicineName.trim().toLowerCase();
    
    // Find all batches for this medicine
    const matchingItems = pharmacyItems.filter(item => {
      const itemMedicineName = item.medicineName.trim().toLowerCase();
      const isMatch = itemMedicineName === normalizedSearchName;
      console.log('Comparing:', {
        searchFor: normalizedSearchName,
        comparing: itemMedicineName,
        isMatch,
        batchNo: item.batchNo
      });
      return isMatch;
    });

    console.log('Found matching items:', matchingItems);
    
    return matchingItems.map(item => ({
      batchNo: item.batchNo,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      salePrice: item.salePrice,
      tax: item.tax
    }));
  }
}));
