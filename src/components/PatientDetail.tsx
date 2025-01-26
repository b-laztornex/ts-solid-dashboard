import { Component, createResource, Show } from "solid-js";
import { fetchData } from "../services/api";
import type { PatientDetail } from "../types/Types";

interface PatientDetailProps {
  patientId: string;
}

const PatientDetail: Component<PatientDetailProps> = (props) => {
  const [patient] = createResource<PatientDetail>(() =>
    fetchData<PatientDetail>(`/patients/${props.patientId}`)
  );

  return (
    <div class="container mt-4">
      <h1 class="display-6 mb-2">Patient Details</h1>

      <Show when={patient.loading}>
        <div class="d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </Show>

      <Show when={patient.error}>
        <div class="text-danger">
          Error:{" "}
          {patient.error?.message || `An unexpected error occurred: ${patient}`}
        </div>
      </Show>

      <Show when={patient.state === "ready" && patient()}>
        {patient() && (
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{patient()?.name}</h5>
              <p class="card-text">
                <strong>Date of Birth:</strong> {patient()?.date_of_birth}
              </p>
              <p class="card-text">
                <strong>Sex:</strong> {patient()?.sex}
              </p>
              <p class="card-text">
                <strong>Assigned Physician:</strong>{" "}
                {patient()?.assigned_physician}
              </p>
              <p class="card-text">
                <strong>Clinical Notes:</strong> {patient()?.clinical_notes}
              </p>
              <div class="mt-3">
                <h6>Links:</h6>
                <ul>
                  {patient()?.links.map((link) => (
                    <li>
                      <a href={link.href} class="text-primary">
                        {link.rel} ({link.method})
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <a href="/" class="btn btn-primary mt-3">
                Back to Overview
              </a>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};

export default PatientDetail;
