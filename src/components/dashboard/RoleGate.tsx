"use client";

import { ReactNode } from "react";
import { UserRole } from "./useUserRole";

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  userRole: UserRole;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 */
export function RoleGate({ 
  children, 
  allowedRoles, 
  userRole, 
  fallback = null 
}: RoleGateProps) {
  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

/**
 * Higher-order component for role-based access
 */
export function withRoleAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function RoleProtectedComponent(props: P & { userRole: UserRole }) {
    const { userRole, ...rest } = props;
    
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-muted-foreground">
              অ্যাক্সেস নিষিদ্ধ
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              এই পেজ দেখার অনুমতি আপনার নেই
            </p>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...(rest as P)} />;
  };
}



