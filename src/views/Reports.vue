<template>
  <div class="reports-page">
    <el-page-header @back="goHome" content="我的报告" class="page-header" />
    
    <el-card class="reports-container" shadow="never">
      <template #header>
        <div class="reports-header">
          <h2>我的测评报告</h2>
          <el-button type="primary" @click="refreshReports">刷新</el-button>
        </div>
      </template>
      
      <div v-if="reports.length === 0" class="empty-reports">
        <el-empty description="暂无报告" />
      </div>
      
      <div v-else class="reports-grid">
        <el-card 
          v-for="report in reports" 
          :key="report.id"
          shadow="hover"
          class="report-card"
        >
          <template #header>
            <div class="report-header">
              <span class="report-title">{{ getPaperName(report.paperId) }}</span>
              <el-tag type="success" size="small">已完成</el-tag>
            </div>
          </template>
          
          <div class="report-content">
            <p class="report-desc">完成时间: {{ formatDate(report.createTime) }}</p>
            <p class="report-desc">报告ID: {{ report.id }}</p>
          </div>
          
          <div class="report-actions">
            <el-button 
              type="primary" 
              size="small"
              @click="viewReport(report)"
            >
              查看报告
            </el-button>
<!--            <el-button -->
<!--              type="info" -->
<!--              size="small"-->
<!--              @click="downloadReport(report)"-->
<!--            >-->
<!--              下载报告-->
<!--            </el-button>-->
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 报告预览对话框 -->
    <el-dialog v-model="showReportDialog" title="报告预览" width="80%" top="5vh">
      <div v-if="selectedReport" class="report-preview">
        <iframe 
          :src="reportPreviewUrl"
          width="100%" 
          height="600px"
          frameborder="0"
          @load="onReportLoad"
        ></iframe>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeReportDialog">关闭</el-button>
<!--          <el-button type="primary" @click="downloadReport(selectedReport)">下载</el-button>-->
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import { authService } from '@/services/authService'
import {useGlobalUser} from "@/composables/useGlobalUser";

const router = useRouter()

// 数据
const reports = ref([])
const papers = ref([])
const showReportDialog = ref(false)
const selectedReport = ref(null)
const reportPreviewUrl = ref('')

// 页面加载时获取报告列表
onMounted(async () => {
  // 检查用户是否已登录
  if (!useGlobalUser.isAuthenticated.value) {
    ElMessage.warning('请先登录')
    router.push('/')
    return
  }
  
  await fetchReports()
  await fetchPapers()
})

// 获取报告列表
const fetchReports = async () => {
  try {
    // 获取用户ID
    const userInfo = authService.getCurrentUserFromToken()
    let userId = userInfo.userUid

    if (!userId) {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        const storedUserInfo = JSON.parse(userInfoStr)
        userId = storedUserInfo.userUid
      }
    }

    // 使用正确的API端点
    const response = await api.get(`/reports/user/${userId}`)
    reports.value = response.data || []
  } catch (error) {
    console.error('获取报告列表失败:', error)
    ElMessage.error('获取报告列表失败')
  }
}

// 获取试卷列表
const fetchPapers = async () => {
  try {
    // 使用正确的API端点
    const response = await api.get('/papers') 
    papers.value = response.data || []
  } catch (error) {
    console.error('获取试卷列表失败:', error)
  }
}

// 获取试卷名称
const getPaperName = (paperId) => {
  const paper = papers.value.find(p => p.id === paperId)
  return paper ? paper.paperName : `试卷${paperId}`
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 构建完整报告URL
const getFullReportUrl = (reportPath) => {
  if (!reportPath) return ''
  
  // 如果已经是完整URL，则直接返回
  if (reportPath.startsWith('http://') || reportPath.startsWith('https://')) {
    return reportPath
  }
  
  // 如果是相对路径，则构建完整URL
  // 假设报告文件通过 /reports/{fileName} 访问
  const fileName = reportPath.split('/').pop() || reportPath
  return `${api.defaults.baseURL.replace('/api', '')}/reports/${fileName}`
}

// 加载报告内容
const loadReportContent = async (report) => {
  try {
    const fullUrl = getFullReportUrl(report.url)
    
    // 使用fetch获取报告内容，确保包含认证信息
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`无法加载报告: ${response.status} ${response.statusText}`)
    }
    
    const htmlContent = await response.text()
    
    // 创建Blob对象
    const blob = new Blob([htmlContent], { type: 'text/html' })
    
    // 创建临时URL
    reportPreviewUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('加载报告内容失败:', error)
    // 如果内容加载失败，抛出错误以终止后续流程
    throw new Error('报告内容加载失败')
  }
}

// 查看报告
const viewReport = async (report) => {
  try {
    // 首先获取报告详情，确认报告存在
    const response = await api.get(`/reports/${report.id}`)

    if (response.status !== 200 || !response.data) {
      ElMessage.error('报告不存在或无法访问')
      return
    }
    
    // 获取报告内容并创建预览URL
    selectedReport.value = report
    
    try {
      await loadReportContent(report)
    } catch (contentError) {
      console.error('加载报告内容失败:', contentError)
      ElMessage.error('报告内容加载失败')
      return
    }
    
    // 只有在所有数据准备就绪后才显示对话框
    showReportDialog.value = true
  } catch (error) {
    console.error('查看报告失败:', error)
    ElMessage.error('报告不存在或无法访问')
  }
}

// 下载报告
const downloadReport = (report) => {
  if (report.url) {
    // 使用完整URL
    const fullUrl = getFullReportUrl(report.url)
    // 创建一个隐藏的链接来触发下载
    const link = document.createElement('a')
    link.href = fullUrl
    link.download = `report_${report.id}.html` // 修改扩展名为HTML
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    ElMessage.error('报告地址无效')
  }
}

// 报告加载完成
const onReportLoad = () => {
  console.log('报告加载完成')
}

// 关闭报告对话框
const closeReportDialog = () => {
  showReportDialog.value = false
  selectedReport.value = null
  
  // 释放临时URL以避免内存泄漏
  if (reportPreviewUrl.value) {
    URL.revokeObjectURL(reportPreviewUrl.value)
    reportPreviewUrl.value = ''
  }
}

// 刷新报告
const refreshReports = () => {
  fetchReports()
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 组件卸载前清理临时URL
onUnmounted(() => {
  if (reportPreviewUrl.value) {
    URL.revokeObjectURL(reportPreviewUrl.value)
    reportPreviewUrl.value = ''
  }
})
</script>

<style scoped>
.reports-page {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 140px);
}

.page-header {
  margin-bottom: 20px;
}

.reports-container {
  background: rgba(255, 255, 255, 0.95);
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reports-header h2 {
  margin: 0;
  color: #2c3e50;
}

.empty-reports {
  text-align: center;
  padding: 60px 0;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.report-card {
  transition: transform 0.3s ease;
}

.report-card:hover {
  transform: translateY(-5px);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-title {
  font-weight: bold;
  color: #2c3e50;
}

.report-content {
  margin: 15px 0;
}

.report-desc {
  margin: 5px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.report-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.report-preview {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}
</style>