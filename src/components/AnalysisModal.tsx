import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, ShieldAlert, Info } from "lucide-react";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'summary' | 'authenticity' | null;
  loading: boolean;
  error: string | null;
  result: any;
}

export function AnalysisModal({ isOpen, onClose, title, type, loading, error, result }: AnalysisModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            {type === 'summary' ? <Sparkles className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            <span className="text-xs font-bold uppercase tracking-[0.2em]">AI Insights</span>
          </div>
          <DialogTitle className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80 font-medium">
            Advanced neural analysis powered by Hugging Face
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 min-h-[150px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground animate-pulse mt-2">
                  Processing deep neural networks...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-8 gap-3 text-destructive"
              >
                <AlertCircle className="w-10 h-10" />
                <p className="text-center font-medium">{error}</p>
              </motion.div>
            ) : type === 'summary' ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-muted backdrop-blur-sm overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Executive Summary
                  </h4>
                  <p className="text-base leading-relaxed text-foreground font-medium selection:bg-primary/30">
                    {result}
                  </p>
                </div>
              </motion.div>
            ) : type === 'authenticity' ? (
              <motion.div
                key="authenticity"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                    result?.classification === 'REAL' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                    result?.classification === 'FAKE' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                    'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  }`}>
                    {result?.classification === 'REAL' ? <ShieldCheck className="w-10 h-10" /> : 
                     result?.classification === 'FAKE' ? <ShieldAlert className="w-10 h-10" /> : 
                     <Info className="w-10 h-10" />}
                  </div>
                  <div className="text-center">
                    <h3 className={`text-2xl font-black ${
                      result?.classification === 'REAL' ? 'text-green-500' : 
                      result?.classification === 'FAKE' ? 'text-red-500' : 
                      'text-amber-500'
                    }`}>
                      {result?.classification || 'UNCERTAIN'}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Verified News Status</p>
                  </div>
                </div>

                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-muted shadow-inner group">
                  <div className="absolute -top-3 left-6">
                    <Badge variant="outline" className="bg-background font-bold px-3 py-1 border-primary/20 text-primary">
                      DETAILED REASONING
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90 font-medium italic">
                    "{result?.reason}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-muted-foreground/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Confidence Score</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`w-3 h-1 rounded-full ${i < 4 ? 'bg-primary' : 'bg-muted'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
