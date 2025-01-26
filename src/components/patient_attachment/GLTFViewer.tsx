import { Component, createSignal, onCleanup, onMount } from "solid-js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { API_BASE_URL } from "../../config/config";

interface GLTFViewerProps {
  url: string;
  name: string;
}

const GLTFViewer: Component<GLTFViewerProps> = (props) => {
  let container: HTMLDivElement | undefined;
  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;

  const [loadingProgress, setLoadingProgress] = createSignal(0);

  // Zoom functions
  const zoomIn = () => {
    if (camera) {
      camera.fov = Math.max(10, camera.fov - 5); // Decrease FOV to zoom in, with a minimum limit
      camera.updateProjectionMatrix();
    }
  };

  const zoomOut = () => {
    if (camera) {
      camera.fov = Math.min(100, camera.fov + 5); // Increase FOV to zoom out, with a maximum limit
      camera.updateProjectionMatrix();
    }
  };

  onMount(() => {
    if (!container) {
      return;
    }

    // Creates a new 3D scene where objects are added.
    const scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    // WebGLRenderer: Renders the 3D scene.
    // antialias: true: Enables smooth edges.
    // shadowMap:
    // domElement:
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    // Enables and configures shadows for realism.
    renderer.shadowMap.enabled = true;
    // Optional: Choose shadow map type
    renderer.shadowMap.type = THREE.VSMShadowMap;
    // Appends the renderer's canvas to the container.
    container.appendChild(renderer.domElement);

    // Light setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // OrbitControls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Load GLTF model
    const loader = new GLTFLoader();
    const modelUrl = `${API_BASE_URL}${props.url}`;
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Enable shadows for the model
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Compute the bounding box of the model
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const center = bbox.getCenter(new THREE.Vector3());

        // Determine the maximum dimension
        const maxDim = Math.max(size.x, size.y, size.z);

        // Desired size in your scene (e.g., 1 unit)
        const desiredSize = 3;

        // Calculate the scale factor
        const scale = desiredSize / maxDim;
        model.scale.set(scale, scale, scale);

        // Recompute the bounding box after scaling
        bbox.setFromObject(model);
        bbox.getCenter(center);

        // Center the model
        model.position.sub(center);

        // Add the model to the scene
        scene.add(model);

        // Add a ground plane to receive shadows
        const planeGeometry = new THREE.PlaneGeometry(500, 500);
        const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -desiredSize / 2; // Position it under the model
        plane.receiveShadow = true;
        scene.add(plane);

        // Start the animation loop
        animate();
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;

          setLoadingProgress(Math.round(percentComplete));
        } else {
          // Fallback: Estimate progress or show indeterminate state
          setLoadingProgress((prev) => (prev < 99 ? prev + 1 : 99));
        }
      },
      (error) => {
        console.error("An error occurred while loading the GLTF model:", error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    // Handle cleanup
    onCleanup(() => {
      renderer.dispose();
      controls.dispose();
    });
  });

  return (
    <div>
      <div class="progress">
        <div
          class="progress-bar w-100"
          role="progressbar"
          style={{ width: `${loadingProgress()}%` }}
          aria-valuenow={loadingProgress()}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {`${loadingProgress()}%`}
        </div>
      </div>
      <div ref={container} style={{ height: "450px" }} class="w-100" />
      <div>
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
      </div>
    </div>
  );
};

export default GLTFViewer;
