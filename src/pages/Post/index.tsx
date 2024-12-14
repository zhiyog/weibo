import React, { useState } from "react";
import { FloatButton, message } from "antd";
import PostForm from "../../components/PostForm"; // 引入 PostForm 组件
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

const PostPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // 提交微博
  const handlePostSubmit = async (content: string) => {
    if (!content) {
      message.warning("微博内容不能为空！");
      return;
    }

    setLoading(true);
    
    try {
      // 这里是模拟提交请求，你需要替换为实际的API请求逻辑

      // 假设提交成功
      setLoading(false);
      message.success("微博发布成功！");
      // 这里可以选择跳转到首页或者清空表单等
    } catch (error) {
      setLoading(false);
      message.error("发布微博失败，请重试！");
    }
  };

  return (
    <div>
        <FloatButton
        icon={<LeftOutlined />}
        onClick={() => navigate(-1)} // 返回上一页
        className="back-button"
      ></FloatButton>
      <PostForm onSubmit={handlePostSubmit} loading={loading} />
    </div>
  );
};

export default PostPage;
