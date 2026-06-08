export type AuditObservation = {
  id?: string;
  observation_detail?: string;
  observation_type?: string;
  observation_category?: string;
  risk_potential?: string;
  exact_location?: string;
  recommendation?: string;
  // Fallbacks for older formats if any
  title?: string;
  description?: string;
  severity?: string;
  category?: string;
};

export type DocumentProcessResponse = {
  success: boolean;
  filename: string;
  extracted_text: string;
  observations: AuditObservation[];
  metadata: Record<string, any>;
  field_mappings?: Record<string, any>;
};
