import { motion } from "framer-motion";
import { User, Mail, Shield, LogOut, ExternalLink, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileViewProps {
  user: any;
  onLogout: () => void;
}

export function ProfileView({ user, onLogout }: ProfileViewProps) {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto py-12 px-4"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-muted/50 via-background to-muted/30 border border-muted shadow-2xl">
        {/* Banner Decor */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        
        <div className="relative pt-16 pb-12 px-8 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative w-32 h-32 rounded-full border-4 border-background overflow-hidden shadow-xl">
              <img 
                src={user.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-3xl font-black tracking-tight">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground font-medium">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1.5 rounded-full font-bold">
                Premium Member
              </Badge>
              <Badge variant="outline" className="px-4 py-1.5 rounded-full font-bold">
                Alpha Tester
              </Badge>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            {[
              { icon: MapPin, label: "Location", value: "India", color: "text-blue-500" },
              { icon: Calendar, label: "Joined", value: "January 2024", color: "text-purple-500" },
              { icon: Shield, label: "Security", value: "OAuth 2.0 Active", color: "text-green-500" },
              { icon: ExternalLink, label: "Integrations", value: "NewsAPI, HF", color: "text-orange-500" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-muted/50 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <div className={`p-2.5 rounded-xl bg-background ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-bold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={onLogout}
            className="mt-12 group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-destructive text-destructive-foreground font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-destructive/20"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Sign Out from Session
          </button>
        </div>
      </div>
    </motion.div>
  );
}
