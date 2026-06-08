import { DocumentProcessResponse, AuditObservation } from "../types/ocr.types";

/**
 * Maps extracted OCR observations to the form's expected structure
 */
export function mapOCRObservations(observations: AuditObservation[]) {
  return observations.map((obs: any, idx) => ({
    observationType: "",
    observationTypeDisplay: obs.observation_type || obs.title || "",
    observationCategory: "",
    observationCategoryDisplay: obs.observation_category || obs.category || "",
    observationSubcategory: "",
    observationSubcategoryDisplay: obs.observation_subcategory || obs.subcategory || "",
    observationSubsubcategory: obs.observation_subsubcategory || obs.subsubcategory || [],
    observationDetail: obs.observation_detail || obs.description || "",
    riskPotentials: "",
    riskPotentialsDisplay: obs.risk_potential || obs.severity || "",
    createdat: "",
    createdby: "",
    updatedat: "",
    updatedby: "",
    observationNo: idx + 1,
    rowIndex: idx,
    id: idx,
    status: "",
    exactLocation: obs.exact_location || "",
    actionsTaken: [],
    soImages: []
  }));
}

/**
 * Merges OCR extracted observations into existing observations
 * Avoids duplicates by checking if observation already exists
 */
export function mergeObservations(existingObservations: any[], newObservations: any[]) {
  if (!existingObservations) {
    return newObservations;
  }
  
  // Combine and ensure no duplicates based on observationDetail
  const merged = [...existingObservations];
  const existingDetails = new Set(existingObservations.map(o => o.observationDetail));
  
  newObservations.forEach(newObs => {
    if (!existingDetails.has(newObs.observationDetail)) {
      // Update observation numbers to continue from existing
      newObs.observationNo = existingObservations.length + (merged.length - existingObservations.length) + 1;
      merged.push(newObs);
    }
  });
  
  return merged;
}

/**
 * Formats duration string by extracting only numeric part (minutes)
 */
export function cleanDuration(duration: string | undefined): string {
  if (!duration) return "";

  // Prefer parsing to total minutes integer when possible
  const minutes = parseDurationToMinutes(duration);
  if (minutes !== null) return String(minutes);

  // Fallback: extract first integer found
  const onlyNumber = String(duration).trim().match(/(\d+)/);
  if (onlyNumber) return onlyNumber[1];

  return "";
}

/**
 * Parse a duration string and return total minutes as integer, or null if not parseable
 */
export function parseDurationToMinutes(duration: string | undefined): number | null {
  if (!duration) return null;
  const raw = String(duration).trim().toLowerCase();

  // Match patterns like '2 hours 30 minutes' or '2h 30m' or '2:30' or '02:05:30'
  const hrMinMatch = raw.match(/(?:(\d+)\s*h(?:ours?)?)\s*(?:[:\s,\-]+\s*(\d+)\s*m(?:in(?:utes?)?)?)?/);
  if (hrMinMatch) {
    const hrs = parseInt(hrMinMatch[1], 10) || 0;
    const mins = hrMinMatch[2] ? parseInt(hrMinMatch[2], 10) : 0;
    return hrs * 60 + mins;
  }

  // time-like strings e.g., 02:05:30 or 2:30
  const timeParts = raw.match(/^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?$/);
  if (timeParts) {
    const h = parseInt(timeParts[1] || '0', 10) || 0;
    const m = parseInt(timeParts[2] || '0', 10) || 0;
    const s = parseInt(timeParts[3] || '0', 10) || 0;
    const total = h * 3600 + m * 60 + s;
    return Math.ceil(total / 60);
  }

  // minutes only (e.g., '90 min', '120 minutes' or plain number '90')
  const minMatch = raw.match(/(\d+)\s*(m(?:in(?:ute)?s?)?)?\b/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  // seconds only (e.g., '90 sec')
  const secMatch = raw.match(/(\d+)\s*(s(?:ec(?:ond)?s?)?)\b/);
  if (secMatch) {
    const secs = parseInt(secMatch[1], 10);
    return Math.ceil(secs / 60);
  }

  return null;
}

/**
 * Parses date from various formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
 * Returns ISO format: YYYY-MM-DD
 */
export function parseDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  
  const trimmed = dateStr.trim();
  const parts = trimmed.split(/[-/]/);
  
  if (parts.length !== 3) return trimmed;
  
  if (parts[0].length === 4) {
    // Already YYYY-MM-DD format
    return trimmed;
  } else if (parts[2].length === 4) {
    // DD-MM-YYYY or DD/MM/YYYY → convert to YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  
  return trimmed;
}

const normalizeTextValue = (value: any): string => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const findMetadataValue = (
  metadata: Record<string, any>,
  aliases: string[]
): string => {
  if (!metadata || typeof metadata !== "object") return "";

  const normalizedAliases = aliases.map((alias) => alias.toLowerCase());

  const searchObject = (obj: Record<string, any>): string => {
    for (const key in obj) {
      const normalizedKey = key.toLowerCase();
      if (normalizedAliases.some((alias) => normalizedKey.includes(alias))) {
        const value = obj[key];
        if (typeof value === "string") return value.trim();
        if (value !== null && value !== undefined) return String(value).trim();
      }
    }

    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === "object") {
        const nested = searchObject(value as Record<string, any>);
        if (nested) return nested;
      }
    }

    return "";
  };

  return searchObject(metadata);
};

const findTextValue = (
  text: string,
  labels: string[],
  stopLabels: string[]
): string => {
  if (!text) return "";
  const normalizedText = text.replace(/\r/g, "\n");
  const stopPattern = stopLabels
    .map((label) => label.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
    .join("|");

  for (const label of labels) {
    const escapedLabel = label.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(
      `${escapedLabel}\s*[:\-]?\s*([\s\S]*?)(?=\s*(?:${stopPattern})\s*[:\-]|$)`,
      "i"
    );
    const match = normalizedText.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "";
};

const findValueInUnitDetails = (
  metadata: Record<string, any>,
  keys: string[]
): string => {
  const unitDetails = metadata?.unit_details || metadata?.unitDetails || metadata?.unitDetail;
  if (!unitDetails || typeof unitDetails !== "object") return "";

  for (const key of keys) {
    for (const detailKey in unitDetails) {
      if (detailKey.toLowerCase().includes(key.toLowerCase())) {
        const value = unitDetails[detailKey];
        if (typeof value === "string") return value.trim();
        if (value !== null && value !== undefined) return String(value).trim();
      }
    }
  }

  return "";
};

export function mapOCRMetadataToFormFields(
  response: DocumentProcessResponse
): {
  unitDisplay?: string;
  departmentDisplay?: string;
  sectionDisplay?: string;
  hod?: string;
  nameObserver?: string;
  siDate?: string;
  duration?: string;
} {
  const aliases = {
    unit: ["unit name", "unit", "unit_name", "unitname", "site", "facility"],
    department: ["department", "department name", "dept", "division"],
    section: ["visited section", "visited_section", "section", "section visited", "area", "area name"],
    hod: ["hod name", "hod", "head of department", "manager"],
    nameObserver: ["observer name", "name of observer", "observer", "observer_name", "inspector", "reported by", "inspected by"],
    siDate: ["so date", "si date", "date", "safety observation date", "inspection date"],
    duration: ["duration", "time", "time spent", "duration of observation", "inspection duration"],
  };

  const metadata = response?.metadata || {};
  const text = response?.extracted_text || "";
  const allLabels = Object.values(aliases).flat();

  return {
    unitDisplay:
      findValueInUnitDetails(metadata, aliases.unit) ||
      findMetadataValue(metadata, aliases.unit) ||
      findTextValue(text, aliases.unit, allLabels),
    departmentDisplay:
      findValueInUnitDetails(metadata, aliases.department) ||
      findMetadataValue(metadata, aliases.department) ||
      findTextValue(text, aliases.department, allLabels),
    sectionDisplay:
      findValueInUnitDetails(metadata, aliases.section) ||
      findMetadataValue(metadata, aliases.section) ||
      findTextValue(text, aliases.section, allLabels),
    hod:
      findValueInUnitDetails(metadata, aliases.hod) ||
      findMetadataValue(metadata, aliases.hod) ||
      findTextValue(text, aliases.hod, allLabels),
    nameObserver:
      findValueInUnitDetails(metadata, aliases.nameObserver) ||
      findMetadataValue(metadata, aliases.nameObserver) ||
      findTextValue(text, aliases.nameObserver, allLabels),
    siDate:
      findValueInUnitDetails(metadata, aliases.siDate) ||
      findMetadataValue(metadata, aliases.siDate) ||
      findTextValue(text, aliases.siDate, allLabels),
    duration:
        (() => {
          const raw =
            findValueInUnitDetails(metadata, aliases.duration) ||
            findMetadataValue(metadata, aliases.duration) ||
            findTextValue(text, aliases.duration, allLabels);
          const minutes = parseDurationToMinutes(raw);
          return minutes !== null ? String(minutes) : raw;
        })(),
  };
}

/**
 * Maps extracted OCR data to observation form fields
 */
export function mapOCRToObservationFields(
  response: DocumentProcessResponse
): {
  observationDetail?: string;
  observationTypeDisplay?: string;
  observationCategoryDisplay?: string;
  riskPotentialsDisplay?: string;
  exactLocation?: string;
} {
  const aliases = {
    observationDetail: [
      "observation", "observation detail", "observation details",
      "finding", "findings", "what was observed", "description",
      "issue", "issue description", "non-conformance"
    ],
    observationType: [
      "observation type", "type", "type of observation",
      "category type", "observation class"
    ],
    observationCategory: [
      "observation category", "category", "observation category",
      "sub-type", "subcategory", "safety category"
    ],
    riskPotentials: [
      "risk", "risk potential", "risk level", "severity",
      "impact", "potential risk", "hazard level", "priority"
    ],
    exactLocation: [
      "location", "exact location", "area", "section",
      "site", "place", "where", "workplace location"
    ],
  };

  const metadata = response?.metadata || {};
  const text = response?.extracted_text || "";
  const allLabels = Object.values(aliases).flat();

  return {
    observationDetail:
      findMetadataValue(metadata, aliases.observationDetail) ||
      findTextValue(text, aliases.observationDetail, allLabels),
    observationTypeDisplay:
      findMetadataValue(metadata, aliases.observationType) ||
      findTextValue(text, aliases.observationType, allLabels),
    observationCategoryDisplay:
      findMetadataValue(metadata, aliases.observationCategory) ||
      findTextValue(text, aliases.observationCategory, allLabels),
    riskPotentialsDisplay:
      findMetadataValue(metadata, aliases.riskPotentials) ||
      findTextValue(text, aliases.riskPotentials, allLabels),
    exactLocation:
      findMetadataValue(metadata, aliases.exactLocation) ||
      findTextValue(text, aliases.exactLocation, allLabels),
  };
}
