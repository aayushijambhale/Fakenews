import { useState, useEffect } from "react";
import { NewsArticle } from "./types";
import { fetchTopHeadlines } from "./services/newsService";
import { summarizeArticle, checkAuthenticity } from "./services/aiService";
import { NewsCard } from "./components/NewsCard";
import { AnalysisModal } from "./components/AnalysisModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Newspaper, RefreshCw, Search, AlertTriangle, LogOut, User } from "lucide-react";
import { motion } from "motion/react";
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { ProfileView } from "./components/ProfileView";

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'summary' | 'authenticity' | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Navigation and Auth state
  const [activeView, setActiveView] = useState<'news' | 'profile'>('news');
  const [token, setToken] = useState<string | null>(localStorage.getItem("google_token"));
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (e) {
        console.error("Failed to decode token", e);
        localStorage.removeItem("google_token");
        setToken(null);
      }
    }
  }, [token]);

  const handleLoginSuccess = (credentialResponse: any) => {
    const newToken = credentialResponse.credential;
    if (newToken) {
      setToken(newToken);
      const decoded = jwtDecode(newToken);
      setUser(decoded);
      localStorage.setItem("google_token", newToken);
      toast.success("Signed in with Google");
    }
  };

  const handleLogout = () => {
    googleLogout();
    setToken(null);
    setUser(null);
    setActiveView('news');
    localStorage.removeItem("google_token");
    toast.info("Signed out");
  };


  const loadNews = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const data = await fetchTopHeadlines();
      if (data.status === "ok") {
        setArticles(data.articles);
      } else {
        throw new Error("Failed to load news");
      }
    } catch (err) {
      setError("Unable to fetch news. Please check your API key or try again later.");
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleSummarize = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setModalType('summary');
    setModalOpen(true);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const summary = await summarizeArticle(
        article.title, 
        article.content || article.description || "",
        token || undefined
      );
      setAnalysisResult(summary);
    } catch (err: any) {
      setAnalysisError(err.message || "Failed to generate summary. Please try again.");
      if (err.message.includes("sign in")) {
        toast.error("Please sign in to summarize articles");
      }
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleVerify = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setModalType('authenticity');
    setModalOpen(true);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const result = await checkAuthenticity(
        article.title, 
        article.content || article.description || "",
        token || undefined
      );
      setAnalysisResult(result);
    } catch (err: any) {
      setAnalysisError(err.message || "Failed to verify authenticity. Please try again.");
      if (err.message.includes("sign in")) {
        toast.error("Please sign in to verify articles");
      }
    } finally {
      setAnalysisLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Newspaper className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              News<span className="text-primary">Verify</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search news..."
                className="w-full bg-muted/50 border-none rounded-full pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => loadNews(true)}
              disabled={refreshing || loading}
              className={`p-2 rounded-full transition-colors disabled:opacity-50 ${activeView === 'news' ? 'hover:bg-muted' : 'hidden'}`}
              title="Refresh News"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {token && (
              <button 
                onClick={() => setActiveView(activeView === 'news' ? 'profile' : 'news')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm font-medium ${
                  activeView === 'profile' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{activeView === 'news' ? 'Profile' : 'News'}</span>
              </button>
            )}

            {token ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all text-sm font-medium"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Exit</span>
              </button>
            ) : (
              <div className="scale-90 origin-right">
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => toast.error("Login Failed")}
                  useOneTap
                  theme="filled_blue"
                  shape="pill"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">India News Headlines</h2>
            <p className="text-muted-foreground">
              Stay informed with real-time news and AI-powered insights.
            </p>
          </div>
        </div>

        {activeView === 'news' ? (
          error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-destructive/10 p-4 rounded-full mb-4">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
              <p className="text-muted-foreground max-w-md mb-6">{error}</p>
              <button 
                onClick={() => loadNews()}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 flex-1" />
                    </div>
                  </div>
                ))
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((article, index) => (
                  <motion.div
                    key={`${article.url}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NewsCard 
                      article={article} 
                      onSummarize={handleSummarize}
                      onCheckAuthenticity={handleVerify}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">Try adjusting your search query.</p>
                </div>
              )}
            </div>
          )
        ) : (
          <ProfileView user={user} onLogout={handleLogout} />
        )}
      </main>

      <AnalysisModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedArticle?.title || "Analysis"}
        type={modalType}
        loading={analysisLoading}
        error={analysisError}
        result={analysisResult}
      />

      <Toaster position="bottom-right" />
      
      <footer className="border-t py-8 mt-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NewsVerify. Powered by Hugging Face & NewsAPI.
          </p>
        </div>
      </footer>
    </div>
  );
}
