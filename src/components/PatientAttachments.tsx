import { Component, createResource, For, Show } from "solid-js";
import { fetchData } from "../services/api";
import type { Attachment } from "../types/Types";
import GLTFViewer from "./patient_attachment/GLTFViewer";
import IMGViewer from "./patient_attachment/IMGViewer";
import SplineViewer from "./patient_attachment/SplineViewer";

interface PatientAttachmentsProps {
  patientId: string;
}

const PatientAttachments: Component<PatientAttachmentsProps> = (props) => {
  const [attachments] = createResource<Attachment[]>(() =>
    fetchData<Attachment[]>(`/attachments/?owner_id=${props.patientId}`)
  );

  return (
    <div class="mt-4">
      <h5>Attachments</h5>
      <Show
        when={!attachments.loading}
        fallback={<p>Loading attachments...</p>}
      >
        <ul>
          <For each={attachments()}>
            {(attachment) => {
              const dataLink = attachment.links.find(
                (link) => link.rel === "data"
              )?.href;

              return (
                <li>
                  <Show
                    when={dataLink}
                    fallback={
                      <p>
                        No viewer available for media type:{" "}
                        {attachment.media_type}
                      </p>
                    }
                  >
                    <p>{attachment.media_type}</p>

                    {attachment.media_type === "model/gltf+json" && (
                      <GLTFViewer url={dataLink!} name={attachment.name} />
                    )}
                    {attachment.media_type === "image/jpeg" && (
                      <IMGViewer url={dataLink!} name={attachment.name} />
                    )}
                    {attachment.media_type ===
                      "application/com.laralab.analysis-primitives+json" && (
                      <SplineViewer url={dataLink!} name={attachment.name} />
                    )}
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
    </div>
  );
};

export default PatientAttachments;
