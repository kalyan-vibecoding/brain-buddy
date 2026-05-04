import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useChildContext } from "@/lib/child-context";
import { getStoredToken } from "@/lib/auth-token";

export function ParentAuthWrapper({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const hasToken = !!getStoredToken();

  const { data: parent, isLoading } = useGetMe({
    query: {
      enabled: hasToken,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  useEffect(() => {
    if (!hasToken || (!isLoading && !parent)) {
      setLocation("/login");
    }
  }, [hasToken, parent, isLoading, setLocation]);

  if (isLoading && hasToken) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
    );
  }

  if (!parent) return null;

  return <>{children}</>;
}

export function ChildAuthWrapper({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { activeChildId } = useChildContext();

  useEffect(() => {
    if (!activeChildId) {
      setLocation("/select-child");
    }
  }, [activeChildId, setLocation]);

  if (!activeChildId) return null;

  return <>{children}</>;
}
