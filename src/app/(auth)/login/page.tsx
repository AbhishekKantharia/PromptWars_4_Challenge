'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
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
          <CardTitle>Welcome Back</CardTitle>
          <p className="text-sm text-fifa-gray">Sign in to FIFA Smart Stadium</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button variant="gold" className="w-full" type="submit" loading={loading}>Sign In</Button>
          </form>
          <p className="text-center text-sm text-fifa-gray mt-4">
            Don&apos;t have an account? <Link href="/register" className="text-fifa-accent hover:underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
