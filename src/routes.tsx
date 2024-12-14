  
import React, {   useState } from 'react';
import { Routes,Route, useLocation } from 'react-router-dom';
import HomePage from './pages/Explore/explore'; // 首页
import PostPage from './pages/Post'; // 发表页面
import LoginPage from './pages/LoginPage'; // 登录页面
import Person from './pages/Person/person'
import MessagePage from './pages/Message/message'; // 消息页面
import BarBottom from './components/BarBottom'; // 导航栏组件
import WelcomePage from './pages/Welcome';
import  {ProtectedRoute}  from './components/routerProtect/ProtectedRoute';
import { RootRedirect } from './components/RootRedirect';
import { GuestRoute } from './components/routerProtect/GuestRoute';
import TopBar from './components/TopBar/index';
import WeiboDetail from './pages/Details/details';
import RegisterPage from './pages/Register/register';

const App: React.FC = () => {
  const [current, setCurrent] = useState<string>('explore'); // 当前选中的导航项
  const location = useLocation(); // 获取当前路径

  // 需要显示导航栏的页面路径
  const showNavbarPaths = ['/explore',  '/message','/person'];
  const shouldShowNavbar = showNavbarPaths.includes(location.pathname);
  const handleRefresh = () => {
    window.location.reload(); // 简单实现刷新页面
  };
  return (
    <>
      {/* 路由配置 */}
      <Routes>
             
        <Route path='/' element={<RootRedirect />}/>
        {/* 未登录用户的路由 */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/welcome"
          element={
            <GuestRoute>
              <WelcomePage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        {/* 需要鉴权的路由 */}
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/person"
          element={
            <ProtectedRoute>
              <Person />
            </ProtectedRoute>
          }
        />
        <Route
          path="/message"
          element={
            <ProtectedRoute>
              <MessagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weibo/:id"
          element={
            <ProtectedRoute>
              <WeiboDetail />
            </ProtectedRoute>
            }
        />
      </Routes>
      <div className="app-container">
        {/* 顶部导航栏 */}
        {shouldShowNavbar && <TopBar name="张三" onRefresh={handleRefresh} />}
        {/* 条件渲染导航栏 */}
        {shouldShowNavbar && <BarBottom current={current} setCurrent={setCurrent} />}
      </div>
    
    </>
  );
};

export default App;
