// components/auth/RequireAuth.tsx
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import FullScreenLoader from "../../UI/loader/FullScreenLoader";
import { useAuth } from "../../../context/auth/AuthContext";
import { isOnboardingComplete } from "../../../utils/authRedirect";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />; // or global spinner
  if (!isAuthenticated) {
    // bounce user to login, keep the page they wanted
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user?.id && !isOnboardingComplete(user)) {
    return <Navigate to="/onboarding-questions" state={{ from: location }} replace />;
  }
  return children;
}
