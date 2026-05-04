import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useListChildren, useGetMe, useLogoutParent, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useChildContext } from "@/lib/child-context";
import { Button } from "@/components/ui/button";
import { Plus, Settings, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { clearToken } from "@/lib/auth-token";

export default function SelectChild() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: parent, isLoading: parentLoading } = useGetMe();
  const { data: children, isLoading: childrenLoading } = useListChildren();
  const { setActiveChildId } = useChildContext();
  const logoutMutation = useLogoutParent();

  const handleSelectChild = (id: number) => {
    setActiveChildId(id);
    setLocation("/activities");
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearToken();
        queryClient.clear();
        setLocation("/");
      },
    });
  };

  if (parentLoading || childrenLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6 space-y-6">
        <Skeleton className="w-64 h-12 rounded-full" />
        <div className="grid grid-cols-2 gap-4 w-full max-w-[400px]">
          <Skeleton className="w-full aspect-square rounded-3xl" />
          <Skeleton className="w-full aspect-square rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background p-6">
      <div className="w-full max-w-[480px] flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Who's playing?</h1>
          {parent && <p className="text-muted-foreground text-sm">Hi, {parent.name}</p>}
        </div>
        <div className="flex gap-2">
          <Link href="/parent-dashboard">
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12" data-testid="button-dashboard">
              <Settings className="w-6 h-6 text-foreground" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-6 h-6 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="w-full max-w-[480px] grid grid-cols-2 gap-6">
        {children?.map((child, index) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <button
              data-testid={`button-select-child-${child.id}`}
              onClick={() => handleSelectChild(child.id)}
              className="w-full aspect-square rounded-[2rem] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-4 border-white mb-3"
              style={{ backgroundColor: child.avatarColor || "#F9A825" }}
            >
              <span className="text-5xl font-bold text-white tracking-tighter">
                {child.name.charAt(0).toUpperCase()}
              </span>
            </button>
            <span className="text-xl font-bold text-foreground">{child.name}</span>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (children?.length || 0) * 0.1, duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <Link
            href="/create-child"
            className="w-full aspect-square rounded-[2rem] border-4 border-dashed border-primary/30 flex items-center justify-center hover:bg-primary/5 transition-colors mb-3 hover:scale-105 active:scale-95"
          >
            <Plus className="w-16 h-16 text-primary/50" />
          </Link>
          <span className="text-xl font-bold text-muted-foreground">Add Child</span>
        </motion.div>
      </div>
    </div>
  );
}
