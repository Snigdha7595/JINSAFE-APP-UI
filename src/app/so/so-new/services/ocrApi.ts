const OCR_API_BASE_URL =
  process.env.NEXT_PUBLIC_OCR_API_URL?.trim() ||
  "http://localhost:8000";

const normalizeUrl = (url: string) => url.replace(/\/+$/, "");

export async function uploadDocument(file: File): Promise<any> {
  const form = new FormData();
  form.append('file', file, file.name);

  const uploadUrl = `${normalizeUrl(OCR_API_BASE_URL)}/api/v1/upload`;
  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || 'Upload failed');
  }

  return res.json();
}

export async function extractFieldsFromDocument(file: File): Promise<any> {
  const form = new FormData();
  form.append('file', file, file.name);

  const extractUrl = `${normalizeUrl(OCR_API_BASE_URL)}/api/v1/extract-fields`;
  const res = await fetch(extractUrl, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || 'Field extraction failed');
  }

  return res.json();
}

export async function batchUploadDocuments(files: File[]): Promise<any> {
  const form = new FormData();
  files.forEach((f) => form.append('files', f, f.name));

  const uploadUrl = `${normalizeUrl(OCR_API_BASE_URL)}/api/v1/batch-upload`;
  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || 'Batch upload failed');
  }
  return res.json();
}
