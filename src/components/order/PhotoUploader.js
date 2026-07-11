"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/useUpload";

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Drag & drop / click photo uploader. Uploads to /api/upload (IMGBB proxy).
 * @param {{
 *   photos: Array<{url:string, delete_url?:string, thumb?:string}>,
 *   onChange: (photos:Array<any>) => void
 * }} props
 */
export function PhotoUploader({ photos = [], onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const { upload, uploading, progress } = useUpload();

  // Always hold the latest photos so sequential uploads append correctly.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const handleFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList);
      if (photosRef.current.length + files.length > MAX_FILES) {
        toast.error(`Maksimal ${MAX_FILES} foto`);
        return;
      }

      for (const file of files) {
        if (!ALLOWED.includes(file.type)) {
          toast.error(`${file.name}: format harus JPG, PNG, atau WEBP`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name}: ukuran maksimal 5MB`);
          continue;
        }
        try {
          const result = await upload(file);
          const nextPhotos = [
            ...photosRef.current,
            { url: result.url, delete_url: result.delete_url, thumb: result.thumb },
          ];
          photosRef.current = nextPhotos;
          onChange(nextPhotos);
          toast.success("Foto terunggah");
        } catch (err) {
          toast.error(err?.message || "Upload gagal");
        }
      }
    },
    [upload, onChange],
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const remove = (url) => {
    const next = photosRef.current.filter((p) => p.url !== url);
    photosRef.current = next;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5",
          dragging && "border-primary bg-primary/5",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-600">Mengunggah… {progress}%</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-slate-700">
              Tarik &amp; letakkan atau klik untuk unggah
            </p>
            <p className="text-xs text-slate-400">
              JPG, PNG, WEBP · maks 5MB · hingga {MAX_FILES} foto
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {photos.map((p) => (
            <div
              key={p.url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
            >
              <Image
                src={p.thumb || p.url}
                alt="Foto pakaian"
                fill
                sizes="120px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => remove(p.url)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Hapus foto"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
