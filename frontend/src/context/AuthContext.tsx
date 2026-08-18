import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../lib/types';

export interface LoginParams {
  name: string;
  area: string;
  password: string;
  role?: UserRole;
  department?: string;
  email?: string;
}

export interface RegisterParams {
  full_name: string;
  area: string;
  password: string;
  role?: UserRole;
  department?: string;
  email?: string;
  preferred_language?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  login: (dataOrEmail: string | LoginParams, password?: string) => Promise<{ error?: string }>;
  register: (data: RegisterParams) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  isCitizen: boolean;
  isCorporation: boolean;
  isWorker: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const withTimeout = <T,>(promise: PromiseLike<T> | Promise<T>, ms = 8000): Promise<T> => {
    return Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Supabase request timed out after ${ms}ms`)), ms)
      )
    ]);
  };

  // Load user profile from Supabase profiles table
  const fetchProfile = async (userId: string, userEmail?: string, userMeta?: any) => {
    try {
      if (!isConfigured) {
        const saved = localStorage.getItem('civicconnect_auth_profile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.id === userId) {
              setProfile(parsed);
              return;
            }
          } catch {}
        }
        const fallbackProfile: UserProfile = {
          id: userId,
          full_name: userMeta?.full_name || 'Citizen',
          email: userEmail || 'user@mysore.civicconnect.org',
          role: userMeta?.role || 'citizen',
          preferred_language: userMeta?.preferred_language || 'English',
          area: userMeta?.area || 'Gokulam',
          department: userMeta?.department || null,
          phone: userMeta?.phone || null,
          worker_status: userMeta?.worker_status || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        localStorage.setItem('civicconnect_auth_profile', JSON.stringify(fallbackProfile));
        return;
      }

      const { data, error }: any = await withTimeout(
        supabase.from('profiles').select('*').eq('id', userId).single(),
        6000
      );

      if (error && error.code === 'PGRST116') {
        // Profile row hasn't been created yet, insert profile
        const newProfile: Partial<UserProfile> = {
          id: userId,
          full_name: userMeta?.full_name || 'Citizen',
          email: userEmail || '',
          role: userMeta?.role || 'citizen',
          preferred_language: userMeta?.preferred_language || 'English',
          area: userMeta?.area || 'Gokulam',
          department: userMeta?.department || null
        };
        const { data: inserted }: any = await withTimeout(
          supabase.from('profiles').insert(newProfile).select().single(),
          6000
        );
        if (inserted) {
          setProfile(inserted as UserProfile);
          localStorage.setItem('civicconnect_auth_profile', JSON.stringify(inserted));
        }
      } else if (data) {
        setProfile(data as UserProfile);
        localStorage.setItem('civicconnect_auth_profile', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Profile fetch completed with local fallback profile:', err);
      const saved = localStorage.getItem('civicconnect_auth_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfile(parsed);
          return;
        } catch {}
      }
      const fallbackProfile: UserProfile = {
        id: userId,
        full_name: userMeta?.full_name || 'Citizen',
        email: userEmail || 'user@mysore.civicconnect.org',
        role: userMeta?.role || 'citizen',
        preferred_language: userMeta?.preferred_language || 'English',
        area: userMeta?.area || 'Gokulam',
        department: userMeta?.department || null,
        phone: userMeta?.phone || null,
        worker_status: userMeta?.worker_status || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(fallbackProfile);
      localStorage.setItem('civicconnect_auth_profile', JSON.stringify(fallbackProfile));
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      const saved = localStorage.getItem('civicconnect_auth_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser({ id: parsed.id, email: parsed.email });
          setProfile(parsed);
        } catch (e) {
          localStorage.removeItem('civicconnect_auth_profile');
        }
      }
      setLoading(false);
      return;
    }

    // 1. Initial Session Check with timeout
    withTimeout(supabase.auth.getSession(), 5000)
      .then(({ data: { session } }: any) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
        } else {
          const saved = localStorage.getItem('civicconnect_auth_profile');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setUser({ id: parsed.id, email: parsed.email });
              setProfile(parsed);
            } catch {}
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      })
      .catch(() => {
        const saved = localStorage.getItem('civicconnect_auth_profile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser({ id: parsed.id, email: parsed.email });
            setProfile(parsed);
          } catch {}
        }
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        const saved = localStorage.getItem('civicconnect_auth_profile');
        if (!saved) {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const login = async (dataOrEmail: string | LoginParams, rawPassword?: string): Promise<{ error?: string }> => {
    let name = '';
    let area = 'Gokulam';
    let password = rawPassword || '';
    let role: UserRole = 'citizen';
    let department: string | undefined = undefined;
    let email = '';

    if (typeof dataOrEmail === 'string') {
      email = dataOrEmail;
      name = email.split('@')[0];
    } else {
      name = dataOrEmail.name;
      area = dataOrEmail.area || 'Gokulam';
      password = dataOrEmail.password;
      role = dataOrEmail.role || 'citizen';
      department = dataOrEmail.department;
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const cleanArea = area.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      email = dataOrEmail.email || `${cleanName}.${cleanArea}@mysore.civicconnect.org`;
    }

    let resolvedId = generateUUID();
    if (role === 'worker') {
      if (name.toLowerCase().includes('ramesh')) resolvedId = 'b1000000-0000-0000-0000-000000000001';
      else if (name.toLowerCase().includes('anil')) resolvedId = 'b2000000-0000-0000-0000-000000000002';
      else if (name.toLowerCase().includes('suresh')) resolvedId = 'b3000000-0000-0000-0000-000000000003';
      else if (name.toLowerCase().includes('priya')) resolvedId = 'b4000000-0000-0000-0000-000000000004';
      else if (name.toLowerCase().includes('manjunath')) resolvedId = 'b5000000-0000-0000-0000-000000000005';
      else resolvedId = 'b1000000-0000-0000-0000-000000000001';
    } else if (role === 'corporation') {
      resolvedId = 'c9000000-0000-0000-0000-000000000001';
    }

    const localProfile: UserProfile = {
      id: resolvedId,
      full_name: name,
      email: email,
      role: role,
      preferred_language: 'English',
      area: area,
      department: department || (role === 'corporation' ? 'Municipal Administration' : role === 'worker' ? 'Road Maintenance & Pavements' : null),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!isConfigured) {
      setUser({ id: localProfile.id, email });
      setProfile(localProfile);
      localStorage.setItem('civicconnect_auth_profile', JSON.stringify(localProfile));
      return {};
    }

    try {
      // First attempt direct Supabase sign in with credentials
      const { data, error }: any = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        6000
      );

      if (error) {
        // If signIn fails (e.g. user not registered yet in Auth), try auto-registration
        try {
          const { data: signUpData, error: signUpError }: any = await withTimeout(
            supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: name,
                  role,
                  area,
                  department
                }
              }
            }),
            6000
          );

          if (signUpData?.user) {
            localProfile.id = signUpData.user.id;
            setUser(signUpData.user);
          } else {
            setUser({ id: localProfile.id, email });
          }
        } catch {
          setUser({ id: localProfile.id, email });
        }
      } else if (data?.user) {
        localProfile.id = data.user.id;
        setUser(data.user);
      }

      // Ensure profile exists in Supabase public.profiles table
      try {
        await supabase.from('profiles').upsert(localProfile, { onConflict: 'id' });
      } catch (upsertErr) {
        console.warn('Profile upsert notice:', upsertErr);
      }

      setProfile(localProfile);
      localStorage.setItem('civicconnect_auth_profile', JSON.stringify(localProfile));
      return {};
    } catch (err: any) {
      setUser({ id: localProfile.id, email });
      setProfile(localProfile);
      localStorage.setItem('civicconnect_auth_profile', JSON.stringify(localProfile));
      return {};
    }
  };

  const register = async (data: RegisterParams): Promise<{ error?: string }> => {
    const role = data.role || 'citizen';
    const cleanName = data.full_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanArea = (data.area || 'gokulam').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const email = data.email || `${cleanName}.${cleanArea}@mysore.civicconnect.org`;
    const newId = generateUUID();

    const newProfile: UserProfile = {
      id: newId,
      full_name: data.full_name,
      email: email,
      role: role,
      preferred_language: data.preferred_language || 'English',
      area: data.area || 'Gokulam',
      department: data.department || (role === 'corporation' ? 'Municipal Administration' : role === 'worker' ? 'Road Maintenance & Pavements' : null),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!isConfigured) {
      setUser({ id: newProfile.id, email });
      setProfile(newProfile);
      localStorage.setItem('civicconnect_auth_profile', JSON.stringify(newProfile));
      return {};
    }

    try {
      const { data: authData, error }: any = await withTimeout(
        supabase.auth.signUp({
          email: email,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
              role: role,
              preferred_language: data.preferred_language || 'English',
              area: data.area || 'Gokulam',
              department: data.department || null
            }
          }
        }),
        6000
      );

      if (authData?.user) {
        newProfile.id = authData.user.id;
        setUser(authData.user);
      } else {
        setUser({ id: newProfile.id, email });
      }

      // Upsert profile in Supabase profiles table
      try {
        await withTimeout(supabase.from('profiles').upsert(newProfile, { onConflict: 'id' }), 6000);
      } catch (upsertErr) {
        console.warn('Profile direct sync notice:', upsertErr);
      }

      setProfile(newProfile);
      localStorage.setItem('civicconnect_auth_profile', JSON.stringify(newProfile));
      return {};
    } catch (err: any) {
      setUser({ id: newProfile.id, email });
      setProfile(newProfile);
      localStorage.setItem('civicconnect_auth_profile', JSON.stringify(newProfile));
      return {};
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      role: newRole,
      department: profile.department || (newRole === 'corporation' ? 'Municipal Administration' : newRole === 'worker' ? 'Road Maintenance & Pavements' : null),
      updated_at: new Date().toISOString()
    };
    setProfile(updated);
    localStorage.setItem('civicconnect_auth_profile', JSON.stringify(updated));

    if (isConfigured && profile?.id) {
      try {
        await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id);
      } catch {}
    }
  };

  const logout = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    localStorage.removeItem('civicconnect_auth_profile');
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string): Promise<{ error?: string; success?: boolean }> => {
    if (!isConfigured) {
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return { success: true };
    } catch (err: any) {
      return { error: err.message || 'Password reset request failed' };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data, updated_at: new Date().toISOString() };
    setProfile(updated);
    localStorage.setItem('civicconnect_auth_profile', JSON.stringify(updated));

    if (isConfigured && profile?.id) {
      try {
        await supabase
          .from('profiles')
          .update(data)
          .eq('id', profile.id);
      } catch {}
    }
  };

  const isCitizen = profile?.role === 'citizen';
  const isCorporation = profile?.role === 'corporation';
  const isWorker = profile?.role === 'worker';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        switchRole,
        isCitizen,
        isCorporation,
        isWorker
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
