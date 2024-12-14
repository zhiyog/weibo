
export const AuthService = {
    isAuthenticated: (): boolean => {
      const token = localStorage.getItem('token');
      // 检查 token 是否存在且未过期（可扩展为检查有效性）
      return !!token;
    },
    login: (token: string) => {
      localStorage.setItem('token', token);
    },
    logout: () => {
      localStorage.removeItem('token');
      // 跳转到登录页面
      window.location.href = '/welcome';
    },
  };
  