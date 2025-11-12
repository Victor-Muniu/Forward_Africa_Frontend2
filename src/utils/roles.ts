import { UserRole } from '../types';

export const ALLOWED_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'content_manager',
  'community_manager',
  'user_support',
  'user'
];

/**
 * Normalize arbitrary role strings into a supported UserRole.
 * Maps common aliases (e.g., "Admin") to the closest valid role.
 */
export function normalizeRole(input: any): UserRole {
  const raw = (typeof input === 'string' ? input : '').toString().trim().toLowerCase();

  switch (raw) {
    case 'super_admin':
    case 'superadmin':
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
      return (ALLOWED_ROLES as string[]).includes(raw) ? (raw as UserRole) : 'user';
  }
}
