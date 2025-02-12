import {
  createEffect,
  createResource,
  onMount,
  onCleanup,
  createSignal,
} from "solid-js";
import * as THREE from "three";
import { FontLoader, TextGeometry } from "three-stdlib";
import { DataStructure, Scalar, Spline } from "../../types/Types";
import { fetchData } from "../../services/api";

interface SplineViewerProps {
  url: string;
  name: string;
}

const SplineViewer = (props: SplineViewerProps) => {
  let container: HTMLDivElement | undefined;
  const [scalars, setScalars] = createSignal([]);
  const [splines, setSplines] = createSignal([]);

  const [data] = createResource<DataStructure>(() =>
    fetchData<DataStructure>(`${props.url}`)
  );

  createEffect(() => {
    if (data()) {
      const newScalars: Scalar[] = [];
      const newSplines: Spline[] = [];

      Object.entries(data()).forEach(([key, value]) => {
        if (value.type === "Scalar") newScalars.push({ label: key, ...value });
        if (Array.isArray(value.points))
          newSplines.push({ label: key, ...value });
      });

      setScalars(newScalars);
      setSplines(newSplines);
    }
  });

  onMount(() => {
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

      // Rotate the spline group
      splineGroup.rotation.y += 0.01; // Adjust rotation speed if needed

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
    });

    createEffect(() => {
      const currentSplines = splines();
      if (currentSplines.length > 0) {
        const normalizeSplinePoints = (splinePoints) => {
          const boundingBox = new THREE.Box3().setFromPoints(
            splinePoints.map((p) => new THREE.Vector3(...p))
          );
          const size = boundingBox.getSize(new THREE.Vector3());
          const scaleFactor = 200 / Math.max(size.x, size.y, size.z);
          const center = boundingBox.getCenter(new THREE.Vector3());
          return splinePoints.map((p) =>
            new THREE.Vector3(...p).sub(center).multiplyScalar(scaleFactor)
          );
        };

        // Clear previous splines
        splineGroup.clear();

        currentSplines.forEach((spline) => {
          const normalizedPoints = normalizeSplinePoints(spline.points);
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
        });

        const calculateBoundingBox = () => {
          const allPoints = currentSplines.flatMap((spline) =>
            normalizeSplinePoints(spline.points)
          );

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
