import { Component, createResource, For, Show } from "solid-js";
import { fetchData } from "../services/api";
import { calculateAge } from "../utils/calculateAge";
import { Patient } from "../types/Types";

const PatientOverview: Component = () => {
  const [patients] = createResource<Patient[]>(() =>
    fetchData<Patient[]>("/patients/")
  );

  return (
    <div class="container mt-4">
      <h1 class="display-4 mb-4">Patient Overview</h1>

      {/* Display Loading State */}
      <Show when={patients.loading}>
        <div class="text-info">Loading patients...</div>
      </Show>

      {/* Display Error State */}
      <Show when={patients.error}>
        <div class="alert alert-danger" role="alert">
          Error: {patients.error.message || "An unexpected error occurred."}
        </div>
      </Show>

      {/* Display Patient Data */}
      <Show when={patients.state === "ready" && patients()}>
        <table class="table table-striped table-hover">
          <thead class="thead-dark">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Age</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <For each={patients()}>
              {(patient) => (
                <tr>
                  <td>{patient.name}</td>
                  <td>{calculateAge(patient.date_of_birth)}</td>
                  <td>
                    <a
                      href={`/patients/${patient.id}`}
                      class="btn btn-primary btn-sm"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
};

export default PatientOverview;
