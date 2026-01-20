<template>
  <div id="app">
    <el-container class="layout-container">
      <el-header class="header">
        <div class="header-content">
          <h1 class="logo">同行未来新高考生涯规划平台</h1>
          <div class="user-actions">
            <el-button v-if="!isLoggedIn" type="primary" @click="login">登录</el-button>
            <el-button v-if="!isLoggedIn" type="success" @click="register">注册</el-button>
            <el-dropdown v-else>
              <span class="el-dropdown-link">
                {{ currentUser.realname || currentUser.username }} <el-icon><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToReports">我的报告</el-dropdown-item>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
      
      <el-footer class="footer">
        <div class="footer-content">
          <p>© 2026 同行未来新高考生涯规划平台 - 专业生涯规划系统</p>
        </div>
      </el-footer>
    </el-container>
    
    <!-- 登录对话框 -->
    <el-dialog v-model="showLoginDialog" title="用户登录" width="400px" center>
      <LoginForm @login-success="handleLoginSuccess" @switch-to-register="switchToRegister" />
    </el-dialog>
    
    <!-- 注册对话框 -->
    <el-dialog v-model="showRegisterDialog" title="用户注册" width="400px" center>
      <RegisterForm @register-success="handleRegisterSuccess" @switch-to-login="switchToLogin" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { authService } from '@/services/authService'

const router = useRouter()

// 状态管理
const showLoginDialog = ref(false)
const showRegisterDialog = ref(false)

// 用户状态
const currentUser = reactive({
  username: '',
  realname: '',
  uid: null,
  roleId: null
})

// 计算属性
const isLoggedIn = computed(() => {
  return authService.isAuthenticated()
})

// 组件挂载时检查登录状态
onMounted(() => {
  if (isLoggedIn.value) {
    // 如果已登录，尝试获取用户信息
    try {
      const userInfo = authService.getCurrentUserFromToken();
      Object.assign(currentUser, {
        username: userInfo.username,
        realname: userInfo.realname || userInfo.username,
        uid: userInfo.uid,
        roleId: userInfo.roleId
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }
  
  // 将登录方法暴露给全局，以便路由守卫调用
  window.showLoginModal = login;
})

// 方法
const login = () => {
  showLoginDialog.value = true
}

const register = () => {
  showRegisterDialog.value = true
}

const logout = () => {
  authService.logout();
  Object.assign(currentUser, {
    username: '',
    realname: '',
    uid: null,
    roleId: null
  });
  router.push('/')
  window.location.reload()
}

const goToReports = () => {
  if (!authService.isAuthenticated()) {
    ElMessage.warning('请先登录')
    router.push('/')
    return
  }
  router.push('/reports')
}

const handleLoginSuccess = (userData) => {
  showLoginDialog.value = false
  Object.assign(currentUser, {
    username: userData.username || userData.phone,
    realname: userData.realname || userData.username || userData.phone,
    uid: userData.uid,
    roleId: userData.roleId
  });
  router.push('/')
}

const handleRegisterSuccess = () => {
  showRegisterDialog.value = false
  // 自动跳转到登录
  setTimeout(() => {
    showLoginDialog.value = true
  }, 500)
}

const switchToRegister = () => {
  showLoginDialog.value = false
  showRegisterDialog.value = true
}

const switchToLogin = () => {
  showRegisterDialog.value = false
  showLoginDialog.value = true
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  color: #409EFF;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #409EFF, #667eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
  display: flex;
  align-items: center;
  gap: 5px;
}

.main-content {
  padding: 20px;
  background: linear-gradient(to bottom right, #f5f7fa, #c3cfe2);
  min-height: calc(100vh - 140px);
}

.footer {
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
}

.footer-content {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}
</style>