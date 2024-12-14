// src/components/routerProtect/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from './log';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!AuthService.isAuthenticated()) {
    // 如果未登录，重定向到登录页面
    return <Navigate to="/welcome" replace />;
  }
  // 如果已登录，渲染子组件
  return <>{children}</>;
};
