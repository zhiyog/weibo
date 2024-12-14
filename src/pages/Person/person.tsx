import { Button, Modal, Form, Input, message } from 'antd';
import './person.css';
import { AuthService } from '../../components/routerProtect/log';
import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

const UserProfile = () => {
  const [nickname, setNickname] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isModalVisible, setModalVisible] = useState({ type: '', visible: false }); // 控制弹窗
  const [form] = Form.useForm();

  // 获取用户信息
  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = jwt_decode(token);

    fetch('http://localhost:5000/getUserInfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${decodedToken.username}`,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error('获取用户信息失败');
        return response.json();
      })
      .then(data => {
        const user = data[0];
        setNickname(user.nickname);
        setImageUrl(user.profile_image_url);
      })
      .catch(err => {
        message.error(err.message);
      });
  }, []);

  // 通用提交函数
  const handleSubmit = values => {
    const token = localStorage.getItem('token');
    const decodedToken = jwt_decode(token);

    if (isModalVisible.type === 'nickname') {
      fetch('http://localhost:5000/update-nickname', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${decodedToken.username}`,
        },
        body: JSON.stringify({
          id: decodedToken.username,
          nickname: values.nickname,
        }),
      })
        .then(response => {
          if (!response.ok) throw new Error('更新昵称失败');
          return response.json();
        })
        .then(() => {
          setNickname(values.nickname);
          message.success('昵称更新成功');
          setModalVisible({ type: '', visible: false });
        })
        .catch(err => {
          message.error(err.message);
        });
    } else if (isModalVisible.type === 'password') {
      fetch('http://localhost:5000/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${decodedToken.username}`,
        },
        body: JSON.stringify({
          username: decodedToken.username,
          newPassword: values.newPassword,
        }),
      })
        .then(response => {
          if (!response.ok) throw new Error('更新密码失败');
          return response.json();
        })
        .then(() => {
          message.success('密码更新成功');
          setModalVisible({ type: '', visible: false });
        })
        .catch(err => {
          message.error(err.message);
        });
    }else if (isModalVisible.type === 'profileImageUrl') {
      fetch('http://localhost:5000/update-profile-image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${decodedToken.username}`,
        },
        body: JSON.stringify({
          id: decodedToken.username,
          profileImageUrl: values.profileImageUrl,
        }),
      })
        .then(response => {
          if (!response.ok) throw new Error('更新头像失败');
          return response.json();
      })
      .then(() => {
        setImageUrl(values.profileImageUrl);
        message.success('头像更新成功');
        setModalVisible({ type: '', visible: false });
        })
        .catch(err => {
          message.error(err.message);
          });
    }
  };

  // 打开弹窗
  const openModal = type => {
    setModalVisible({ type, visible: true });
    form.resetFields();
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible({ type: '', visible: false });
    form.resetFields();
  };

  return (
    <div className="person">
      <h1>个人中心</h1>
      <img id="image" src={imageUrl} alt={nickname} onClick={() => openModal('profileImageUrl')}/>
      <p>昵称: {nickname}</p>
      <div className='btn-group'>
        <Button type="primary" onClick={() => openModal('nickname')} style={{ marginBottom: 16 }}>
          修改昵称
        </Button>
        <Button type="primary" onClick={() => openModal('password')} style={{ marginBottom: 16 }}>
          修改密码
        </Button>
        <Button type="primary" danger onClick={AuthService.logout}>
          退出登录
        </Button>   
      </div>

      {/* 通用弹窗 */}
      <Modal
        title={
          isModalVisible.type === 'nickname' 
            ? '修改昵称' 
            : isModalVisible.type === 'password' 
            ? '修改密码' 
            : isModalVisible.type === 'profileImageUrl' 
            ? '修改头像'
            : ''
        }
        open={isModalVisible.visible}
        onCancel={closeModal}
        footer={null}
      >

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={isModalVisible.type === 'nickname' ? { nickname } : {}}
        >
          {isModalVisible.type === 'nickname' && (
            <Form.Item
              label="新昵称"
              name="nickname"
              rules={[{ required: true, message: '请输入新昵称' }]}
            >
              <Input />
            </Form.Item>
          )}
          {isModalVisible.type === 'password' && (
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[{ required: true, message: '请输入新密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          {
            isModalVisible.type === 'profileImageUrl' && (
              <Form.Item
                label="新头像"
                name="profileImageUrl"
                rules={[{ required: true, message: '请上传新头像' }]}
              >
                <Input />
              </Form.Item>
            )
          }
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
