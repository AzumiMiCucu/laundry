import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToImgbb } from "@/lib/imgbb";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/**
 * POST /api/upload — proxy an image to IMGBB. Field name: "image".
 */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "FormData tidak valid" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "File gambar wajib diisi" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Format harus JPG, PNG, atau WEBP" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ukuran maksimal 5MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const result = await uploadToImgbb(base64, file.name);
    return NextResponse.json({
      url: result.url,
      delete_url: result.delete_url,
      thumb: result.thumb,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Upload gagal" },
      { status: 502 },
    );
  }
}
