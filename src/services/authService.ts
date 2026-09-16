import { User, UserRole } from '../types';

const TOKEN_KEY = 'trendera_auth_token';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setStoredAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    // Ignore storage errors
  }
}

export function clearStoredAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // Ignore storage errors
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginApi(username: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Login failed. Please verify your username and password.'
      };
    }

    if (data.token) {
      setStoredAuthToken(data.token);
    }

    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unable to connect to authentication server. Please check your network.'
    };
  }
}

export async function fetchCurrentUserApi(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (res.status === 401 || res.status === 403) {
      clearStoredAuthToken();
      return { success: false, error: 'Session expired or unauthorized.' };
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      clearStoredAuthToken();
      return { success: false, error: data.error || 'Failed to authenticate session.' };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error fetching current user' };
  }
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  } catch (e) {
    // Ignore network failure on logout
  } finally {
    clearStoredAuthToken();
  }
}

// -------------------------------------------------------------
// USER MANAGEMENT APIS (ADMIN ONLY)
// -------------------------------------------------------------

export async function fetchUsersApi(): Promise<{ success: boolean; users?: User[]; error?: string }> {
  try {
    const res = await fetch('/api/users', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to fetch users' };
    }
    return { success: true, users: data.users };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error fetching users' };
  }
}

export async function createManagerApi(userData: {
  name: string;
  username: string;
  email?: string;
  mobile?: string;
  password: string;
  assignedStore?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to create manager account' };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error creating manager' };
  }
}

export async function updateManagerApi(
  id: string,
  userData: Partial<{
    name: string;
    email: string;
    mobile: string;
    assignedStore: string;
    active: boolean;
  }>
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to update manager account' };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error updating manager' };
  }
}

export async function resetPasswordApi(
  id: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ newPassword }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to reset password' };
    }
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error resetting password' };
  }
}

export async function toggleUserActiveApi(
  id: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}/toggle-active`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to update user status' };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error updating user status' };
  }
}
