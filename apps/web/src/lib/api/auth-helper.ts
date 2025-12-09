// API Auth Helper - Verifica autenticación en API routes
import { headers } from 'next/headers';
import { createServerClient } from '../supabase/server';

export interface AuthUser {
  id: string;
  email?: string;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
}

export async function getAuthUser(): Promise<AuthResult> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Missing authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { authenticated: false, error: error?.message || 'Invalid token' };
    }

    return {
      authenticated: true,
      user: { id: user.id, email: user.email }
    };
  } catch (error: any) {
    return { authenticated: false, error: error.message };
  }
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json(
    { success: false, error: message },
    { status: 401 }
  );
}

export function errorResponse(message: string, status = 400) {
  return Response.json(
    { success: false, error: message },
    { status }
  );
}

export function successResponse<T>(data: T, status = 200) {
  return Response.json(
    { success: true, data },
    { status }
  );
}

