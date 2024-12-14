import React from 'react';
import './TopBar.css'; // 引入样式文件
import { Avatar, } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

interface TopBarProps {
  name: string;
  onRefresh: () => void;
}
const handleRefresh = () => {
  window.location.reload(); // 简单实现刷新页面
};
// eslint-disable-next-line no-empty-pattern
const TopBar: React.FC<TopBarProps> = ({ }) => {

  const [nickname, setNickname] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    const token = localStorage.getItem('token'); // 获取 token
    const decodedToken = jwt_decode(token);

    // 发送请求获取用户信息
    fetch('http://localhost:5000/getUserInfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${decodedToken.username}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('请求失败');
        }
        return response.json();
      })
      .then(data => {
        // 假设返回的是数组，取第一个元素
        const user = data[0];
        setNickname(user.nickname); // 设置昵称
        setImageUrl(user.profile_image_url); // 设置头像 URL
      
      });
  }, []); // 空依赖数组确保只在组件挂载时执行一次

  return (
    <div className="top-bar">
      {/* 左侧头像和用户名 */}
      <div className="top-bar-left">
        <Avatar size="large" src={imageUrl} /> {/* 替换为你的头像路径 */}
        <span className="top-bar-name">{nickname}</span>
      </div>

      {/* 右侧刷新按钮 */}
      <div className="top-bar-right">
        <ReloadOutlined onClick={handleRefresh} style={{ fontSize: '20px' }} />
      </div>
    </div>
  );
};

export default TopBar;
