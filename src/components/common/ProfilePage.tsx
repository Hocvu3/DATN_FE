"use client";

import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, Spin, Typography, Row, Col, App, Divider } from 'antd';
import { UserOutlined, CameraOutlined, LoadingOutlined, LockOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import {
  fetchUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  changeUserPassword,
  type UserProfile,
  type UpdateProfileRequest,
} from '@/lib/users-api';
import Toast from '@/components/common/Toast';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Helper function to dispatch notification events
  const showDirectNotification = (type: 'success' | 'error', content: string, duration?: number) => {
    // Use hook-based message from App context
    if (type === 'success') {
      message.success(content, duration);
    } else if (type === 'error') {
      message.error(content, duration);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchUserProfile();
      setProfile(data);
      setAvatarUrl(data.avatar?.s3Url || '');
      
      form.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load profile. Please try again later';
      showDirectNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: UpdateProfileRequest) => {
    try {
      setSaving(true);
      const updated = await updateUserProfile(values);
      setProfile(updated);
      
      showDirectNotification('success', 'Profile updated successfully', 5);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update profile. Please try again later';
      showDirectNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      setChangingPassword(true);
      await changeUserPassword(values.currentPassword, values.newPassword);
      
      showDirectNotification('success', 'Password changed successfully', 5);
      passwordForm.resetFields();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to change password. Please try again later';
      showDirectNotification('error', errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const newAvatarUrl = await uploadUserAvatar(file);
      setAvatarUrl(newAvatarUrl);
      
      showDirectNotification('success', 'Avatar updated successfully', 5);
      
      await loadProfile();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to upload avatar. Please try again later';
      showDirectNotification('error', errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      showDirectNotification('error', 'You can only upload image files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      showDirectNotification('error', 'Image must be smaller than 5MB!');
      return false;
    }
    
    handleAvatarUpload(file);
    return false; // Prevent default upload behavior
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[24, 24]}>
          {/* Profile Information Card */}
          <Col xs={24} lg={14}>
            <Card>
              <Title level={2}>Profile Settings</Title>
              
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    size={120}
                    src={avatarUrl}
                    icon={<UserOutlined />}
                  />
                  <Upload
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    accept="image/*"
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={uploadingAvatar ? <LoadingOutlined /> : <CameraOutlined />}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                      }}
                      loading={uploadingAvatar}
                    />
                  </Upload>
                </div>
                
                {profile?.department && (
                  <div style={{ marginTop: '16px' }}>
                    <Text type="secondary" strong>
                      {profile.department.name}
                    </Text>
                  </div>
                )}
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="First Name"
                      name="firstName"
                      rules={[{ required: true, message: 'Please enter your first name' }]}
                    >
                      <Input size="large" placeholder="Enter first name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Last Name"
                      name="lastName"
                      rules={[{ required: true, message: 'Please enter your last name' }]}
                    >
                      <Input size="large" placeholder="Enter last name" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Username"
                      name="username"
                      rules={[{ required: true, message: 'Please enter your username' }]}
                    >
                      <Input size="large" placeholder="Enter username" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' },
                      ]}
                    >
                      <Input size="large" placeholder="Enter email" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={saving}
                    block
                  >
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Change Password Card */}
          <Col xs={24} lg={10}>
            <Card>
              <Title level={3}>
                <LockOutlined /> Change Password
              </Title>
              <Divider />
              
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Form.Item
                  label="Current Password"
                  name="currentPassword"
                  rules={[
                    { required: true, message: 'Please enter your current password' },
                  ]}
                >
                  <Input.Password size="large" placeholder="Enter current password" />
                </Form.Item>

                <Form.Item
                  label="New Password"
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Please enter your new password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                  ]}
                >
                  <Input.Password size="large" placeholder="Enter new password" />
                </Form.Item>

                <Form.Item
                  label="Confirm New Password"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password size="large" placeholder="Confirm new password" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={changingPassword}
                    block
                    danger
                  >
                    Change Password
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}