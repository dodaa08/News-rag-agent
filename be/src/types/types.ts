export interface StandardArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  image: string | null;
  description: string;
  originalSourceObj?: any; 
  
  // You added these in the previous step, so include them here too:
  verification_count?: number;
  other_sources?: string[];
  verified_by?: string[];
  summary?: string;
  ai_ready?: boolean;
}