import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt_decode from "jwt-decode"; // 默认导出
import jwt from "jsonwebtoken";
import axios from "axios";
// 创建 Express 实例
const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'zzy'; // 替换为自己的密钥，用于签名 JWT

// MySQL 数据库连接
const db = mysql.createConnection({
  host: "localhost",    // 从 .env 文件读取的主机名
  user: "root",   // 从 .env 文件读取的用户名
  password: "zhangziyang",   // 从 .env 文件读取的密码
  database: "weibo_db"    // 从 .env 文件读取的数据库名
});


// 测试数据库连接
db.connect(err => {
  if (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
  console.log('数据库连接成功');
});


// 登录请求处理
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码是必填的' });
  }

  const query = 'SELECT * FROM login WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('查询失败:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: '用户名或密码错误' });
    }

    const user = results[0];

    if (password === user.password) {
      // 生成 JWT
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
        expiresIn: '5h', // token 有效期 5 小时
      });

      return res.json({ success: true, message: '登录成功', token });
    } else {
      return res.status(400).json({ success: false, message: '用户名或密码错误' });
    }
  });
});


//查询用户信息
app.get('/getUserInfo', (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).send('缺少 token');
  }

  const tokenId = token.split(' ')[1];  // 从 Authorization header 中提取 token 部分

  const query = 'SELECT * FROM user_info WHERE id = ?';
  db.query(query, [tokenId], (err, results) => {
    if (err) {
      console.error('查询失败:', err);
      return res.status(500).send('查询失败');
    }

    // 返回查询结果
    res.json(results);
  });
});


// 修改 `login` 表中根据 username 修改 password 的接口
app.put('/update-password', (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ message: '用户名和新密码不能为空' });
  }

  const sql = 'UPDATE login SET password = ? WHERE username = ?';
  db.query(sql, [newPassword, username], (err, result) => {
    if (err) {
      console.error('更新密码时发生错误:', err);
      return res.status(500).json({ message: '更新密码失败' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({ message: '密码更新成功' });
  });
});


// 修改 `user_info` 表中根据 id 修改 profile_image_url 的接口

app.put('/update-profile-image', (req, res) => {
  const { id, profileImageUrl } = req.body;
  console.log(id, profileImageUrl);
  
  if (!id || !profileImageUrl) {
    return res.status(400).json({ message: 'ID 和头像 URL 不能为空' });
  }

  // Begin transaction to ensure all updates happen atomically
  db.beginTransaction((err) => {
    if (err) {
      console.error('启动事务失败:', err);
      return res.status(500).json({ message: '更新头像事务启动失败' });
    }

    // Update user_info table
    const updateUserInfoSql = 'UPDATE user_info SET profile_image_url = ? WHERE id = ?';
    db.query(updateUserInfoSql, [profileImageUrl, id], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('更新 user_info 失败:', err);
          return res.status(500).json({ message: '更新用户头像失败' });
        });
      }

      if (result.affectedRows === 0) {
        return db.rollback(() => {
          return res.status(404).json({ message: '用户不存在' });
        });
      }

      // Update profile_image_url in weibo table
      const updateWeiboSql = 'UPDATE weibo SET publisher_avatar_url = ? WHERE publisher_id = ?';
      db.query(updateWeiboSql, [profileImageUrl, id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('更新 weibo 表失败:', err);
            return res.status(500).json({ message: '更新微博失败' });
          });
        }

        // Update profile_image_url in comments table
        const updateCommentsSql = 'UPDATE comments SET commenter_avatar_url = ? WHERE commenter_id = ?';
        db.query(updateCommentsSql, [profileImageUrl, id], (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error('更新 comments 表失败:', err);
              return res.status(500).json({ message: '更新评论失败' });
            });
          }

          // Commit the transaction if all updates are successful
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('提交事务失败:', err);
                return res.status(500).json({ message: '提交事务失败' });
              });
            }
            res.json({ message: '用户头像更新成功' });
          });
        });
      });
    });
  });
});

app.put('/update-nickname', (req, res) => {
  const { id, nickname } = req.body;

  if (!id || !nickname) {
    return res.status(400).json({ message: 'ID 和昵称不能为空' });
  }

  // Begin transaction to ensure all updates happen atomically
  db.beginTransaction((err) => {
    if (err) {
      console.error('启动事务失败:', err);
      return res.status(500).json({ message: '更新昵称事务启动失败' });
    }

    // Update nickname in user_info table
    const updateUserInfoSql = 'UPDATE user_info SET nickname = ? WHERE id = ?';
    db.query(updateUserInfoSql, [nickname, id], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('更新 user_info 失败:', err);
          return res.status(500).json({ message: '更新用户昵称失败' });
        });
      }

      if (result.affectedRows === 0) {
        return db.rollback(() => {
          return res.status(404).json({ message: '用户不存在' });
        });
      }

      // Update nickname in weibo table
      const updateWeiboSql = 'UPDATE weibo SET publisher_nickname = ? WHERE publisher_id = ?';
      db.query(updateWeiboSql, [nickname, id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('更新 weibo 表失败:', err);
            return res.status(500).json({ message: '更新微博昵称失败' });
          });
        }

        // Update nickname in comments table
        const updateCommentsSql = 'UPDATE comments SET commenter_nickname = ? WHERE commenter_id = ?';
        db.query(updateCommentsSql, [nickname, id], (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error('更新 comments 表失败:', err);
              return res.status(500).json({ message: '更新评论昵称失败' });
            });
          }

          // Commit the transaction if all updates are successful
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('提交事务失败:', err);
                return res.status(500).json({ message: '提交事务失败' });
              });
            }
            res.json({ message: '用户昵称更新成功' });
          });
        });
      });
    });
  });
});


// 点赞帖子接口
app.post('/weibo/:weiboId/like', (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).send('缺少 token');
  }

  const userId = token.split(' ')[1];  // 从 Authorization header 中提取 token 部分
  const weiboId = req.params.weiboId;


  if (!userId || !weiboId) {
    return res.status(400).json({ success: false, message: '用户ID和微博ID不能为空' });
  }

  // 检查用户是否已经点赞
  const checkQuery = 'SELECT * FROM likes WHERE user_id = ? AND target_id = ? AND target_type = "post"';
  db.query(checkQuery, [userId, weiboId], (err, results) => {
    if (err) {
      console.error('检查点赞记录时发生错误:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: '您已经点赞过该帖子' });
    }

    // 插入点赞记录
    const insertQuery = 'INSERT INTO likes (user_id, target_id, target_type) VALUES (?, ?, "post")';
    db.query(insertQuery, [userId, weiboId], (err) => {
      if (err) {
        console.error('点赞帖子时发生错误:', err);
        return res.status(500).json({ success: false, message: '服务器错误' });
      }

      // 更新微博的点赞数
      const updateWeiboQuery = 'UPDATE weibo SET like_count = like_count + 1 WHERE weibo_id = ?';
      db.query(updateWeiboQuery, [weiboId], (err) => {
        if (err) {
          console.error('更新微博点赞数时发生错误:', err);
          return res.status(500).json({ success: false, message: '服务器错误' });
        }

        res.json({ success: true, message: '点赞成功' });
      });
    });
  });
});


// 点赞评论接口
app.post('/weibo/:id/comments/:comment_id/like', (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).send('缺少 token');
  }

  const userId = token.split(' ')[1];  // 从 Authorization header 中提取 token 部分
  const commentId = req.params.comment_id;

  if (!userId || !commentId) {
    return res.status(400).json({ success: false, message: '用户ID和评论ID不能为空' });
  }

  // 检查用户是否已经点赞
  const checkQuery = 'SELECT * FROM likes WHERE user_id = ? AND target_id = ? AND target_type = "comment"';
  db.query(checkQuery, [userId, commentId], (err, results) => {
    if (err) {
      console.error('检查点赞记录时发生错误:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: '您已经点赞过该评论' });
    }

    // 插入点赞记录
    const insertQuery = 'INSERT INTO likes (user_id, target_id, target_type) VALUES (?, ?, "comment")';
    db.query(insertQuery, [userId, commentId], (err) => {
      if (err) {
        console.error('点赞评论时发生错误:', err);
        return res.status(500).json({ success: false, message: '服务器错误' });
      }

      // 更新评论的点赞数
      const updateCommentQuery = 'UPDATE comments SET like_count = like_count + 1 WHERE comment_id = ?';
      db.query(updateCommentQuery, [commentId], (err) => {
        if (err) {
          console.error('更新评论点赞数时发生错误:', err);
          return res.status(500).json({ success: false, message: '服务器错误' });
        }

        res.json({ success: true, message: '点赞成功' });
      });
    });
  });
});



// 取消微博点赞接口
app.post('/weibo/:weibo_id/unlike', (req, res) => {
  const { weibo_id } = req.params;
  const token = req.headers['authorization'];

  // if (!token) {
  //   return res.status(400).send('缺少 token');
  // }

  const userId = token.split(' ')[1]; // 从 Authorization header 中提取 token 部分

  if (!userId || !weibo_id) {
    return res.status(400).json({ success: false, message: '用户ID和微博ID不能为空' });
  }


  const deleteQuery = 'DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = "post"';
  const updateQuery = 'UPDATE weibo SET like_count = like_count - 1 WHERE weibo_id = ?';

  // 删除点赞记录
  db.query(deleteQuery, [userId, weibo_id], (err) => {
    if (err) {
      console.error('取消微博点赞时发生错误:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }

    // 更新微博点赞数
    db.query(updateQuery, [weibo_id], (err) => {
      if (err) {
        console.error('更新微博点赞数时发生错误:', err);
        return res.status(500).json({ success: false, message: '服务器错误' });
      }

      res.json({ success: true, message: '取消点赞成功' });
    });
  });
});


// 取消评论点赞接口
app.post('/weibo/:id/comments/:comment_id/unlike', (req, res) => {
  const { id, comment_id } = req.params;
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).send('缺少 token');
  }

  const userId = token.split(' ')[1]; // 从 Authorization header 中提取 token 部分

  const deleteQuery = 'DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = "comment"';
  const updateQuery = 'UPDATE comments SET like_count = like_count - 1 WHERE comment_id = ?';

  // 删除点赞记录
  db.query(deleteQuery, [userId, comment_id], (err) => {
    if (err) {
      console.error('取消评论点赞时发生错误:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }

    // 更新评论点赞数
    db.query(updateQuery, [comment_id], (err) => {
      if (err) {
        console.error('更新评论点赞数时发生错误:', err);
        return res.status(500).json({ success: false, message: '服务器错误' });
      }

      res.json({ success: true, message: '取消点赞成功' });
    });
  });
});


// 判断用户是否点赞了微博
app.get('/weibo/:weibo_id/judgeLiked', (req, res) => {
  const { weibo_id } = req.params;
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).send('缺少 token');
  }

  const userId = token.split(' ')[1]; // 从 Authorization header 中提取 token 部分

  const checkQuery = 'SELECT * FROM likes WHERE user_id = ? AND target_id = ? AND target_type = "post"';
  db.query(checkQuery, [userId, weibo_id], (err, results) => { 
    if (err) {
      console.error('查询点赞状态时发生错误:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }
    const isLiked = results.length > 0;
    res.json({ success: true, isLiked });
  });
});


// 判断用户是否点赞了评论
app.get('/weibo/:id/comments/:comment_id/judgeLiked', (req, res) => {
  const { id,comment_id } = req.params;
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).send('缺少 token');
  }

  const userId = token.split(' ')[1]; // 从 Authorization header 中提取 token 部分

  const checkQuery = 'SELECT * FROM likes WHERE user_id = ? AND target_id = ? AND target_type = "comment"';
  db.query(checkQuery, [userId, comment_id], (err, results) => {
    if (err) {
      console.error('查询点赞状态时发生错误:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }

    const isLiked = results.length > 0;
    res.json({ success: true, isLiked });
  });
});



app.post('/register', (req, res) => {
  const { username, password, profile_image_url, nickname } = req.body;

  // 检查用户名是否已存在
  const checkUsernameSql = 'SELECT * FROM login WHERE username = ?';
  db.query(checkUsernameSql, [username], (err, result) => {
    if (err) {
      console.error('查询用户名时发生错误:', err);
      return res.status(500).json({ message: '注册失败，请稍后再试' });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 插入用户信息
    const insertUserInfoSql = 'INSERT INTO login (username, password) VALUES (?, ?)';
    db.query(insertUserInfoSql, [username, password], (err, result) => {
      if (err) {
        console.error('注册用户时发生错误:', err);
        return res.status(500).json({ message: '注册失败，请稍后再试' });
      }

      // 插入用户信息
      const insertWeiboSql = 'INSERT INTO user_info (id, nickname, profile_image_url) VALUES (?, ?, ?)';
      db.query(insertWeiboSql, [username, nickname, profile_image_url], (err, result) => {
        if (err) {
          console.error('插入微博数据时发生错误:', err);
          return res.status(500).json({ message: '微博数据插入失败' });
        }

        res.json({ success: true, message: '注册成功' });
      });
    });
  });
});


app.get('/weibos', (req, res) => {
  const query = `
    SELECT 
      weibo_id, 
      publisher_id, 
      publisher_nickname, 
      publisher_avatar_url, 
      like_count, 
      publish_content,
      publish_time
    FROM weibo
    ORDER BY publish_time DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('查询微博数据失败:', err);
      return res.status(500).json({ error: '无法获取微博数据' });
    }

    // 将时间格式化为“x hours ago”或完整日期格式
    const formattedResults = results.map(weibo => ({
      ...weibo,
      publish_time: formatTime(weibo.publish_time)
    }));

    res.json(formattedResults);
  });
});

// 发布微博接口
app.post('/posts', (req, res) => {
  const { publisher_id, publish_content } = req.body;

  // 查询用户信息
  const queryUserInfo = `
    SELECT nickname, profile_image_url 
    FROM user_info 
    WHERE id = ?`;

  db.query(queryUserInfo, [publisher_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { nickname, profile_image_url } = result[0];

    // 插入微博信息
    const insertWeibo = `
      INSERT INTO weibo (publisher_id, publisher_nickname, publisher_avatar_url, publish_content, publish_time)
      VALUES (?, ?, ?, ?, NOW())`;

    db.query(insertWeibo, [publisher_id, nickname, profile_image_url, publish_content], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });

      res.status(200).json({ message: 'Weibo posted successfully' });
    });
  });
});

// 获取指定微博的详细信息
app.get('/weibo/:id', (req, res) => {
  const weiboId = req.params.id;
  if (!weiboId) {
    return res.status(400).json({ error: '微博 ID 不能为空' });
  }

  // 获取微博详细内容
  const query = `
    SELECT 
      weibo_id, 
      publisher_id, 
      publisher_nickname, 
      publisher_avatar_url, 
      like_count, 
      publish_content, 
      publish_time
    FROM weibo
    WHERE weibo_id = ?
    ORDER BY publish_time DESC`;

  db.query(query, [weiboId], (err, weiboResults) => {
    if (err) {
      console.error('查询微博数据失败:', err);
      return res.status(500).json({ error: '无法获取微博数据' });
    }

    if (weiboResults.length === 0) {
      return res.status(404).json({ error: '微博不存在' });
    }

    const weibo = weiboResults[0];
    weibo.publish_time = formatTime(weibo.publish_time);

    // 获取该微博的所有评论
    const commentsQuery = `
      SELECT 
        comment_id, 
        commenter_id, 
        commenter_nickname, 
        commenter_avatar_url, 
        like_count, 
        comment_content,
        comment_time
      FROM comments
      WHERE weibo_id = ?`;

    db.query(commentsQuery, [weiboId], (err, commentsResults) => {
      if (err) {
        console.error('查询评论数据失败:', err);
        return res.status(500).json({ error: '无法获取评论数据' });
      }

      const formattedComments = commentsResults.map(comment => ({
        ...comment,
        comment_time: formatTime(comment.comment_time)
      }));

      res.json({ weibo, comments: formattedComments });
    });
  });
});

// 提交评论接口
app.post('/weibo/:id/comments', (req, res) => {
  const weiboId = req.params.id;
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(400).send('缺少 token');
  }
  const tokenParts = token.split(' ');
  if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
      return res.status(400).send('无效的 token 格式');
  }
  const username = tokenParts[1];

  const { comment_content } = req.body;

  if (!comment_content || !comment_content.trim()) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  const query = 'SELECT nickname, profile_image_url FROM user_info WHERE id = ?';
  db.query(query, [username], (err, results) => {
    if (err || results.length === 0) {
      console.error('查询用户信息失败:', err);
      return res.status(500).json({ error: '查询用户信息失败' });
    }

    const { nickname, profile_image_url } = results[0];
    const insertQuery = `
        INSERT INTO comments (weibo_id, commenter_id, commenter_nickname, commenter_avatar_url, comment_content, like_count, comment_time)
        VALUES (?, ?, ?, ?, ?, 0, NOW())`;

    db.query(insertQuery, [weiboId, username, nickname, profile_image_url, comment_content], (err) => {
      if (err) {
        console.error('提交评论失败:', err);
        return res.status(500).json({ error: '提交评论失败' });
      }

      res.status(201).json({ message: '评论成功' });
    });
  });
});


app.get('/message/weibo', (req, res) => {
  // 获取微博数据
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(400).send('缺少 token');
  }
  const tokenParts = token.split(' ');
  if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
      return res.status(400).send('无效的 token 格式');
  }
  const username = tokenParts[1];

  const query = `
  SELECT 
    weibo_id, 
    publisher_id, 
    publisher_nickname, 
    publisher_avatar_url, 
    like_count, 
    publish_content,
    publish_time
  FROM weibo
  WHERE publisher_id = ?
  ORDER BY publish_time DESC
`;

db.query(query, [username],(err, results) => {
  if (err) {
    console.error('查询微博数据失败:', err);
    return res.status(500).json({ error: '无法获取微博数据' });
  }

  // 将时间格式化为“x hours ago”或完整日期格式
  const formattedResults = results.map(weibo => ({
    ...weibo,
    publish_time: formatTime(weibo.publish_time)
  }));

  res.json(formattedResults);
});
});

app.delete('/delete/comments/:comment_id', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(400).send('缺少 token');
  }
  const tokenParts = token.split(' ');
  if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
      return res.status(400).send('无效的 token 格式');
  }
  const username = tokenParts[1];
  const comment_id = req.params.comment_id;
  const query = 'DELETE FROM comments WHERE comment_id = ? AND commenter_id = ?';
  db.query(query, [comment_id, username], (err) => {
    if (err) {
      console.error('删除评论失败:', err);
      return res.status(500).json({ error: '删除评论失败' });
    }

    res.status(200).json({ message: '删除评论成功' });
  });
});

app.delete('/delete/weibo/:weibo_id', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(400).send('缺少 token');
  }

  const tokenParts = token.split(' ');
  if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
    return res.status(400).send('无效的 token 格式');
  }

  const username = tokenParts[1];
  const weibo_id = req.params.weibo_id;

  const deleteCommentsQuery = 'DELETE FROM comments WHERE weibo_id = ?';
  db.query(deleteCommentsQuery, [weibo_id], (err) => {
    if (err) {
      console.error('删除评论失败:', err);
      return res.status(500).json({ error: '删除评论失败' });
    }

    const deleteWeiboQuery = 'DELETE FROM weibo WHERE weibo_id = ? AND publisher_id = ?';
    db.query(deleteWeiboQuery, [weibo_id, username], (err) => {
      if (err) {
        console.error('删除微博失败:', err);
        return res.status(500).json({ error: '删除微博失败' });
      }

      res.status(200).json({ message: '删除微博及其评论成功' });
    });
  });
});



      

// 格式化时间函数
function formatTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now - time) / 1000); // 秒数差值

  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
  if (diff < 31536000) {
    return `${time.getMonth() + 1}月${time.getDate()}日 ${time.getHours()}:${time.getMinutes()}`;
  }
  return `${time.getFullYear()}年${time.getMonth() + 1}月${time.getDate()}日`;
}




const PORT = 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
