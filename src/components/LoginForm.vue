<template>
  <el-form :model="form" :rules="rules" ref="loginFormRef" label-width="80px">
    <el-form-item label="用户名/手机" prop="identifier">
      <el-input 
        v-model="form.identifier" 
        placeholder="请输入用户名或手机号"
        prefix-icon="User"
      />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input 
        v-model="form.password" 
        type="password" 
        placeholder="请输入密码"
        prefix-icon="Lock"
        @keyup.enter="submitLogin"
      />
    </el-form-item>
    <el-form-item>
      <el-button 
        type="primary" 
        @click="submitLogin" 
        :loading="loading" 
        style="width: 100%"
      >
        登录
      </el-button>
    </el-form-item>
    <el-form-item>
      <el-link type="primary" @click="$emit('switch-to-register')" :underline="false">
        还没有账户？立即注册
      </el-link>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { authService } from '@/services/authService'

// 定义 emits
const emit = defineEmits(['login-success', 'switch-to-register'])

// 表单数据
const form = reactive({
  identifier: '', // 使用后端期望的字段名
  password: ''
})

// 验证规则
const rules = {
  identifier: [
    { required: true, message: '请输入用户名或手机号', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在3-50个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在6-100个字符之间', trigger: 'blur' }
  ]
}

// 状态
const loading = ref(false)
const loginFormRef = ref(null)

// 提交登录
const submitLogin = async () => {
  if (!loginFormRef.value) return
  
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const result = await authService.login(form.identifier, form.password)
    
    if (result.success) {
      emit('login-success', result.userInfo)
      ElMessage.success('登录成功')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>