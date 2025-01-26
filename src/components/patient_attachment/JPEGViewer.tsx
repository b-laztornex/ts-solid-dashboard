// src/components/JPEGViewer.tsx
import { Component } from "solid-js";

interface JPEGViewerProps {
  url: string;
  name: string;
}

const JPEGViewer: Component<JPEGViewerProps> = (props) => (
  <div>
    <img
      src={`http://localhost:8000${props.url}`}
      alt={props.name}
      class="img-fluid"
    />
    <p>{props.name}</p>
  </div>
);

export default JPEGViewer;
