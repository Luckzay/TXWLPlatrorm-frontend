<template>
  <el-form :model="form" :rules="rules" ref="registerFormRef" label-width="80px">
    <el-form-item label="手机号" prop="phone">
      <el-input 
        v-model="form.phone" 
        placeholder="请输入手机号"
        prefix-icon="Phone"
      />
    </el-form-item>
    <el-form-item label="真实姓名" prop="realname">
      <el-input 
        v-model="form.realname" 
        placeholder="请输入真实姓名"
        prefix-icon="User"
      />
    </el-form-item>
    <el-form-item label="身份" prop="identity">
      <el-select 
        v-model="form.identity" 
        placeholder="请选择身份"
        style="width: 100%"
      >
        <el-option label="学生" value="STUDENT" />
        <el-option label="妈妈" value="MATHER" />
        <el-option label="爸爸" value="FATHER" />
      </el-select>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input 
        v-model="form.password" 
        type="password" 
        placeholder="请输入密码"
        prefix-icon="Lock"
      />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input 
        v-model="form.confirmPassword" 
        type="password" 
        placeholder="请再次输入密码"
        prefix-icon="Lock"
        @keyup.enter="submitRegister"
      />
    </el-form-item>
    <el-form-item>
      <el-button 
        type="success" 
        @click="submitRegister" 
        :loading="loading" 
        style="width: 100%"
      >
        注册
      </el-button>
    </el-form-item>
    <el-form-item>
      <el-link type="primary" @click="$emit('switch-to-login')" :underline="false">
        已有账户？立即登录
      </el-link>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { authService } from '@/services/authService'

// 定义 emits
const emit = defineEmits(['register-success', 'switch-to-login'])

// 表单数据
const form = reactive({
  phone: '',
  realname: '',
  identity: '',
  password: '',
  confirmPassword: ''
})

// 验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  realname: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { max: 50, message: '真实姓名长度不能超过50个字符', trigger: 'blur' }
  ],
  identity: [
    { required: true, message: '请选择身份', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在6-100个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 状态
const loading = ref(false)
const registerFormRef = ref(null)

// 提交注册
const submitRegister = async () => {
  if (!registerFormRef.value) return
  
  const valid = await registerFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const result = await authService.register(
      form.phone,
      form.realname,
      form.identity,
      form.password
    )

    if (result.success) {
      ElMessage.success(result.message || '注册成功')
      emit('register-success')
    } else {
      ElMessage.error(result.message || '注册失败')
    }
  } catch (error) {
    console.error('Registration error:', error)
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>