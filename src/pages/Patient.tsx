import { Component } from "solid-js";
import { useParams } from "@solidjs/router";
import PatientAttachments from "../components/PatientAttachments";
import PatientDetail from "../components/PatientDetail";

const Patient: Component = () => {
  const params = useParams<{ id: string }>(); // Get patient ID from the URL
  return (
    <div class="container mt-4">
      <div class="row">
        <div class="col-12 col-md-3">
          <PatientDetail patientId={params.id} />
        </div>
        <div class="col-12 col-md-9">
          <PatientAttachments patientId={params.id} />
        </div>
      </div>
    </div>
  );
};

export default Patient;
