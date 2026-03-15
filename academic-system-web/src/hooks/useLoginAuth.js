import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';

export default function useLoginAuth() {
  const router = useRouter();

  const loginWithEmail = async ({ email, password }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    await supabase.auth.setSession(data.session);

    const targetPath = data.redirectPath || '/';
    router.push(targetPath);

    return data;
  };

  return { loginWithEmail };
}
