'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/assistant');
    }
  };

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gold-gradient flex items-center justify-center text-fifa-navy font-bold text-lg mx-auto mb-3">FS</div>
          <CardTitle>Create Account</CardTitle>
          <p className="text-sm text-fifa-gray">Join FIFA Smart Stadium 2026</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <p className="text-sm text-fifa-red bg-fifa-red/10 px-3 py-2 rounded-lg" role="alert">{error}</p>}
            <Input label="Full Name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required aria-label="Full name" />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required aria-label="Email address" />
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required aria-label="Password" />
            <Button variant="gold" className="w-full" type="submit" loading={loading}>Create Account</Button>
          </form>
          <p className="text-center text-sm text-fifa-gray mt-4">
            Already have an account? <Link href="/login" className="text-fifa-accent hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
