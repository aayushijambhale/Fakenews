import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
        <DialogHeader>
          <DialogTitle className="text-xl font-bold leading-tight">{title}</DialogTitle>
          <DialogDescription>
            AI-powered analysis using Gemini
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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Gemini is analyzing the article...
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-muted/50 border border-muted">
                  <p className="text-sm leading-relaxed text-foreground">
                    {result}
                  </p>
                </div>
              </motion.div>
            ) : type === 'authenticity' ? (
              <motion.div
                key="authenticity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  {result?.classification === 'REAL' && (
                    <Badge className="bg-green-500 hover:bg-green-600 gap-1.5 py-1 px-3">
                      <CheckCircle2 className="w-4 h-4" />
                      REAL
                    </Badge>
                  )}
                  {result?.classification === 'FAKE' && (
                    <Badge variant="destructive" className="gap-1.5 py-1 px-3">
                      <AlertCircle className="w-4 h-4" />
                      FAKE
                    </Badge>
                  )}
                  {result?.classification === 'UNCERTAIN' && (
                    <Badge variant="secondary" className="gap-1.5 py-1 px-3">
                      <HelpCircle className="w-4 h-4" />
                      UNCERTAIN
                    </Badge>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-muted">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Reasoning</h4>
                  <p className="text-sm leading-relaxed text-foreground">
                    {result?.reason}
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
