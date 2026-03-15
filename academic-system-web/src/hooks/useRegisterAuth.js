import { useRouter } from 'next/navigation';

export default function useRegisterAuth() {
  const router = useRouter();

  const registerWithEmail = async (formData) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || null,
        lastName: formData.lastName.trim(),
        suffix: formData.suffix || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.error || 'Registration failed');
      error.code = data.code;
      error.status = res.status;
      error.retryAfterSeconds = data.retryAfterSeconds;
      throw error;
    }
    return data;
  };

  const verifySignupCode = async ({ email, token }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    router.push('/login');
    return data;
  };

  return {
    registerWithEmail,
    verifySignupCode,
  };
}
