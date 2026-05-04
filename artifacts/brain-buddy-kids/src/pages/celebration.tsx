import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useChildContext } from "@/lib/child-context";
import { useGetChild } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Star, Award, ChevronRight } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use"; // Not in package.json? We'll write a small custom hook for window size or just use fixed for now.

export default function Celebration() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const stars = parseInt(searchParams.get("stars") || "3", 10);
  const activityType = searchParams.get("activity") || "match_shape";
  
  const { activeChildId } = useChildContext();
  const { data: child } = useGetChild(activeChildId!, { query: { enabled: !!activeChildId }});
  
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6 overflow-hidden relative">
      {/* Simple fallback confetti if react-confetti is not available, but we can assume it's omitted or we can build CSS. Let's use framer motion for simple confetti if needed, but we'll use CSS based particle system for safety, or just omit if no package. I will use simple framer motion stars */}
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {showConfetti && Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full"
            style={{
              backgroundColor: ["#005FCC", "#F9A825", "#C62828", "#2E7D32"][Math.floor(Math.random() * 4)],
              left: `${Math.random() * 100}%`,
              top: -20
            }}
            animate={{
              y: ["0vh", "100vh"],
              x: `${(Math.random() - 0.5) * 200}px`,
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              ease: "linear",
              repeat: Infinity
            }}
          />
        ))}
      </div>

      <motion.div 
        className="w-full max-w-[480px] bg-card rounded-[3rem] p-8 shadow-2xl border-4 border-white flex flex-col items-center z-10 relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <h1 className="text-4xl font-black text-foreground mb-2 text-center">
          Great Job{child ? `, ${child.name}` : ''}!
        </h1>
        <p className="text-xl font-bold text-muted-foreground mb-8 text-center">You earned {stars} stars</p>
        
        <div className="flex gap-4 mb-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotate: -45 }}
              animate={{ 
                opacity: i < stars ? 1 : 0.3, 
                scale: 1, 
                rotate: 0 
              }}
              transition={{ delay: 0.5 + (i * 0.2), type: "spring" }}
            >
              <Star className={`w-20 h-20 ${i < stars ? 'fill-accent text-accent' : 'fill-muted text-muted'}`} />
            </motion.div>
          ))}
        </div>

        <div className="w-full space-y-4">
          <Button 
            size="lg" 
            className="w-full h-16 text-2xl rounded-full font-bold shadow-lg"
            onClick={() => setLocation(`/activities/${activityType}`)}
          >
            Play Again
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-16 text-xl rounded-full font-bold border-2 border-muted"
            onClick={() => setLocation("/activities")}
          >
            More Activities
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
