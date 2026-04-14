
export const API_BASE_URL = "http://localhost:3000/api";

export const fetchApi = async <T>(
  url: string,
  options?: RequestInit,
  fallbackValue?: T,
  errorMessage = "API connection failed"
): Promise<T> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(errorMessage);
    return (await res.json()) as T;
  } catch (e) {
    console.warn(errorMessage, e);
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw e;
  }
};