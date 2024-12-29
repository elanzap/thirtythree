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
  Package
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  {
    id: 'patients',
    text: 'Patients',
    href: '/patients',
    icon: Users
  },
  {
    id: 'prescriptions',
    text: 'Prescriptions',
    href: '/prescriptions',
    icon: FileText
  },
  {
    id: 'lab-orders',
    text: 'Lab Orders',
    href: '/lab-orders',
    icon: Flask
  },
  {
    id: 'pharmacy',
    text: 'Pharmacy',
    href: '#',
    icon: Store,
    subItems: [
      {
        id: 'pharmacy-supplier',
        text: 'Suppliers',
        href: '/pharmacy-supplier',
        icon: Package
      },
      {
        id: 'add-to-pharmacy',
        text: 'Add Stock',
        href: '/add-to-pharmacy',
        icon: Package
      },
      {
        id: 'pharmacy-orders',
        text: 'Pharmacy Orders',
        href: '/pharmacy-orders',
        icon: ClipboardList
      }
    ]
  },
  {
    id: 'settings',
    text: 'Settings',
    href: '#',
    icon: Settings,
    subItems: [
      {
        id: 'doctors',
        text: 'Doctors',
        href: '/doctors',
        icon: UserPlus
      },
      {
        id: 'diagnoses',
        text: 'Diagnoses',
        href: '/diagnoses',
        icon: Activity
      },
      {
        id: 'diagnostic-tests',
        text: 'Diagnostic Tests',
        href: '/diagnostic-tests',
        icon: Flask
      },
      {
        id: 'drugs',
        text: 'Drugs',
        href: '/drugs',
        icon: Pills
      },
      {
        id: 'dose-duration',
        text: 'Dose Duration',
        href: '/dose-duration',
        icon: Clock
      },
      {
        id: 'dose-interval',
        text: 'Dose Interval',
        href: '/dose-interval',
        icon: Timer
      },
      {
        id: 'dosage',
        text: 'Dosage',
        href: '/dosage',
        icon: Pills
      },
      {
        id: 'general-settings',
        text: 'General Settings',
        href: '/general-settings',
        icon: Cog
      },
      {
        id: 'global-settings',
        text: 'Global Settings',
        href: '/global-settings',
        icon: Settings
      }
    ]
  }
];
