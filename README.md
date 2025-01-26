# LARALAB Heart Analyzer

This repository contains the Heart Analyzer MVP-2, a **SolidJS** Single Page Application (SPA) designed to serve as a dashboard utility for medical staff. It retrieves data, CT scans, and other information and visualizes them based on the data type:

- `application/com.laralab.analysis-primitives+json`: Structured analysis results
- `image/jpeg`: Screenshots
- `model/gltf+json`: Segmentation 3D models

## Usage

This project manages dependencies via [pnpm](https://pnpm.io). While `pnpm-lock.yaml` is included, any package manager (e.g., npm, yarn) can be used.

Install the dependencies:

```bash
pnpm install
# or
npm install
# or
yarn install
```

Run the development server using Vite:

```bash
pnpm run dev
# or
npm run dev
# or
yarn dev
```

### CORS Issues

If you encounter CORS issues while retrieving data from the **FastAPI** backend in your local environment, there are two approaches to resolve it:

#### 1. Adjusting CORS Middleware in FastAPI

Add the following code before initializing the FastAPI app static routes:

```python
from fastapi.middleware.cors import CORSMiddleware

# Custom middleware
class CustomCORSMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, allowed_origins: list[str]):
        super().__init__(app)
        self.allowed_origins = allowed_origins

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        origin = request.headers.get("origin")
        if origin in self.allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
# List of allowed origins
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add the custom CORS middleware
app.add_middleware(CustomCORSMiddleware, allowed_origins=allowed_origins)
```

#### 2. Using a Proxy in Your Development Server

Set up a proxy in the `vite.config.ts` file:

```javascript
proxy: {
  '/patients': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, _res) => {
        console.error('Proxy error:', err);
      });
      proxy.on('proxyReq', (proxyReq, req, _res) => {
        console.log('Proxying request:', req.method, req.url, '->', proxyReq.path);
      });
      proxy.on('proxyRes', (proxyRes, req, _res) => {
        console.log('Received response:', proxyRes.statusCode, req.url);
      });
    },
  },
},
```

## Available Scripts

### `pnpm run dev` or `npm run dev`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page reloads on edits.

### `pnpm run build` or `npm run build`

Builds the app for production in the `dist` folder. The build is optimized for the best performance and ready for deployment.

### Deployment

Deploy the `dist` folder to any static hosting provider (e.g., Netlify, Vercel, Surge).

---

## Project Structure (UI Foundation) && Directory Descriptions

The project adheres to a modular structure for scalability and maintainability:

- **`components`**: Contains modular reusable UI components (e.g., Buttons, Table, Modal)
- **`pages`**: Page components corresponding to major application features.
- **`routes`**: Defines routes for application navigation and lazy-loading components if needed.
- **`services`**: Contains API service logic to handle REST apicall to the backend.
- **`store`**: Manages global state using tools Redux.
- **`assets`**: Stores static files such as images, fonts.
- **`styles`**: Defines Custom configuration and global styles.
- **`utils`**: Utility functions for data transformation and other helper logic.
- **`__tests__`**: Units test are place here
- **`workers`**: Independent execution background processing workers are place here

### Core Files

- **`App.tsx`**: The root component that integrates routing and sets up the app layout.
- **`index.tsx`**: Entry point of the application. Responsible for rendering `App` and setting up any providers or global configurations.

### Core Components

- **`patients_attachment/GLTFViewer.tsx`**: The GLTFViewer component load and display 3D models in the GLTF format within a web application.
  At first initializes a 3D scene using the Three.js library, setting up essential elements like scene, camera, lighting, and controls to allow user interaction with the 3D model
  Utilizing the GLTFLoader from Three.js, the component loads a GLTF model from a specified URL.
  After loading, the component calculates the model's size and centers it within the scene. It also scales the model to fit a predefined size for optimal viewing(\*).The component enables shadows for the model and adds a ground plane to receive these shadows, enhancing the visual realism of the scene. With the integration of orbit controls, users can interact with the 3D model, allowing them to rotate, zoom, and pan to view the model from different angles.
  It also provides buttons for users to zoom in and out.Upon component unmounting, it ensures that resources are properly disposed of to prevent memory leaks.

- **`patients_attachment/IMGViewer.tsx`**: Preview images with an img tag :)
- **`patients_attachment/SplineViewer.tsx`**: This component provides an interactive visualization of 3D splines and scalars, useful for scientific or technical applications where users need to analyze spline-based data models. It is well-suited for scenarios like medical imaging, engineering simulations, or data visualization dashboards. Props:

url: The API endpoint to fetch data.
name: A name associated with the viewer.
State Management:

Uses createSignal for managing lists of scalars and splines.
Utilizes createResource to fetch data asynchronously from the provided url.
Data Processing:

Splits fetched data into scalars and splines based on the type property.
Normalizes spline points using bounding boxes to ensure consistent visualization.
3D Scene Setup:

Scene: Configures a Three.js scene with a dark background.
Lighting: Includes ambient and directional lights for better visibility.
Camera: Dynamically positions and adjusts based on the bounding box of the visualized data.
Spline Group: A Three.js group to organize and manage spline geometries and visual markers.
Spline Rendering:

Renders splines using CatmullRomCurve3 for smooth curves.
Adds visual markers (spheres) at key spline points for clarity.
Dynamically recalculates the bounding box and adjusts the camera to focus on all rendered elements.
Dynamic Updates:

Reacts to changes in the splines or scalars data to re-render the 3D elements.
Handles window resizing by adjusting the camera's aspect ratio and renderer size.
Lifecycle Management:

Uses onMount for initializing Three.js components and setting up the rendering loop.
Cleans up event listeners and DOM elements on component unmount (onCleanup).

# Leverage of Requirements

## Functional Requirements

### 1. UI Foundation

- **Scalability**: Create a modular and scalable UI scaffold that can easily adapt to future functionality.
- **Responsiveness**: Ensure the UI works seamlessly across Web, Tablet, and Phone devices.

### 2. Patient and Scan Overview

- Implement a dashboard to display a list of patients and their corresponding CT/Ultrasound scans.
- Include search, sorting, and filter functionalities for efficient data navigation.

### 3. Analysis Results View

- Display structured scalar data derived from analysis results.
- Provide a preview of analysis screenshots.
- Visualize 3D models in GLTF format with basic controls:
  - Rotation
  - Zooming
  - Panning

### 4. User Access Management

- Enable basic user authentication.
- Implement role-based access control (RBAC) to manage access to sensitive patient data.

---

## Non-Functional Requirements

### 1. Performance

- Ensure that the UI remains performant and responsive, even with large datasets.

### 2. Usability

- Design an intuitive interface to eliminate the need for extensive onboarding.

### 3. Scalability

- Build the system to accommodate future enhancements and integrations seamlessly.

### 4. Security

- Secure sensitive medical data in compliance with GDPR regulations.

### 5. Collaboration

- Provide a simple and smooth setup to facilitate onboarding for UI/UX designers, managers, and stakeholders.

### 6. Maintainability

- Implement clear documentation, coding standards, and a well-organized folder structure to support ongoing development efforts.
