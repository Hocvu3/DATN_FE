"use client";

import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, Spin, Typography } from 'antd';
import { UserOutlined, CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import {
  fetchUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  getAvatarUrl,
  type UserProfile,
  type UpdateProfileRequest,
} from '@/lib/users-api';
import { showNotification } from '@/utils/notification';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

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
      showNotification('error', 'Failed to load profile. Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: UpdateProfileRequest) => {
    try {
      setSaving(true);
      const updated = await updateUserProfile(values);
      setProfile(updated);
      
      showNotification('success', 'Profile updated successfully');
    } catch (error: any) {
      showNotification('error', 'Failed to update profile. Please try again later');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const newAvatarUrl = await uploadUserAvatar(file);
      setAvatarUrl(newAvatarUrl);
      
      showNotification('success', 'Avatar updated successfully');
      
      await loadProfile();
    } catch (error: any) {
      showNotification('error', 'Failed to upload avatar. Please try again later');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      showNotification('error', 'You can only upload image files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      showNotification('error', 'Image must be smaller than 5MB!');
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
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
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
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input size="large" placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input size="large" placeholder="Enter last name" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input size="large" placeholder="Enter username" />
          </Form.Item>

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
    </div>
  );
}
