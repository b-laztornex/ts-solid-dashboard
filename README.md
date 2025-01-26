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

Add the following code before initializing the FastAPI app:

```python
from fastapi.middleware.cors import CORSMiddleware

# List of allowed origins
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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

## Project Structure (UI Foundation)

The project adheres to a modular structure for scalability and maintainability:

### Directory Descriptions

- **`components`**: Contains modular reusable UI components (e.g., Buttons, Table, Modal)
- **`pages`**: Page components corresponding to major application features.
- **`routes`**: Defines routes for application navigation and lazy-loading components if needed.
- **`services`**: Contains API service logic to handle REST apicall to the backend.
- **`store`**: Manages global state using tools Redux.
- **`assets`**: Stores static files such as images, fonts.
- **`styles`**: Defines Custom configuration and global styles.
- **`utils`**: Utility functions for data transformation and other helper logic.

### Core Files

- **`App.tsx`**: The root component that integrates routing and sets up the app layout.
- **`index.tsx`**: Entry point of the application. Responsible for rendering `App` and setting up any providers or global configurations.
