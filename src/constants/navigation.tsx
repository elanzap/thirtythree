import {
  Users,
  FileText,
  Settings,
  UserPlus,
  Activity,
  Flask,
  Clock,
  Timer,
  Pills,
  Cog,
  Store,
  ClipboardList,
  Package,
  CreditCard
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  {
    id: 'patients',
    text: 'Patients',
    href: '#patients',
    icon: Users
  },
  {
    id: 'prescriptions',
    text: 'Prescriptions',
    href: '#prescriptions',
    icon: FileText
  },
  {
    id: 'lab-orders',
    text: 'Lab Orders',
    href: '#lab-orders',
    icon: Flask
  },
  {
    id: 'pharmacy',
    text: 'Pharmacy',
    href: '#pharmacy',
    icon: Store,
    subItems: [
      {
        id: 'pharmacy-supplier',
        text: 'Suppliers',
        href: '#pharmacy-supplier',
        icon: Package
      },
      {
        id: 'add-to-pharmacy',
        text: 'Add Stock',
        href: '#add-to-pharmacy',
        icon: UserPlus
      },
      {
        id: 'pharmacy-orders',
        text: 'Orders',
        href: '#pharmacy-orders',
        icon: ClipboardList
      }
    ]
  },
  {
    id: 'consultation-bill',
    text: 'Consultation Bill',
    href: '#consultation-bill',
    icon: CreditCard
  },
  {
    id: 'settings',
    text: 'Settings',
    href: '#settings',
    icon: Settings,
    subItems: [
      {
        id: 'doctors',
        text: 'Doctors',
        href: '#doctors',
        icon: Activity
      },
      {
        id: 'diagnosis',
        text: 'Diagnosis',
        href: '#diagnosis',
        icon: Activity
      },
      {
        id: 'diagnostic-tests',
        text: 'Diagnostic Tests',
        href: '#diagnostic-tests',
        icon: Flask
      },
      {
        id: 'dose-duration',
        text: 'Dose Duration',
        href: '#dose-duration',
        icon: Clock
      },
      {
        id: 'dose-interval',
        text: 'Dose Interval',
        href: '#dose-interval',
        icon: Timer
      },
      {
        id: 'dosage',
        text: 'Dosage',
        href: '#dosage',
        icon: Pills
      },
      {
        id: 'drugs',
        text: 'Drugs',
        href: '#drugs',
        icon: Pills
      }
    ]
  }
];
