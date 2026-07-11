import { z } from "zod";

/** Login form. */
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

/** Registration form. */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    phone: z
      .string()
      .min(8, "Nomor telepon tidak valid")
      .max(20, "Nomor telepon terlalu panjang"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

/** Step 1: pick a service + estimated weight. */
export const orderServiceStepSchema = z.object({
  serviceId: z.string().min(1, "Pilih layanan terlebih dahulu"),
  estimatedWeight: z.coerce
    .number({ invalid_type_error: "Berat harus berupa angka" })
    .positive("Berat harus lebih dari 0"),
});

/** A single uploaded photo. */
export const photoSchema = z.object({
  url: z.string().url(),
  delete_url: z.string().url().optional().nullable(),
});

/** Step 2: photos. */
export const orderPhotoStepSchema = z.object({
  photos: z
    .array(photoSchema)
    .min(1, "Unggah minimal 1 foto")
    .max(5, "Maksimal 5 foto"),
});

/** Step 3: pickup address + schedule. */
export const orderPickupStepSchema = z.object({
  pickupAddress: z.string().min(5, "Alamat pickup minimal 5 karakter"),
  pickupDatetime: z.string().min(1, "Pilih jadwal pickup"),
  specialNotes: z.string().max(500, "Catatan terlalu panjang").optional().or(z.literal("")),
});

/** Full create-order payload (API). */
export const createOrderSchema = z.object({
  service_id: z.string().min(1),
  estimated_weight: z.coerce.number().positive(),
  photos: z.array(photoSchema).min(1).max(5),
  special_notes: z.string().max(500).optional().nullable(),
  pickup_address: z.string().min(5),
  pickup_datetime: z.number().int().nullable().optional(),
});

/** Update order status (API). */
export const updateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "received",
    "washing",
    "drying",
    "ironing",
    "ready",
    "delivered",
  ]),
  notes: z.string().max(500).optional().or(z.literal("")),
});

/** Service create/update (admin). */
export const serviceSchema = z.object({
  name: z.string().min(2, "Nama layanan minimal 2 karakter"),
  description: z.string().max(300).optional().or(z.literal("")),
  pricePerKg: z.coerce.number().positive("Harga harus lebih dari 0"),
  minWeight: z.coerce.number().positive("Berat minimum harus lebih dari 0"),
  estimatedHours: z.coerce.number().int().positive("Estimasi jam harus lebih dari 0"),
  isActive: z.coerce.number().int().min(0).max(1).optional(),
});
