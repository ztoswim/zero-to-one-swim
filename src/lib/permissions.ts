/**
 * Permission Type Definition
 * This defines all actions that can be controlled in the system.
 */
export type Permission = 
  // Finance & Dashboard
  | 'view_dashboard_metrics'
  | 'view_invoices'
  | 'create_invoice'
  | 'edit_invoice'
  | 'delete_invoice'
  
  // Students
  | 'view_students'
  | 'create_student'
  | 'edit_student'
  | 'delete_student'
  
  // Coaches & Locations
  | 'view_coaches'
  | 'create_coach'
  | 'edit_coach'
  | 'delete_coach'
  | 'view_locations'
  | 'create_location'
  | 'edit_location'
  | 'delete_location'
  
  // Schedule & Attendance
  | 'view_schedule'
  | 'view_all_schedules'
  | 'manage_schedules'
  | 'mark_attendance'
  | 'manage_fixed_schedule'
  
  // System
  | 'manage_users';

/**
 * Permission Group for UI Display
 */
export const PERMISSION_GROUPS = [
  {
    name: 'Dashboard Metrics',
    pagePermission: 'view_dashboard_metrics',
    actions: []
  },
  {
    name: 'Invoices & Billing',
    pagePermission: 'view_invoices',
    actions: [
      { id: 'create_invoice', label: 'Create New Invoices' },
      { id: 'edit_invoice', label: 'Edit Existing Invoices' },
      { id: 'delete_invoice', label: 'Delete Invoices (Critical)' },
    ]
  },
  {
    name: 'Student Management',
    pagePermission: 'view_students',
    actions: [
      { id: 'create_student', label: 'Add New Students' },
      { id: 'edit_student', label: 'Modify Student Info' },
      { id: 'delete_student', label: 'Delete Student Records (Critical)' },
    ]
  },
  {
    name: 'Coach Management',
    pagePermission: 'view_coaches',
    actions: [
      { id: 'create_coach', label: 'Add New Coaches' },
      { id: 'edit_coach', label: 'Modify Coach Info' },
      { id: 'delete_coach', label: 'Delete Coach Records (Critical)' },
    ]
  },
  {
    name: 'Location Management',
    pagePermission: 'view_locations',
    actions: [
      { id: 'create_location', label: 'Add New Locations' },
      { id: 'edit_location', label: 'Modify Location Info' },
      { id: 'delete_location', label: 'Delete Locations (Critical)' },
    ]
  },
  {
    name: 'Schedule & Attendance',
    pagePermission: 'view_schedule',
    actions: [
      { id: 'view_all_schedules', label: 'View All Coaches\' Schedules' },
      { id: 'manage_schedules', label: 'Manage All Lessons (Add/Remove)' },
      { id: 'mark_attendance', label: 'Mark Attendance (Roll Call)' },
      { id: 'manage_fixed_schedule', label: 'Manage Fixed Time Slots' },
    ]
  },
  {
    name: 'System Administration',
    pagePermission: 'manage_users',
    actions: []
  }
];

/**
 * Default Permissions for each role
 * These act as a baseline if no custom permissions are set.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'view_dashboard_metrics', 'view_invoices', 'create_invoice', 'edit_invoice',
    'view_students', 'create_student', 'edit_student',
    'view_coaches', 'create_coach', 'edit_coach',
    'view_locations', 'create_location', 'edit_location',
    'view_schedule', 'view_all_schedules', 'mark_attendance', 'manage_fixed_schedule',
    'manage_users'
  ],
  coach: [
    'view_students', 'view_coaches', 'view_locations', 'view_schedule', 'mark_attendance'
  ],
  parent: [
    'view_students', 'view_schedule'
  ]
};

/**
 * Utility to check if a user has a specific permission
 * @param user The user object from the database
 * @param permission The permission to check
 * @returns boolean
 */
export function hasPermission(user: any, permission: Permission): boolean {
  if (!user) return false;
  
  // Root user always has all permissions
  if (user.role === 'root' || user.role === 'super_admin') return true;
  
  // 1. Check custom granular permissions first
  const customPermissions = user.permissions as Record<string, boolean> | null;
  if (customPermissions && typeof customPermissions[permission] === 'boolean') {
    return customPermissions[permission];
  }
  
  // 2. Fallback to default role permissions
  const defaults = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  return defaults.includes(permission);
}
