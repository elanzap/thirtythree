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
  PlusCircle
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
        icon: FileSpreadsheet,
        text: 'Pharmacy Orders',
        href: '#pharmacy-orders'
      },
      {
        id: 'pharmacy-bills',
        icon: FileText,
        text: 'Pharmacy Bills',
        href: '#pharmacy-bills'
      }
    ]
  },
  {
    id: 'settings',
    icon: Settings,
    text: 'Settings',
    href: '#settings',
    subItems: [
      {
        id: 'global-settings',
        icon: Settings,
        text: 'Global Settings',
        href: '#global-settings'
      },
      {
        id: 'general-settings',
        icon: Building,
        text: 'General Settings',
        href: '#general-settings'
      },
      {
        id: 'doctors',
        icon: UserCog,
        text: 'Doctors',
        href: '#doctors'
      },
      {
        id: 'diagnoses',
        icon: Stethoscope,
        text: 'Diagnoses',
        href: '#diagnoses'
      },
      {
        id: 'diagnostic-tests',
        icon: TestTubes,
        text: 'Diagnostic Tests',
        href: '#diagnostic-tests'
      },
      {
        id: 'drugs',
        icon: Tablets,
        text: 'Drugs',
        href: '#drugs'
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
      }
    ]
  }
] as const;

export const pharmacyRoutes = [
  {
    name: 'Pharmacy Orders',
    path: '/pharmacy/orders',
    icon: FileSpreadsheet,
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
