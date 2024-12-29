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
  availableQuantity: number;
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
  updatePharmacyItemQuantity: (medicineName: string, batchNo: string, quantityToSubtract: number) => void;
  getBatchesForMedicine: (medicineName: string) => Array<{
    batchNo: string;
    expiryDate: string;
    quantity: number;
    availableQuantity: number;
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
      const newItem = {
        ...item,
        availableQuantity: item.quantity // Initialize availableQuantity with quantity
      };
      const newItems = [...state.pharmacyItems, newItem];
      saveToStorage(STORAGE_KEYS.PHARMACY_ITEMS, newItems);
      return { pharmacyItems: newItems };
    }),

  updatePharmacyItemQuantity: (medicineName, batchNo, quantityToSubtract) =>
    set((state) => {
      const updatedItems = state.pharmacyItems.map(item => {
        if (item.medicineName === medicineName && item.batchNo === batchNo) {
          const newAvailableQuantity = Math.max(0, (item.availableQuantity || item.quantity) - quantityToSubtract);
          return {
            ...item,
            availableQuantity: newAvailableQuantity
          };
        }
        return item;
      });
      
      saveToStorage(STORAGE_KEYS.PHARMACY_ITEMS, updatedItems);
      return { pharmacyItems: updatedItems };
    }),
    
  getBatchesForMedicine: (medicineName: string) => {
    const { pharmacyItems } = get();
    const normalizedSearchName = medicineName.trim().toLowerCase();
    
    return pharmacyItems
      .filter(item => item.medicineName.toLowerCase().includes(normalizedSearchName))
      .map(item => ({
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        availableQuantity: item.availableQuantity || item.quantity,
        salePrice: item.salePrice,
        tax: item.tax
      }));
  }
}));
