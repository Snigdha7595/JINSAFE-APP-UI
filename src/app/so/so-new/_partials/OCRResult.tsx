import React from 'react';
import type { DocumentProcessResponse } from '../types/ocr.types';

type Props = {
  result: DocumentProcessResponse | null;
};

export default function OCRResult({ result }: Props) {
  if (!result) return <div>No result yet</div>;

  const fieldMappings = result.field_mappings || {};
  const formattedFields = Object.entries(fieldMappings)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([key, value]) => {
      const formattedValue =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value);
      return (
        <li key={key} className="mb-1">
          <strong>{key}</strong>: {formattedValue}
        </li>
      );
    });

  return (
    <div className="p-3 border rounded bg-white">
      <h3 className="mb-2">{result.filename}</h3>

      {formattedFields.length > 0 && (
        <>
          <h4 className="text-muted">Mapped Fields</h4>
          <ul>{formattedFields}</ul>
        </>
      )}

      <h4 className="text-muted">Extracted Text</h4>
      <pre className="whitespace-pre-wrap max-h-60 overflow-auto">{result.extracted_text}</pre>

      <h4 className="mt-3">Observations</h4>
      {result.observations.length === 0 && <div>No observations generated</div>}
      <ul>
        {result.observations.map((o) => (
          <li key={o.id || o.title} className="mb-2">
            <strong>{o.title}</strong> — <em>{o.severity}</em>
            <div>{o.description}</div>
            {o.recommendation && <div className="text-muted">Recommendation: {o.recommendation}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
