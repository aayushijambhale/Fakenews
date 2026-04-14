export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface AnalysisResult {
  summary?: string;
  authenticity?: {
    classification: 'REAL' | 'FAKE' | 'UNCERTAIN';
    reason: string;
  };
}
