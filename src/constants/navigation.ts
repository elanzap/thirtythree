import { 
  Users, 
  FileText, 
  Stethoscope,
  Settings,
  UserCog,
  TestTubes,
  Clock,
  Timer,
  Pill,
  Tablets,
  FileSpreadsheet,
  Building,
  Store,
  PlusCircle,
  CreditCard,
  ShoppingCart
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { 
    id: 'patients',
    icon: Users,
    text: 'Patients',
    href: '#patients' 
  },
  { 
    id: 'prescriptions',
    icon: FileText,
    text: 'Prescriptions',
    href: '#prescriptions' 
  },
  {
    id: 'lab-orders',
    icon: FileSpreadsheet,
    text: 'Lab Orders',
    href: '#lab-orders'
  },
  {
    id: 'pharmacy',
    icon: Store,
    text: 'Pharmacy',
    href: '#pharmacy',
    subItems: [
      {
        id: 'pharmacy-supplier',
        icon: Building,
        text: 'Suppliers',
        href: '#pharmacy-supplier'
      },
      {
        id: 'add-to-pharmacy',
        icon: PlusCircle,
        text: 'Add Stock',
        href: '#add-to-pharmacy'
      },
      {
        id: 'pharmacy-orders',
        icon: ShoppingCart,
        text: 'Pharmacy Orders',
        href: '#pharmacy-orders'
      }
    ]
  },
  {
    id: 'consultation-bill',
    icon: CreditCard,
    text: 'Consultation Bill',
    href: '#consultation-bill'
  },
  {
    id: 'settings',
    icon: Settings,
    text: 'Settings',
    href: '#settings',
    subItems: [
      {
        id: 'doctors',
        icon: UserCog,
        text: 'Doctors',
        href: '#doctors'
      },
      {
        id: 'diagnosis',
        icon: Stethoscope,
        text: 'Diagnosis',
        href: '#diagnosis'
      },
      {
        id: 'diagnostic-tests',
        icon: TestTubes,
        text: 'Diagnostic Tests',
        href: '#diagnostic-tests'
      },
      {
        id: 'dose-duration',
        icon: Clock,
        text: 'Dose Duration',
        href: '#dose-duration'
      },
      {
        id: 'dose-interval',
        icon: Timer,
        text: 'Dose Interval',
        href: '#dose-interval'
      },
      {
        id: 'dosage',
        icon: Pill,
        text: 'Dosage',
        href: '#dosage'
      },
      {
        id: 'drugs',
        icon: Tablets,
        text: 'Drugs',
        href: '#drugs'
      }
    ]
  }
] as const;

export const pharmacyRoutes = [
  {
    name: 'Pharmacy Orders',
    path: '/pharmacy/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Add to Pharmacy',
    path: '/pharmacy/add',
    icon: PlusCircle,
  },
  {
    name: 'Pharmacy Bills',
    path: '/pharmacy/bills',
    icon: FileText,
  },
];
