import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, getListChildrenQueryKey } from "@workspace/api-client-react";
import { saveToken } from "@/lib/auth-token";
import { useChildContext } from "@/lib/child-context";

const DEMO_EMAIL = "demo@brainbuddy.kids";
const DEMO_PASSWORD = "demo1234";
const DEMO_CHILD_NAME = "Explorer";
const DEMO_CHILD_AGE = 6;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { setActiveChildId } = useChildContext();

  async function handlePlay() {
    setLoading(true);
    try {
      // Try register (ok if 409 — account already exists)
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Demo Parent", email: DEMO_EMAIL, password: DEMO_PASSWORD }),
      });

      // Login to get a fresh token
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
      });
      const loginData = await loginRes.json();
      if (!loginData.token) throw new Error("Login failed");
      saveToken(loginData.token);

      // Fetch or create a demo child
      const childrenRes = await fetch("/api/children", {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      const children = await childrenRes.json();

      let childId: number;
      if (children.length > 0) {
        childId = children[0].id;
      } else {
        const createRes = await fetch("/api/children", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginData.token}`,
          },
          body: JSON.stringify({ name: DEMO_CHILD_NAME, age: DEMO_CHILD_AGE, avatarColor: "#F9A825" }),
        });
        const newChild = await createRes.json();
        childId = newChild.id;
      }

      // Warm the query cache and set the active child
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
      setActiveChildId(childId);
      setLocation("/activities");
    } catch {
      // Fall back to login screen on any error
      setLocation("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6">
      <motion.div
        className="w-full max-w-[480px] flex flex-col items-center text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-32 h-32 md:w-48 md:h-48 bg-primary rounded-full flex items-center justify-center shadow-xl border-4 border-white"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-24 md:h-24 text-accent">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">BrainBuddy</h1>
          <p className="text-xl md:text-2xl font-bold text-primary">Kids Playground</p>
        </div>

        <div className="w-full flex flex-col space-y-4 pt-8">
          <Button
            data-testid="button-play"
            size="lg"
            className="w-full h-16 md:h-20 text-xl md:text-2xl rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95 bg-primary text-primary-foreground font-bold"
            onClick={handlePlay}
            disabled={loading}
          >
            {loading ? "Getting ready..." : "Let's Play!"}
          </Button>

          <Link href="/login" className="w-full block mt-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg rounded-full border-2 border-primary/20 text-foreground font-semibold hover:bg-primary/5"
            >
              Parent Login
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
