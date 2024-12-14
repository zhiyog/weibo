import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // 后端地址
  timeout: 5000,
});

// 获取微博列表
export const getPosts = async () => {
  try {
    const response = await api.get('/posts');
    return response.data;  // 返回微博数据
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// 发布微博
export const createPost = async (content: string) => {
  try {
    const response = await api.post('/posts', { content });
    return response.data;  // 返回新创建的微博数据
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};
