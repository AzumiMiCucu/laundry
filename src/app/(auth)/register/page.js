"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal mendaftar");

      toast.success("Pendaftaran berhasil");
      // Auto sign-in.
      await signIn("credentials", {
        email: getValues("email"),
        password: getValues("password"),
        redirect: false,
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar</CardTitle>
        <CardDescription>Buat akun untuk mulai memesan laundry.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" placeholder="Budi Santoso" {...register("name")} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input id="phone" placeholder="0812xxxxxxxx" {...register("phone")} />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Daftar
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
