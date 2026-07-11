"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Email atau password salah");
        return;
      }
      toast.success("Berhasil masuk");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk</CardTitle>
        <CardDescription>Masuk untuk memesan dan melacak laundry-mu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Masuk
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Daftar
          </Link>
        </p>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-600">Akun demo:</p>
          <p>admin@laundry.com / admin123</p>
          <p>customer@laundry.com / customer123</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-slate-500">Memuat…</div>}>
      <LoginForm />
    </Suspense>
  );
}
