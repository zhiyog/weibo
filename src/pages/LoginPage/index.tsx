import React, {  useState } from 'react';
import { Form, Input, Button, message, FloatButton, } from 'antd';
import { UserOutlined, LockOutlined, LeftOutlined } from '@ant-design/icons';
import './index.css'; // 引入样式文件
import headPicture from '../../assets/head_picture.png'; // 正确引入图片
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false); // 显示加载状态
  const navigate = useNavigate(); // 用于路由跳转

  // 异步登录处理
  const handleLogin = async (values: any) => {
    const { username, password } = values; // 解构表单数据

    setLoading(true); // 开启加载状态

    try {
      // 模拟向后端发送请求
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // 发送数据
      });

      const data = await response.json(); // 解析响应

      if (data.success) {
        message.success('登录成功'); // 成功提示
        localStorage.setItem('token', data.token); // 存储 Token
        navigate('/explore'); // 跳转到首页
      } else {
        message.error(data.message || '用户名或密码错误'); // 失败提示
      }
    } catch (error) {
      message.error('网络请求失败，请稍后再试'); // 网络错误提示
    } finally {
      setLoading(false); // 请求结束，关闭加载状态
    }
  };



  return (
    <div className="login-container">
            {/* 后退按钮 */}
      <FloatButton
        icon={<LeftOutlined />}
        onClick={() => navigate(-1)} // 返回上一页
        className="back-button"
      >
      </FloatButton>

      <h1 className="welcome-title">🎉欢迎来到微博🌈</h1>
      <img src={headPicture} alt="logo" className="logo" />
      <div className="login-desc">
      <Form
        name="login_form"
        onFinish={handleLogin} // 表单提交事件
        initialValues={{ remember: true }}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="用户名"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            color="default" 
            variant="solid"
            block
            loading={loading} // 显示加载状态
          >
            登录
          </Button>
        </Form.Item>
      </Form>
      </div>
     
    </div>
  );
};

export default LoginPage;

