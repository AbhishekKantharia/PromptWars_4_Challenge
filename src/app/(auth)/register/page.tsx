'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = '/assistant';
    }, 500);
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
            <Input label="Full Name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
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
