import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import './postform.css';

const PostForm = () => {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.error('微博内容不能为空');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token); // 确保 token 可解码
      const response = await fetch('http://localhost:5000/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${decoded.username}`,
        },
        body: JSON.stringify({ 
          publish_content: content,
          publisher_id: decoded.username,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success('发布成功');
        navigate('/'); // 重定向到首页
      } else {
        message.error(result.message || '发布失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后再试');
    }
  };

  return (
    <div className='post-form'>
      <h2 className='post-form-title'>发布微博</h2>
      <Input.TextArea
        rows={5}
        placeholder="写下你的微博..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ marginBottom: 20 }}
      />
      <Button type="primary" onClick={handleSubmit}>
        发布
      </Button>
    </div>
  );
};

export default PostForm;
