import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const { data: session, isPending } = useSession();
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        setUser(session.user as any);
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
      setLoading(false);
    }
  }, [session, isPending, setUser, setAuthenticated, setLoading]);

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
