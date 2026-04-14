import { NewsResponse } from "../types";

export async function fetchTopHeadlines(): Promise<NewsResponse> {
  const response = await fetch("/api/news");
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch news");
  }
  return response.json();
}
