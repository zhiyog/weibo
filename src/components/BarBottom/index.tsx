import React, { useEffect } from 'react';
import './BarBottom.css'; // 样式文件
import { useNavigate } from 'react-router-dom';

interface BarBottomProps {
  current: string;
  setCurrent: React.Dispatch<React.SetStateAction<string>>;
}

const BarBottom: React.FC<BarBottomProps> = ({ current, setCurrent }) => {
  const navItems = [
    { label: '探索', key: 'explore' },
    { label: '我的帖子', key: 'message' },
    { label: '我的', key: 'person' },
  ];
  const navigate = useNavigate();

  // 在组件挂载时读取 sessionStorage 中的导航状态
  useEffect(() => {
    const savedCurrent = sessionStorage.getItem('currentNav');
    if (savedCurrent) {
      setCurrent(savedCurrent);
    }
  }, [setCurrent]);

  const handleNavClick = (key: string) => {
    setCurrent(key);
    navigate('/' + key); // 跳转到对应页面
    sessionStorage.setItem('currentNav', key); // 保存当前状态到 sessionStorage
  };

  return (
    <div className="bar-bottom">
      {navItems.map((item) => (
        <div
          key={item.key}
          className={`bar-item ${current === item.key ? 'active' : ''}`}
          onClick={() => handleNavClick(item.key)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default BarBottom;
