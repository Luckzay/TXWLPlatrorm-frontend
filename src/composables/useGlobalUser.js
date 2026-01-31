import {computed, reactive, readonly} from 'vue';
import { authService } from '@/services/authService';

// 创建全局用户状态
const globalUser = reactive({
  userUid: null,
  username: '',
  realname: '',
  phone: '',
  roleId: null
});

// 同步全局状态到本地响应式对象
const syncGlobalUserState = () => {
  const currentUserInfo = authService.getCurrentUser();
  Object.assign(globalUser, currentUserInfo);
};

// 更新全局用户状态
const updateGlobalUser = (userData) => {
  authService.setCurrentUser(userData);
  syncGlobalUserState();
};

// 清除全局用户状态
const clearGlobalUser = () => {
  authService.clearCurrentUser();
  syncGlobalUserState();
};

export const useGlobalUser = {
  state: readonly(globalUser),
  update: updateGlobalUser,
  clear: clearGlobalUser,
  sync: syncGlobalUserState,
  isAuthenticated: authService.isAuthenticated
};