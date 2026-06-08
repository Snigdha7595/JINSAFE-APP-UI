import React, { useState } from 'react';
import { uploadDocument, extractFieldsFromDocument } from '../services/ocrApi';
import type { DocumentProcessResponse } from '../types/ocr.types';

type Props = {
  onResult: (res: DocumentProcessResponse) => void;
  onExtractFields?: (res: DocumentProcessResponse) => void;
  onUploadStart?: () => void;
  onUploadError?: () => void;
};

export default function OCRUpload({ onResult, onUploadStart, onUploadError }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    if (typeof onUploadStart === "function") {
      onUploadStart();
    }

    try {
      try {
        const fastRes: DocumentProcessResponse = await extractFieldsFromDocument(file);
        if (typeof onExtractFields === "function") {
          onExtractFields(fastRes);
        }
      } catch (fastError: any) {
        console.warn("Fast field extraction failed:", fastError);
      }

      const res: DocumentProcessResponse = await uploadDocument(file);
      onResult(res);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
      if (typeof onUploadError === "function") {
        onUploadError();
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files ? e.target.files[0] : null;
    setFile(f);
    setError(null);
    if (f) {
      // create object URL for preview
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  }

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div>
      <label className="mb-2 block">Select document</label>
      <input
        type="file"
        accept=".png,.jpg,.jpeg,.pdf,.docx,.txt,.csv,.xlsx"
        onChange={handleSelect}
      />
      {previewUrl && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowPreview((s) => !s)}
            className="btn btn-secondary mr-2"
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <a href={previewUrl} target="_blank" rel="noreferrer" className="btn btn-outline">Open in new tab</a>
        </div>
      )}

      {showPreview && previewUrl && (
        <div className="mt-3 ocr-preview" style={{maxWidth: '600px'}}>
          {file && file.type.startsWith('image/') && (
            <img src={previewUrl} alt="preview" style={{maxWidth: '100%'}} />
          )}
          {file && file.type === 'application/pdf' && (
            <object data={previewUrl} type="application/pdf" width="100%" height="600"> 
              <p>PDF preview not available — <a href={previewUrl} target="_blank" rel="noreferrer">open</a> instead.</p>
            </object>
          )}
          {file && !file.type.startsWith('image/') && file.type !== 'application/pdf' && (
            <div className="p-2 border">
              <p>Preview not available for this file type.</p>
              <p className="text-muted">{file.name}</p>
            </div>
          )}
        </div>
      )}
      <div className="mt-2">
        <button onClick={handleUpload} disabled={!file || loading} className="btn btn-primary">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
}
