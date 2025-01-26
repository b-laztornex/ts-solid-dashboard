import { API_BASE_URL } from "../config/config";

// <T>: The function is generic, allowing you to specify the return type when calling it.
export const fetchData = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      credentials: "include", // Required for cookies
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! Status: ${response.status} - ${response.statusText}. Details: ${errorText}`
      );
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Fetch error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};
