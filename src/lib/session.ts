export type UserRole = 'user' | 'hospital' | 'admin' | 'guest';

const ROLE_KEY = 'pup_role';
const USER_ID_KEY = 'pup_user_id';

export function setSession(role: UserRole, userId: string) {
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(USER_ID_KEY, userId);
}

export function getRole(): UserRole | null {
  const r = localStorage.getItem(ROLE_KEY) as UserRole | null;
  return r ?? null;
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function clearSession() {
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
}
