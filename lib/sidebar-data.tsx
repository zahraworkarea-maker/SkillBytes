import { Home, Folder, Target, FileText, GraduationCap, Building2, Users, Settings, LogOut } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive';
  badgeText?: string;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export const adminMenuCategories: MenuCategory[] = [
  {
    title: 'MAIN MENU',
    items: [
      {
        icon: Home,
        label: 'Dashboard',
        path: '/admin/dashboard',
      },
      {
        icon: Folder,
        label: 'Materi',
        path: '/admin/materi',
      },
      {
        icon: Target,
        label: 'PBL',
        path: '/admin/pbl',
      },
      {
        icon: FileText,
        label: 'Assesmen',
        path: '/admin/assesmen',
      },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      {
        icon: GraduationCap,
        label: 'Guru',
        path: '/admin/guru',
      },
            {
        icon: GraduationCap,
        label: 'Siswa',
        path: '/admin/siswa',
      },
    ],
  },
];

// Keep the old array for backward compatibility if needed
export const adminMenuItems: MenuItem[] = adminMenuCategories.flatMap(category => category.items);