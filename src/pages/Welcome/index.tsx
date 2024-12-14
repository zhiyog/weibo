import React from 'react';
import './index.css';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">🎉欢迎来到微博🌈</h1>
        <p className="welcome-subtitle">探索新世界，从这里开始！</p>
        <p className="welcome-description">💼梦想：work life balance</p>
        <p className="welcome-description">
        🌐了解我：<a href="https://zhiyog.github.io/" target="_blank" rel="noopener noreferrer">⭐zhiyog⭐</a>
        </p>
        <p className="welcome-description">
        平台采用 react + node.js 开发<br />
        🚀你可以在这里：<br />
          📝发布你的想法<br />📖记录你的生活<br />✨与他人分享你的故事
        </p>
        <Button
            className="welcome-button"
            type="primary"
            htmlType="submit"
            color="default" 
            variant="solid"
            block
            onClick={() => navigate('/login')}
          >
            登录
          </Button>
          <Button
            className="welcome-button"
            type="primary"
            htmlType="submit"
            color="default" 
            variant="solid"
            block
            onClick={() => navigate('/register')}
          >
            注册
          </Button>
      </div>
    </div>
  );
};

export default Welcome;
