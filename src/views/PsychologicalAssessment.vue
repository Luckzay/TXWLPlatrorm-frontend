<template>
  <div class="psychological-assessment-page">
    <el-page-header @back="goHome" content="心理测评" class="page-header" />
    
    <el-card class="assessment-container" shadow="never">
      <template #header>
        <div class="assessment-header">
          <h2>心理测评</h2>
          <p class="assessment-subtitle">了解您的性格特质、兴趣爱好及潜在能力</p>
        </div>
      </template>
      
      <div v-loading="loading" class="assessment-grid">
        <el-card 
          v-for="paper in papers" 
          :key="paper.id"
          class="paper-card"
          shadow="hover"
          @click="startAssessment(paper)"
        >
          <div class="paper-info">
            <h3 class="paper-title">{{ paper.paperName }}</h3>
            <el-tag 
              :type="getPaperTypeTag(paper.paperType)" 
              size="small"
              class="paper-type"
            >
              {{ getPaperTypeName(paper.paperType) }}
            </el-tag>
          </div>
          <p class="paper-description">了解您的性格特质、兴趣爱好及潜在能力</p>
          <div class="paper-meta">
            <el-icon><Clock /></el-icon>
            <span>预计用时: 10-15分钟</span>
          </div>
        </el-card>
      </div>
      
      <!-- Pagination -->
      <div class="pagination-wrapper" v-if="totalPages > 1">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          layout="prev, pager, next"
          @current-change="handlePageChange"
          small
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import api from '@/utils/api'
import { authService } from '@/services/authService'

const router = useRouter()

// 分页数据
const papers = ref([])
const currentPage = ref(1)
const pageSize = ref(6) // 每页显示6个问卷卡片
const totalItems = ref(0)
const totalPages = ref(0)
const loading = ref(false)

// 页面加载时获取第一页问卷数据
onMounted(async () => {
  await fetchPapers(currentPage.value)
})

// 获取问卷列表（分页）
const fetchPapers = async (page = 1) => {
  try {
    loading.value = true
    
    // 调用分页接口获取问卷列表
    const response = await api.get(`/papers/page?page=${page}&size=${pageSize.value}`)
    
    if (response.data && response.data.records) {
      papers.value = response.data.records
      totalItems.value = response.data.total
      totalPages.value = response.data.pages
    } else {
      // 如果后端没有分页接口，使用原来的接口
      const fallbackResponse = await api.get('/papers')
      papers.value = fallbackResponse.data || []
      totalItems.value = papers.value.length
      totalPages.value = Math.ceil(totalItems.value / pageSize.value)
      
      // 手动分页
      const startIndex = (page - 1) * pageSize.value
      papers.value = papers.value.slice(startIndex, startIndex + pageSize.value)
    }
  } catch (error) {
    console.error('获取问卷列表失败:', error)
    
    // 尝试使用备用接口
    try {
      const fallbackResponse = await api.get('/papers')
      papers.value = fallbackResponse.data || []
      totalItems.value = papers.value.length
      totalPages.value = Math.ceil(totalItems.value / pageSize.value)
      
      // 手动分页
      const startIndex = (page - 1) * pageSize.value
      papers.value = papers.value.slice(startIndex, startIndex + pageSize.value)
    } catch (fallbackError) {
      console.error('备用获取问卷列表失败:', fallbackError)
      papers.value = []
      ElMessage.error('获取问卷列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = async (page) => {
  await fetchPapers(page)
  // 滚动到问卷区域顶部
  document.querySelector('.assessment-container').scrollIntoView({ behavior: 'smooth' })
}

// 获取问卷类型标签
const getPaperTypeTag = (type) => {
  switch (type) {
    case 1: return 'info'
    case 2: return 'success'
    case 3: return 'warning'
    default: return 'info'
  }
}

// 获取问卷类型名称
const getPaperTypeName = (type) => {
  const types = { 1: '普通', 2: '测评', 3: '360评估' }
  return types[type] || '未知'
}

// 开始测评
const startAssessment = async (paper) => {
  // 检查用户是否已登录
  if (!authService.isAuthenticated()) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 如果已登录，跳转到测评页面
  router.push(`/assessment/${paper.id}`)
}

// 返回首页
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.psychological-assessment-page {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 140px);
}

.page-header {
  margin-bottom: 20px;
}

.assessment-container {
  background: rgba(255, 255, 255, 0.95);
}

.assessment-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.assessment-header h2 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.assessment-subtitle {
  margin: 0;
  color: #7f8c8d;
  text-align: center;
}

.assessment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.paper-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.paper-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.paper-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.paper-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  flex: 1;
}

.paper-type {
  margin-top: 3px;
}

.paper-description {
  margin: 0 0 15px 0;
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

.paper-meta {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
}

.paper-meta .el-icon {
  margin-right: 5px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>