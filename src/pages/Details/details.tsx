import { useEffect, useState } from "react";
import { message, Avatar, Button, Input, List, Card, FloatButton } from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { LeftOutlined, LikeFilled, LikeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./details.css";

const WeiboDetail = () => {
  const { id } = useParams(); // 获取微博 ID
  const [weibo, setWeibo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decodedToken = jwt_decode(token);
  const [weiboLiked, setWeiboLiked] = useState(false);
  const [commentLiked, setCommentLiked] = useState<{ [key: string]: boolean }>(
    {}
  );

  // 获取微博详情和评论
  useEffect(() => {
    axios
      .get(`http://localhost:5000/weibo/${id}`) // 获取微博详细内容和评论
      .then((response) => {
        setWeibo(response.data.weibo);
        setComments(response.data.comments);
        checkWeiboLikedStatus(response.data.weibo.weibo_id); // 获取点赞状态
        for (const comment of response.data.comments) {
          checkCommentLikedStatus(comment.comment_id); // 获取评论点赞状态
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("获取微博详情失败:", error);
        message.error("加载微博详情失败，请稍后重试。");
        setLoading(false);
      });
  }, []);

  // 评论提交函数
  const handleCommentSubmit = () => {
    const token = localStorage.getItem("token");
    const decodedToken = jwt_decode(token);

    if (!commentContent.trim()) {
      message.warning("评论内容不能为空！");
      return;
    }

    axios
      .post(
        `http://localhost:5000/weibo/${id}/comments`,
        { comment_content: commentContent },
        { headers: { Authorization: `Bearer ${decodedToken.username}` } }
      )
      .then(() => {
        message.success("评论成功！");
        setCommentContent("");
        fetchComments(); // 重新加载评论
      })
      .catch((error) => {
        console.error("发表评论失败:", error);
        message.error("发表评论失败，请稍后重试。");
      });
  };
  // 获取评论的函数
  const fetchComments = () => {
    axios
      .get(`http://localhost:5000/weibo/${id}`) // 获取微博详细内容和评论
      .then((response) => {
        setWeibo(response.data.weibo);
        setComments(response.data.comments);
        setLoading(false);
      })
      .catch((error) => {
        console.error("获取微博详情失败:", error);
        message.error("加载微博详情失败，请稍后重试。");
        setLoading(false);
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
        fetchComments(); // 重新加载评论
      })
      .catch((error) => {
        console.error("点赞失败:", error);
        message.error("点赞失败，请稍后重试。");
      });
  };
  // 在组件加载时和评论提交后调用 fetchComments
  useEffect(() => {
    fetchComments();
  }, []);

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

  // 取消点赞
  const handleCommentUnlike = (comment_id) => {
    axios
      .post(
        `http://localhost:5000/weibo/${id}/comments/${comment_id}/unlike`,
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
        console.error("获取点赞状态失败:", error);
      });
  };

  // const checkCommentLikedStatus = (comment_id) => {
  //   axios
  //     .get(
  //       `http://localhost:5000/weibo/${id}/comments/${comment_id}/judgeLiked`,
  //       {
  //         headers: { Authorization: `Bearer ${decodedToken.username}` },
  //       }
  //     )
  //     .then((response) => {
  //       const { isLiked } = response.data;
  //       setCommentLiked(isLiked); // 根据返回值设置按钮样式
  //     })
  //     .catch((error) => {
  //       console.error("获取点赞状态失败:", error);
  //     });
  // };

  // 评论点赞的函数

  const checkCommentLikedStatus = (comment_id) => {
    axios
      .get(
        `http://localhost:5000/weibo/${id}/comments/${comment_id}/judgeLiked`,
        {
          headers: { Authorization: `Bearer ${decodedToken.username}` },
        }
      )
      .then((response) => {
        const { isLiked } = response.data;
        setCommentLiked((prevState) => ({
          ...prevState,
          [comment_id]: isLiked,
        }));
      })
      .catch((error) => {
        console.error("获取点赞状态失败:", error);
      });
  };
  const deleteWeibo = (weibo_id) => {
    axios
      .delete(`http://localhost:5000/delete/weibo/${weibo_id}`, {
        headers: {
          Authorization: `Bearer ${decodedToken.username}`,
        },
      })
      .then(() => {
        message.success("删除微博成功！");
        navigate(-1); // 返回上一页
      })
      .catch((error) => {
        console.error("删除微博失败:", error);
        message.error("删除微博失败，请稍后重试。");
      });
  };
  const handleLike = (comment_id) => {
    axios
      .post(
        `http://localhost:5000/weibo/${id}/comments/${comment_id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${decodedToken.username}`,
          },
        }
      )
      .then(() => {
        message.success("点赞成功！");
        setCommentLiked((prevState) => ({
          ...prevState,
          [comment_id]: true, // Mark the comment as liked
        }));
        fetchComments();
      })
      .catch((error) => {
        console.error("点赞失败:", error);
        message.error("点赞失败，请稍后重试。");
      });
  };

  const deleteComment = (comment_id) => {
    axios
      .delete(`http://localhost:5000/delete/comments/${comment_id}`, {
        headers: {
          Authorization: `Bearer ${decodedToken.username}`,
        },
      })
      .then(() => {
        message.success("删除评论成功！");
        fetchComments();
      })
      .catch((error) => {
        console.error("删除评论失败:", error);
        message.error("删除评论失败，请稍后重试。");
      });
  };

  return (
    <div className="container">
      <FloatButton
        icon={<LeftOutlined />}
        onClick={() => navigate(-1)} // 返回上一页
        className="back-button"
      />
      <h2 className="weibo-title">微博详情</h2>
      <div className="weibo-content">
        {weibo && (
          <div className="weibo-card">
            <div className="weibo-header">
              <div className="weibo-avatar-container">
                <Avatar
                  src={weibo.publisher_avatar_url}
                  className="weibo-avatar"
                />
                <span className="weibo-publisher">
                  {weibo.publisher_nickname}
                </span>
              </div>

              <span className="weibo-time">{weibo.publish_time}</span>
            </div>

            <div className="weibo-content">
              <div
                className="weibo-text"
                dangerouslySetInnerHTML={{ __html: weibo.publish_content }}
              />
            </div>

            <hr className="divider" />

            <div className="weibo-footer">
              <div className="weibo-like-info">
                <span>{weibo.like_count} 点赞</span>
              </div>
              {weibo.publisher_id === decodedToken.username&&
              <Button onClick={() => deleteWeibo(weibo.weibo_id)}>
                删除
              </Button>}
              <Button
                icon={
                  weiboLiked ? (
                    <LikeFilled style={{ color: "red" }} />
                  ) : (
                    <LikeOutlined />
                  )
                }
                onClick={() =>
                  weiboLiked
                    ? handleWeiboUnlike(weibo.weibo_id)
                    : handleWeiboLike(weibo.weibo_id)
                }
              >
                {weiboLiked ? "取消点赞" : "点赞"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="comments-title">评论区</h3>
        <List
          className="comments-list"
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <Card className="comment-card">
                <List.Item.Meta
                  className="comment-meta"
                  avatar={
                    <Avatar
                      src={comment.commenter_avatar_url}
                      className="comment-avatar"
                    />
                  }
                  title={
                    <div className="comment-title">
                      {comment.commenter_nickname}
                      <span
                        style={{
                          color: "#999",
                          fontSize: "12px",
                          marginLeft: "10px",
                        }}
                      >
                        {comment.comment_time}
                      </span>
                    </div>
                  }
                  description={
                    <div>
                      <p className="comment-description">
                        {comment.comment_content}
                      </p>

                      <div className="comment-like">
                        点赞数：{comment.like_count}
                        {comment.commenter_id === decodedToken.username&&
                      <Button onClick={() => deleteComment(comment.comment_id)} style={{marginLeft: "50px",top: "4px"}}>
                        删除
                      </Button>}
                      </div>



                      <Button
                        className="like-button"
                        icon={
                          commentLiked[comment.comment_id] ? (
                            <LikeFilled style={{ color: "red" }} />
                          ) : (
                            <LikeOutlined />
                          )
                        }
                        onClick={() =>
                          commentLiked[comment.comment_id]
                            ? handleCommentUnlike(comment.comment_id)
                            : handleLike(comment.comment_id)
                        }
                      >
                        {commentLiked[comment.comment_id] ? "取消点赞" : "点赞"}
                      </Button>


                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </div>

      <div className="comment-input">
        <Input.TextArea
          rows={4}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="发表评论..."
          maxLength={200}
          className="comment-textarea"
        />
        <Button
          type="primary"
          onClick={handleCommentSubmit}
          disabled={!commentContent.trim()}
          className="comment-button"
        >
          提交评论
        </Button>
      </div>
    </div>
  );
};

export default WeiboDetail;
