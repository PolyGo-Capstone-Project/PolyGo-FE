"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/hooks/singleton";
import { RoleType } from "@/types";

interface UseAuthGuardOptions {
  /**
   * Required role to access the route
   */
  requiredRole?: RoleType;

  /**
   * Redirect path when not authenticated
   * @default '/login'
   */
  redirectTo?: string;
}

interface UseAuthGuardReturn {
  /**
   * Whether the auth check is still in progress
   */
  isLoading: boolean;

  /**
   * Whether the user is authorized to access the route
   */
  isAuthorized: boolean;

  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
}

/**
 * Hook to guard routes based on authentication and role
 *
 * Behavior:
 * - If not authenticated → redirect to login
 * - If wrong role → router.back() (stay on previous page)
 * - If authorized → allow access
 *
 * @example
 * // In Admin Layout
 * const { isLoading, isAuthorized } = useAuthGuard({ requiredRole: 'Admin' });
 *
 * @example
 * // In User Layout
 * const { isLoading, isAuthorized } = useAuthGuard({ requiredRole: 'User' });
 *
 * @example
 * // In Protected Layout (any authenticated user)
 * const { isLoading, isAuthorized } = useAuthGuard({});
 */
export function useAuthGuard(
  options: UseAuthGuardOptions = {}
): UseAuthGuardReturn {
  const { requiredRole, redirectTo = "/login" } = options;

  const router = useRouter();
  const { isAuth, role } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Simulate a small delay to prevent flash
    const timer = setTimeout(() => {
      // Check authentication - if not authenticated, always redirect to login
      if (!isAuth) {
        setIsAuthorized(false);
        setIsLoading(false);
        router.push(redirectTo);
        return;
      }

      // Check role if required - if wrong role, go back to previous page
      if (requiredRole && role !== requiredRole) {
        setIsAuthorized(false);
        setIsLoading(false);
        router.back();
        return;
      }

      // Authorized
      setIsAuthorized(true);
      setIsLoading(false);
    }, 100); // Small delay to prevent flash

    return () => clearTimeout(timer);
  }, [isAuth, role, requiredRole, redirectTo, router]);

  return {
    isLoading,
    isAuthorized,
    isAuthenticated: isAuth,
  };
}

/**
 * Hook to check if user is a new user and redirect if not
 * Used in setup-profile route
 *
 * @example
 * const { isLoading } = useNewUserGuard();
 */
export function useNewUserGuard() {
  const router = useRouter();
  const { isNewUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isNewUser) {
        router.back();
        return;
      }

      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isNewUser, router]);

  return { isLoading };
}
