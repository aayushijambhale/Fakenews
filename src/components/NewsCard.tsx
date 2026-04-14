import { NewsArticle } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
  onSummarize: (article: NewsArticle) => void;
  onCheckAuthenticity: (article: NewsArticle) => void;
}

export function NewsCard({ article, onSummarize, onCheckAuthenticity }: NewsCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg border-muted/50">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {article.urlToImage ? (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="object-cover w-full h-full transition-transform hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            No Image Available
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90">
          {article.source.name}
        </Badge>
      </div>
      <CardHeader className="flex-none p-4 pb-2">
        <CardTitle className="line-clamp-2 text-lg leading-tight">
          {article.title}
        </CardTitle>
        <CardDescription className="text-xs">
          {new Date(article.publishedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.description || "No description available for this article."}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 p-4 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1.5"
          onClick={() => onSummarize(article)}
        >
          <FileText className="w-4 h-4" />
          Summarize
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1.5"
          onClick={() => onCheckAuthenticity(article)}
        >
          <ShieldCheck className="w-4 h-4" />
          Verify
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className="flex-none"
        >
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
