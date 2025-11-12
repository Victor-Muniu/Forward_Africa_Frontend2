import { UserRole } from '../types';

export const ALLOWED_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'content_manager',
  'community_manager',
  'user_support',
  'user'
];

const ROLE_PRIORITY: UserRole[] = ['super_admin', 'admin', 'content_manager', 'community_manager', 'user_support', 'user'];

/**
 * Normalize arbitrary role input into a supported UserRole.
 * Accepts a string or an array of strings; picks the highest privilege role when multiple are provided.
 */
export function normalizeRole(input: any): UserRole {
  if (!input) return 'user';

  // If an array of roles is provided, pick highest priority role
  if (Array.isArray(input)) {
    const normalized = input
      .map(i => (typeof i === 'string' ? i.trim().toLowerCase() : ''))
      .map(mapRawToRole)
      .filter(Boolean) as UserRole[];

    for (const r of ROLE_PRIORITY) {
      if (normalized.includes(r)) return r as UserRole;
    }

    return 'user';
  }

  const raw = (typeof input === 'string' ? input : '').toString().trim().toLowerCase();
  return mapRawToRole(raw) || 'user';
}

function mapRawToRole(raw: string): UserRole | null {
  switch (raw) {
    case 'super_admin':
    case 'superadmin':
    case 'super-admin':
      return 'super_admin';

    case 'admin':
    case 'administrator':
    case 'owner':
      return 'admin';

    case 'content_manager':
    case 'contentmanager':
    case 'editor':
      return 'content_manager';

    case 'community_manager':
    case 'communitymanager':
    case 'moderator':
      return 'community_manager';

    case 'user_support':
    case 'support':
    case 'support_agent':
      return 'user_support';

    case 'user':
      return 'user';

    default:
      return (ALLOWED_ROLES as string[]).includes(raw) ? (raw as UserRole) : null;
  }
}
