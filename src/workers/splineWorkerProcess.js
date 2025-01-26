self.onmessage = async (event) => {
  const { url } = event.data;

  try {
    // Fetch data from the provided URL
    const new_url = "http://localhost:8000" + url;
    const response = await fetch(new_url);
    const data = await response.json();

    const newScalars = [];
    const newSplines = [];

    // Process the fetched data
    Object.entries(data).forEach(([key, value]) => {
      if (value.type === "Scalar") newScalars.push({ label: key, ...value });
      if (Array.isArray(value.points))
        newSplines.push({ label: key, ...value });
    });

    // Post the processed data back to the main thread
    self.postMessage({ scalars: newScalars, splines: newSplines });
  } catch (error) {
    console.log(error);
    console.log(new_url);
    console.error("Error in worker:", error);
    self.postMessage({ error: error.message });
  }
};
