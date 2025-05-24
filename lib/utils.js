import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Generic API call utility for backend integration
export async function callApi(endpoint, method = 'GET', data = null, token = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && { body: JSON.stringify(data) }),
  };
  // Set your backend base URL here or use env variable
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const response = await fetch(`${baseUrl}/${endpoint}`, config);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
