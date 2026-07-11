/**
 * Server-side IMGBB upload helper. The API key must never reach the client;
 * this module is only imported by the /api/upload route handler.
 */

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

/**
 * Upload a base64-encoded image to IMGBB.
 * @param {string} base64 image data (no data: prefix)
 * @param {string} [name] optional file name
 * @returns {Promise<{url:string, delete_url:string, thumb:string}>}
 */
export async function uploadToImgbb(base64, name) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) throw new Error("IMGBB_API_KEY belum dikonfigurasi");

  const body = new FormData();
  body.append("key", apiKey);
  body.append("image", base64);
  if (name) body.append("name", name);

  const res = await fetch(IMGBB_ENDPOINT, { method: "POST", body });
  if (!res.ok) {
    throw new Error(`IMGBB upload gagal: ${res.status}`);
  }
  const json = await res.json();
  if (!json?.success) {
    throw new Error(json?.error?.message || "IMGBB upload gagal");
  }
  return {
    url: json.data.url,
    delete_url: json.data.delete_url,
    thumb: json.data.thumb?.url || json.data.url,
  };
}
