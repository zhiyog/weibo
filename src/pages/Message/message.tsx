import React, { useEffect, useState } from 'react';
import { Card, Avatar, Button, Spin, message, FloatButton } from 'antd';
import { LikeFilled, LikeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './message.css'
import jwt_decode from "jwt-decode";

const WeiboCard = ({ weibo }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decodedToken = jwt_decode(token);
  const [weiboLiked, setWeiboLiked] = useState(false);


    // 取消点赞
    const handleWeiboUnlike = (weibo_id) => {
      axios
        .post(
          `http://localhost:5000/weibo/${weibo_id}/unlike`,
          {},
          {
            headers: {
              Authorization: `Bearer ${decodedToken.username}`, 
            },
          }
        )
        .then(() => {
          message.success("取消点赞成功！");
        })
        .catch((error) => {
          console.error("取消点赞失败:", error);
          message.error("取消点赞失败，请稍后重试。");
        });
    };


  const handleWeiboLike = (weibo_id) => {
    axios
      .post(
        `http://localhost:5000/weibo/${weibo_id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${decodedToken.username}`, 
          },
        }
      )
      .then(() => {
        message.success("点赞成功！");
      })
      .catch((error) => {
        console.error("点赞失败:", error);
        message.error("点赞失败，请稍后重试。");
      });
  };

  const deleteWeibo = (weibo_id) => {
    axios
      .delete(
        `http://localhost:5000/delete/weibo/${weibo_id}`,
        {
          headers: {
            Authorization: `Bearer ${decodedToken.username}`, 
          },
        }
      )
      .then(() => {
        message.success("删除成功！");
      })
      .catch((error) => {
        console.error("删除失败:", error);
        message.error("删除失败，请稍后重试。");
      });
  };


  const handleClick = () => {
    navigate(`/weibo/${weibo.weibo_id}`); // 跳转到微博详情页面
  };
  
    // 获取点赞状态
    useEffect(() => {
      checkWeiboLikedStatus(weibo.weibo_id);
    }, []);
  
    const checkWeiboLikedStatus = (weibo_id) => { 
      axios
        .get(`http://localhost:5000/weibo/${weibo_id}/judgeLiked`, {
          headers: { Authorization: `Bearer ${decodedToken.username}` },
        })
        .then((response) => {
          const { isLiked } = response.data;
          setWeiboLiked(isLiked); // 根据返回值设置按钮样式
        })
        .catch((error) => {
          console.error('获取点赞状态失败:', error);
        });
    };


  return (
    <Card
      style={{ marginBottom: 16 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar src={weibo.publisher_avatar_url} />
            <span>{weibo.publisher_nickname}</span>
          </div>
          <span style={{ color: '#999', fontSize: 12 }}>{weibo.publish_time}</span>
        </div>
      }
      
    >
      {/* 微博内容 */}
      <div
        style={{ marginBottom: 16 }}
        dangerouslySetInnerHTML={{ __html: weibo.publish_content }}
        onClick={handleClick}
      ></div>

      {/* 点赞数和按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{weibo.like_count} 点赞</span>

        {weibo.publisher_id === decodedToken.username&&<Button
        onClick={() => deleteWeibo(weibo.weibo_id)}
       >
        删除
      </Button> } 

      <Button
          icon={weiboLiked ? <LikeFilled style={{ color: 'red' }} /> : <LikeOutlined />}
          onClick={() => weiboLiked ? handleWeiboUnlike(weibo.weibo_id) : handleWeiboLike(weibo.weibo_id)}
          >
        {weiboLiked ? '取消点赞' : '点赞'}
      </Button>



      </div>
    </Card>
  );
};

const Message = () => {
  const [weibos, setWeibos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decodedToken = jwt_decode(token);

  // 获取微博数据
  useEffect(() => {
    axios
      .get('http://localhost:5000/message/weibo',
        {
          headers: {
            Authorization: `Bearer ${decodedToken.username}`, 
          },
        }
      ) // 后端接口地址
      .then((response) => {
        setWeibos(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('获取微博数据失败:', error);
        message.error('加载微博失败，请稍后重试。');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Spin tip="加载中..." >
          正在加载微博...
        </Spin>
      </div>
    );
  }

  return (
        <div className="home-page">
          {weibos.map((weibo) => (
            <WeiboCard key={weibo.weibo_id} weibo={weibo} />
          ))}
        </div>

  );
};



export default Message;