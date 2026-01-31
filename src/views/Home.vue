<template>
  <div class="home-page">
    <!-- Hero Section -->
    <el-row :gutter="20" class="hero-section">
      <el-col :span="24">
        <div class="hero-content">
          <h1 class="hero-title">同行未来新高考生涯规划平台</h1>
          <p class="hero-subtitle">专业的生涯规划与心理测评系统，助力学生科学决策未来方向</p>
        </div>
      </el-col>
    </el-row>

    <!-- Business Features -->
    <el-row :gutter="20" class="business-features">
      <el-col :span="8">
        <el-card class="feature-card" shadow="hover" @click="goToAssessmentSection">
          <div class="feature-icon">
            <el-icon size="48"><DocumentChecked /></el-icon>
          </div>
          <h3 class="feature-title">专业测评</h3>
          <p class="feature-desc">基于心理学理论的科学测评体系，多维度评估个人特质和发展潜力</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="feature-card" shadow="hover" @click="goToReportsSection">
          <div class="feature-icon">
            <el-icon size="48"><TrendCharts /></el-icon>
          </div>
          <h3 class="feature-title">测评报告</h3>
          <p class="feature-desc">查看您的测评结果与个性化分析报告</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="feature-card" shadow="hover" @click="goToAssessmentSection">
          <div class="feature-icon">
            <el-icon size="48"><Management /></el-icon>
          </div>
          <h3 class="feature-title">生涯规划</h3>
          <p class="feature-desc">结合个人特质与职业市场趋势，制定个性化的职业发展路径</p>
        </el-card>
      </el-col>
    </el-row>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentChecked, TrendCharts, Management, Clock } from '@element-plus/icons-vue'
import api from '@/utils/api'
import { authService } from '@/services/authService'
import {useGlobalUser} from "@/composables/useGlobalUser";

const router = useRouter()

// 页面加载时不获取问卷数据
onMounted(async () => {
  // 主页只显示业务介绍，不加载问卷数据
})

// 跳转到心理测评页面
const goToAssessmentSection = () => {
  // 跳转到心理测评页面
  router.push('/psychological-assessment')
}

// 跳转到报告页面
const goToReportsSection = () => {
  // 检查用户是否已登录
  if (!useGlobalUser.isAuthenticated.value) {
    ElMessage.warning('请先登录')
    router.push('/')
    return
  }
  // 跳转到报告页面
  router.push('/reports')
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 140px);
}

.hero-section {
  margin-bottom: 40px;
  text-align: center;
}

.hero-content {
  padding: 40px 20px;
}

.hero-title {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 15px;
  background: linear-gradient(45deg, #409EFF, #667eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 0;
  line-height: 1.6;
}

.business-features {
  margin-bottom: 40px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  margin-bottom: 20px;
  color: #409EFF;
}

.feature-title {
  margin: 15px 0 10px 0;
  color: #2c3e50;
  font-size: 20px;
}

.feature-desc {
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.6;
}

</style>