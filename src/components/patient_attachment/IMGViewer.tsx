// src/components/IMGViewer.tsx
import { Component } from "solid-js";

interface IMGViewerProps {
  url: string;
  name: string;
}

const IMGViewer: Component<IMGViewerProps> = (props) => (
  <div>
    <img
      src={`http://localhost:8000${props.url}`}
      alt={props.name}
      class="img-fluid"
    />
    <p>{props.name}</p>
  </div>
);

export default IMGViewer;
