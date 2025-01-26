import * as THREE from "three";

self.onmessage = function (event) {
  const { action, data } = event.data;

  if (action === "normalizeSplinePoints") {
    const { splinePoints } = data;

    const boundingBox = new THREE.Box3().setFromPoints(
      splinePoints.map((p) => new THREE.Vector3(...p))
    );
    const size = boundingBox.getSize(new THREE.Vector3());
    const scaleFactor = 200 / Math.max(size.x, size.y, size.z);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const normalizedPoints = splinePoints.map((p) =>
      new THREE.Vector3(...p).sub(center).multiplyScalar(scaleFactor)
    );

    self.postMessage({ action: "normalizedPoints", data: normalizedPoints });
  }
};
