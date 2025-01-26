export type Link = {
  rel: string; // The relationship type (e.g., "self", "attachments")
  href: string; // The URL or path to the resource
  method: string; // The HTTP method to be used (e.g., "GET", "POST")
};

export type Patient = {
  id: string; // The unique identifier for the patient
  links: Link[]; // An array of links associated with the patient
  name: string; // The patient's name
  date_of_birth: string; // The patient's date of birth in ISO format (YYYY-MM-DD)
};

export type PatientDetail = Patient & {
  sex: "male" | "female" | "other"; // The patient's sex
  assigned_physician: string; // The name of the assigned physician
  clinical_notes: string; // Clinical notes for the patient
};

export interface Attachment {
  id: string;
  links: Link[];
  name: string;
  media_type: string;
}

// Interface for Scalar data
export interface Scalar {
  type: "Scalar";
  value: number;
  unit: string | null;
}

// Interface for Spline data
export interface Spline {
  type: "ClosedCatmullRomSpline";
  points: [number, number, number][];
}

// Union type for possible data entries
type DataEntry = Scalar | Spline;

// Interface for the entire data structure
export interface DataStructure {
  [key: string]: DataEntry;
}
