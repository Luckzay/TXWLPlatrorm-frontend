import api from '@/utils/api';
import { jwtDecode } from 'jwt-decode'; // 使用jwt-decode库解析JWT

export const authService = {
  // 获取当前用户信息
  getCurrentUserFromToken: () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }

      // 从本地存储获取已缓存的用户信息
      const userInfoStr = localStorage.getItem('userInfo');
      console.info(userInfoStr,'------------')
      if (userInfoStr) {
        return JSON.parse(userInfoStr);
      }
      
      // 如果没有缓存信息，解析JWT token获取基本用户名信息
      const decodedToken = jwtDecode(token);
      const username = decodedToken.sub;
      
      return {
        username: username,
        phone: username, // 假设用户名就是手机号
        userUid: null,
        realname: '',
        roleId: null
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  // 登录
  login: async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', {
        identifier,
        password
      });

      if (response.data && response.data.token) {
        // 保存token
        localStorage.setItem('token', response.data.token);
        
        // 从响应中获取完整的用户信息
        const userInfo = {
          userUid: response.data.userUid,
          username: response.data.username,
          realname: response.data.realname,
          phone: response.data.phone,
          roleId: response.data.roleId
        };
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        return { success: true, userInfo, token: response.data.token };
      } else {
        throw new Error('登录失败：未获取到令牌');
      }
    } catch (error) {
      console.error('登录失败:', error);
      let errorMessage = '登录失败';
      if (error.response) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data?.message 
          || '登录失败';
      } else if (error.request) {
        errorMessage = '网络错误，请检查服务器连接';
      } else {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  // 注册
  register: async (phone, realname, identity, password) => {
    try {
      const response = await api.post('/auth/register', {
        phone,
        realname,
        identity,
        password
      });

      if (response.status === 200) {
        return { success: true, message: '注册成功' };
      } else {
        throw new Error('注册失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      let errorMessage = '注册失败';
      if (error.response) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data?.message 
          || '注册失败';
      } else if (error.request) {
        errorMessage = '网络错误，请检查服务器连接';
      } else {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  // 登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  },

  // 检查是否已登录
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};