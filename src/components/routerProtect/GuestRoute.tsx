// src/components/routerProtect/GuestRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from './log';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  if (AuthService.isAuthenticated()) {
    // 如果已登录，重定向到主页面
    return <Navigate to="/explore" replace />;
  }
  // 如果未登录，渲染子组件
  return <>{children}</>;
};
