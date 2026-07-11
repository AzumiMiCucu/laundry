"use client";

import { useState, useCallback } from "react";

/**
 * Upload images to /api/upload (IMGBB proxy). Tracks progress + errors.
 * @returns {{
 *   upload: (file: File) => Promise<{url:string, delete_url:string, thumb:string}>,
 *   uploading: boolean,
 *   progress: number,
 *   error: string|null
 * }}
 */
export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = useCallback((file) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("image", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve(json);
          } else {
            const msg = json?.error || "Upload gagal";
            setError(msg);
            reject(new Error(msg));
          }
        } catch (err) {
          setError("Respons tidak valid");
          reject(err);
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setError("Kesalahan jaringan");
        reject(new Error("Kesalahan jaringan"));
      };

      xhr.send(form);
    });
  }, []);

  return { upload, uploading, progress, error };
}
