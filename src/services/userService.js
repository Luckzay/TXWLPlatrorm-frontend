import api from '@/utils/api'

export const userService = {
  // 获取当前用户信息
  getCurrentUser: async () => {
    try {
      // 由于后端没有提供获取当前用户信息的API，我们需要创建一个
      // 临时方案：从本地存储获取用户信息
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        return JSON.parse(userInfoStr);
      }
      
      // 如果本地没有存储，尝试通过token获取用户信息（需要后端支持）
      const response = await api.get('/users/profile'); // 需要在后端实现
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  // 获取用户信息通过手机号
  getUserByPhone: async (phone) => {
    try {
      const response = await api.post('/users/find-by-username-or-phone', {
        phone: phone
      });
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
};