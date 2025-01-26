import { createEffect, onMount, onCleanup, createSignal } from "solid-js";
import * as THREE from "three";
import { DataStructure, Scalar, Spline } from "../../types/Types";

interface SplineViewerProps {
  url: string;
  name: string;
}

const SplineViewer = (props: SplineViewerProps) => {
  let container: HTMLDivElement | undefined;
  const [scalars, setScalars] = createSignal<Scalar[]>([]);
  const [splines, setSplines] = createSignal<Spline[]>([]);

  let splineProcessWorker: Worker;
  let splineNormalizeWorker: Worker;

  onMount(() => {
    // Initialize Web Workers
    splineNormalizeWorker = new Worker(
      new URL("../../workers/splineWorkerNormalize.js", import.meta.url),
      { type: "module" }
    );

    splineProcessWorker = new Worker(
      new URL("../../workers/splineWorkerProcess.js", import.meta.url),
      { type: "module" }
    );

    // Fetch and process data using splineProcessWorker
    splineProcessWorker.postMessage({ url: props.url });

    splineProcessWorker.onmessage = (event) => {
      const { scalars: newScalars, splines: newSplines } = event.data;
      setScalars(newScalars);
      setSplines(newSplines);
    };

    // Initialize THREE.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Group for splines
    const splineGroup = new THREE.Group();
    scene.add(splineGroup);

    const animate = () => {
      requestAnimationFrame(animate);
      splineGroup.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    onCleanup(() => {
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      splineProcessWorker.terminate();
      splineNormalizeWorker.terminate();
    });

    createEffect(() => {
      const currentSplines = splines();
      if (currentSplines.length > 0) {
        splineGroup.clear();

        currentSplines.forEach((spline) => {
          splineNormalizeWorker.postMessage({
            action: "normalizeSplinePoints",
            data: { splinePoints: spline.points },
          });

          splineNormalizeWorker.onmessage = (event) => {
            if (event.data.action === "normalizedPoints") {
              const normalizedPoints = event.data.data;

              const curve = new THREE.CatmullRomCurve3(normalizedPoints, true);
              const geometry = new THREE.BufferGeometry().setFromPoints(
                curve.getPoints(100)
              );

              const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
              const splineLine = new THREE.Line(geometry, material);
              splineGroup.add(splineLine);

              normalizedPoints.forEach((point) => {
                const sphereGeometry = new THREE.SphereGeometry(2, 16, 16);
                const sphereMaterial = new THREE.MeshBasicMaterial({
                  color: 0xffffff,
                });
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.copy(point);
                splineGroup.add(sphere);
              });
            }
          };
        });

        const calculateBoundingBox = () => {
          const allPoints = currentSplines.flatMap((spline) => spline.points);

          scalars().forEach((_, index) => {
            const offset = (index - (scalars().length - 1) / 2) * 10;
            allPoints.push(new THREE.Vector3(offset, 0, 0));
          });

          return new THREE.Box3().setFromPoints(allPoints);
        };

        const boundingBox = calculateBoundingBox();
        const size = boundingBox.getSize(new THREE.Vector3());
        const center = boundingBox.getCenter(new THREE.Vector3());
        camera.position.set(center.x, center.y, Math.max(size.x, size.y) * 2);
        camera.lookAt(center);
      }
    });
  });

  return (
    <div
      ref={(el) => (container = el)}
      style={{ width: "600px", height: "600px" }}
    />
  );
};

export default SplineViewer;
