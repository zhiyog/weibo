import mysql from 'mysql2';

// 创建 MySQL 连接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // 替换为你的 MySQL 用户名
  password: 'zhangziyang',  // 替换为你的 MySQL 密码
  database: 'weibo_db'  // 数据库名称
});

// 连接数据库
db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('数据库连接成功');

  // 创建点赞表的 SQL 语句
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      target_id INT NOT NULL,
      target_type ENUM('post', 'comment') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, target_id, target_type)
    );
  `;

  // 执行 SQL 语句创建表
  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('创建点赞表失败:', err);
      return;
    }
    console.log('点赞表创建成功', result);
  });

  // 选择现有的数据库 weibo_db
  // db.changeUser({ database: 'weibo_db' }, (err) => {
  //   if (err) {
  //     console.error('选择数据库失败:', err);
  //     return;
  //   }

  //   // 修改微博表，添加时间列
  //   const addTimeColumnToWeibo = `
  //     ALTER TABLE weibo
  //     ADD COLUMN publish_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  //   `;

  //   db.query(addTimeColumnToWeibo, (err, result) => {
  //     if (err) {
  //       console.error('为微博表添加时间列失败:', err);
  //       return;
  //     }
  //     console.log('微博表时间列添加成功');
  //   });

  //   // 修改评论表，添加时间列
  //   const addTimeColumnToComments = `
  //     ALTER TABLE comments
  //     ADD COLUMN comment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  //   `;

  //   db.query(addTimeColumnToComments, (err, result) => {
  //     if (err) {
  //       console.error('为评论表添加时间列失败:', err);
  //       return;
  //     }
  //     console.log('评论表时间列添加成功');
  //   });
  //   // // 创建微博表
  //   // const createWeiboTable = `
  //   //         CREATE TABLE IF NOT EXISTS weibo (
  //   //           weibo_id INT AUTO_INCREMENT PRIMARY KEY,   -- 微博 ID
  //   //           publisher_id VARCHAR(255) NOT NULL,        -- 发布者 ID
  //   //           publisher_nickname VARCHAR(255) NOT NULL,  -- 发布者昵称
  //   //           publisher_avatar_url VARCHAR(255),         -- 发布者头像 URL
  //   //           like_count INT DEFAULT 0,                  -- 点赞数
  //   //           publish_content TEXT NOT NULL,                      -- 微博内容
  //   //           FOREIGN KEY (publisher_id) REFERENCES login(username)  -- 关联用户表中的用户 ID
  //   //         );
  //   //       `;
  //   // db.query(createWeiboTable, (err, result) => {
  //   //   if (err) {
  //   //     console.error('创建微博表失败:', err);
  //   //     return;
  //   //   }
  //   //   console.log('微博表创建成功');
  //   // });

  //   // // 创建评论表
  //   // const createCommentsTable = `
  //   //         CREATE TABLE IF NOT EXISTS comments (
  //   //           comment_id INT AUTO_INCREMENT PRIMARY KEY,    -- 评论 ID
  //   //           weibo_id INT NOT NULL,                        -- 微博 ID
  //   //           commenter_id VARCHAR(255) NOT NULL,           -- 评论人 ID
  //   //           commenter_nickname VARCHAR(255) NOT NULL,     -- 评论人昵称
  //   //           commenter_avatar_url VARCHAR(255),            -- 评论人头像 URL
  //   //           like_count INT DEFAULT 0,                     -- 评论点赞数
  //   //           comment_content TEXT NOT NULL,                         -- 评论内容
  //   //           FOREIGN KEY (weibo_id) REFERENCES weibo(weibo_id),  -- 关联微博表中的微博 ID
  //   //           FOREIGN KEY (commenter_id) REFERENCES login(username)  -- 关联用户表中的评论人 ID
  //   //         );
  //   //       `;
  //   // db.query(createCommentsTable, (err, result) => {
  //   //   if (err) {
  //   //     console.error('创建评论表失败:', err);
  //   //     return;
  //   //   }
  //   //   console.log('评论表创建成功');
 
  //   // });

  //   // const createTableQuery = `
  //   //   CREATE TABLE IF NOT EXISTS user_info (
  //   //     id VARCHAR(255) PRIMARY KEY,
  //   //     profile_image_url VARCHAR(255) NOT NULL,
  //   //     nickname VARCHAR(100) NOT NULL
  //   //   )`;
  //   //   db.query(createTableQuery, (err) => {
  //   //     if (err) {
  //   //       console.error('创建 user_info 表失败:', err);
  //   //       return;
  //   //     }
  //   //     console.log('user_info 表创建成功');
  //   //   });
  //   //   const insertQuery = `
  //   //     INSERT INTO user_info (id, profile_image_url, nickname)
  //   //     VALUES (?, ?, ?)
  //   //   `;
  //   //   const init_id = "admin";
  //   //   const init_profile_image_url = 'https://smms.app/image/jQnIbr8vahTguYs';
  //   //   const init_nickname = 'zhiyog';
  //   //   db.query(insertQuery, [init_id, init_profile_image_url, init_nickname], (err) => {
  //   //     if (err) {
  //   //       console.error('插入初始数据失败:', err);
  //   //       return;
  //   //     }
  //   //     console.log('初始信息成功');
  //   //   });

  //   // 创建 login 表
  //   // const createTableQuery = `
  //   //   CREATE TABLE IF NOT EXISTS login (
  //   //     id INT AUTO_INCREMENT PRIMARY KEY,
  //   //     username VARCHAR(255) NOT NULL UNIQUE,
  //   //     password VARCHAR(255) NOT NULL,
  //   //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //   //   )
  //   // `;
  //   // db.query(createTableQuery, (err) => {
  //   //   if (err) {
  //   //     console.error('创建 login 表失败:', err);
  //   //     return;
  //   //   }
  //   //   console.log('login 表创建成功');

  //   //   // 插入初始账号数据
  //   //   const insertQuery = `
  //   //     INSERT INTO login (username, password)
  //   //     VALUES (?, ?)
  //   //   `;

  //   //   // 假设初始账号用户名为 "admin"，密码为 "admin123"（这里应使用加密后的密码）
  //   //   const initialUsername = 'admin';
  //   //   const initialPassword = 'admin123';  // 请使用加密后的密码


  //   //   db.query(insertQuery, [initialUsername, initialPassword], (err) => {
  //   //     if (err) {
  //   //       console.error('插入初始账号数据失败:', err);
  //   //       return;
  //   //     }
  //   //     console.log('初始账号插入成功');
  //   //   });
  //   // });
  // });

  // 创建数据库
  // const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS weibo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`;
  // db.query(createDatabaseQuery, (err, result) => {
  //   if (err) {
  //     console.error('创建数据库失败:', err);
  //     return;
  //   }
  //   console.log('数据库创建成功');

  //   // 使用数据库
  //   db.query('USE weibo_db;', (err, result) => {
  //     if (err) {
  //       console.error('切换到数据库失败:', err);
  //       return;
  //     }
  //     console.log('切换到数据库 weibo_db');

  //     // 创建用户表
  //     const createUsersTableQuery = `
  //       CREATE TABLE IF NOT EXISTS users (
  //         id INT AUTO_INCREMENT PRIMARY KEY,
  //         username VARCHAR(50) NOT NULL UNIQUE,
  //         password VARCHAR(255) NOT NULL,
  //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //       );
  //     `;
  //     db.query(createUsersTableQuery, (err, result) => {
  //       if (err) {
  //         console.error('创建用户表失败:', err);
  //         return;
  //       }
  //       console.log('用户表创建成功');

  //       // 创建微博表
  //       const createPostsTableQuery = `
  //         CREATE TABLE IF NOT EXISTS posts (
  //           id INT AUTO_INCREMENT PRIMARY KEY,
  //           content TEXT NOT NULL,
  //           user_id INT NOT NULL,
  //           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  //         );
  //       `;
  //       db.query(createPostsTableQuery, (err, result) => {
  //         if (err) {
  //           console.error('创建微博表失败:', err);
  //           return;
  //         }
  //         console.log('微博表创建成功');

  //         // 插入默认数据
  //         const insertUsersQuery = `
  //           INSERT INTO users (username, password)
  //           VALUES 
  //             ('zhangzy', 'password123'),
  //             ('lisi', 'password456'),
  //             ('wangwu', 'password789');
  //         `;
  //         db.query(insertUsersQuery, (err, result) => {
  //           if (err) {
  //             console.error('插入用户数据失败:', err);
  //           } else {
  //             console.log('用户数据插入成功');
  //           }
  //         });

  //         const insertPostsQuery = `
  //           INSERT INTO posts (content, user_id)
  //           VALUES
  //             ('今天很开心！', 1),
  //             ('今天天气不错！', 2),
  //             ('刚刚学了一些新的技术，感觉很有收获！', 1),
  //             ('准备去旅行啦！', 3);
  //         `;
  //         db.query(insertPostsQuery, (err, result) => {
  //           if (err) {
  //             console.error('插入微博数据失败:', err);
  //           } else {
  //             console.log('微博数据插入成功');
  //           }
  //         });
  //       });
  //     });
  //   });
  // });
});
