import { NewsResponse } from "../types";

export async function fetchTopHeadlines(): Promise<NewsResponse> {
  const response = await fetch("/api/news");
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }
  return response.json();
}
