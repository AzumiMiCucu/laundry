"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Power, Wrench } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { serviceSchema } from "@/lib/validations";
import { formatRupiah } from "@/lib/utils";

export function AdminServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(serviceSchema) });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services?all=1", { cache: "no-store" });
      const json = await res.json();
      setServices(json.data || []);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      description: "",
      pricePerKg: "",
      minWeight: "",
      estimatedHours: "",
    });
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    reset({
      name: s.name,
      description: s.description || "",
      pricePerKg: s.pricePerKg,
      minWeight: s.minWeight,
      estimatedHours: s.estimatedHours,
    });
    setOpen(true);
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { id: editing.id, ...values } : values;
      const res = await fetch("/api/services", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal menyimpan");
      toast.success(editing ? "Layanan diperbarui" : "Layanan ditambahkan");
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (s) => {
    try {
      const res = await fetch("/api/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, isActive: s.isActive ? 0 : 1 }),
      });
      if (!res.ok) throw new Error();
      toast.success(s.isActive ? "Layanan dinonaktifkan" : "Layanan diaktifkan");
      load();
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  const remove = async (s) => {
    if (!confirm(`Hapus layanan "${s.name}"?`)) return;
    try {
      const res = await fetch(`/api/services?id=${s.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Layanan dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus (mungkin masih dipakai order)");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Layanan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Wrench className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Belum ada layanan.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right">Harga/kg</TableHead>
                  <TableHead className="text-center">Min</TableHead>
                  <TableHead className="text-center">Estimasi</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{s.name}</div>
                      <div className="max-w-xs truncate text-xs text-slate-400">
                        {s.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRupiah(s.pricePerKg)}
                    </TableCell>
                    <TableCell className="text-center">{s.minWeight} kg</TableCell>
                    <TableCell className="text-center">{s.estimatedHours} jam</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={s.isActive ? "success" : "secondary"}>
                        {s.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggle(s)}>
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(s)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Layanan" : "Tambah Layanan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" {...register("description")} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pricePerKg">Harga/kg</Label>
                <Input id="pricePerKg" type="number" {...register("pricePerKg")} />
                {errors.pricePerKg && (
                  <p className="text-xs text-red-600">{errors.pricePerKg.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minWeight">Min (kg)</Label>
                <Input id="minWeight" type="number" step="0.5" {...register("minWeight")} />
                {errors.minWeight && (
                  <p className="text-xs text-red-600">{errors.minWeight.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estimatedHours">Jam</Label>
                <Input id="estimatedHours" type="number" {...register("estimatedHours")} />
                {errors.estimatedHours && (
                  <p className="text-xs text-red-600">{errors.estimatedHours.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
