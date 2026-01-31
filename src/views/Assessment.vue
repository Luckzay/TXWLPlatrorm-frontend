<template>
  <div class="assessment-page">
    <el-page-header @back="goHome" content="问卷答题" class="page-header" />
    
    <el-card class="assessment-container" shadow="never">
      <template #header>
        <div class="assessment-header">
          <h2>{{ assessmentTitle }}</h2>
          <div class="assessment-info">
            <span>题目总数: {{ totalQuestions }}</span>
            <span>当前: {{ currentPage }}/{{ totalPages }} 页</span>
          </div>
        </div>
      </template>
      
      <div class="questions-container">
        <div 
          v-for="(question, index) in currentQuestions" 
          :key="question.id"
          class="question-item"
        >
          <el-card shadow="hover" class="question-card">
            <h3 class="question-text">{{ getQuestionNumber(index) }}. {{ question.question_text }}</h3>
            
            <!-- 单选题 -->
            <el-radio-group 
              v-if="question.q_type === 'SINGLE'" 
              v-model="answers[question.id]"
              @change="onAnswerChange(question.id, $event)"
            >
              <el-radio 
                v-for="option in question.options" 
                :key="option.id" 
                :label="option.content"
              >
                {{ option.content }}
              </el-radio>
            </el-radio-group>
            
            <!-- 多选题 -->
            <el-checkbox-group 
              v-else-if="question.q_type === 'MULTI'" 
              v-model="answers[question.id]"
              @change="onAnswerChange(question.id, $event)"
            >
              <el-checkbox 
                v-for="option in question.options" 
                :key="option.id" 
                :label="option.content"
              >
                {{ option.content }}
              </el-checkbox>
            </el-checkbox-group>
            
            <!-- 填空题 -->
            <el-input 
              v-else-if="question.q_type === 'BLANK'" 
              v-model="answers[question.id]"
              placeholder="请输入答案"
              @input="onAnswerChange(question.id, $event)"
            />
            
            <!-- 问答题 -->
            <el-input 
              v-else-if="question.q_type === 'TEXT'" 
              v-model="answers[question.id]"
              type="textarea"
              :rows="4"
              placeholder="请输入您的回答"
              @input="onAnswerChange(question.id, $event)"
            />
            
            <!-- 评分题 -->
            <el-rate 
              v-else-if="question.q_type === 'SCORE'" 
              v-model="answers[question.id]"
              @change="onAnswerChange(question.id, $event)"
            />
            
            <!-- 文件上传题 -->
            <el-upload
              v-else-if="question.q_type === 'FILE'"
              :file-list="getFileList(question.id)"
              :on-change="(file, fileList) => onFileChange(question.id, file, fileList)"
              :on-remove="(file, fileList) => onFileRemove(question.id, file, fileList)"
              :auto-upload="false"
              drag
            >
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或<em>点击上传</em>
              </div>
            </el-upload>
            
            <!-- 排序题 -->
            <div v-else-if="question.q_type === 'SORT'" class="sort-options">
              <draggable
                v-model="question.options"
                item-key="id"
                @change="onSortChange(question.id, question.options)"
                ghost-class="sortable-ghost"
                chosen-class="sortable-chosen"
                drag-class="sortable-drag"
              >
                <template #item="{ element }">
                  <div class="sort-item">
                    <el-tag type="info" class="sort-rank">{{ getOptionRank(element, question.options) }}.</el-tag>
                    <el-card class="sort-option" shadow="hover">
                      <span>{{ element.content }}</span>
                    </el-card>
                  </div>
                </template>
              </draggable>
              <p class="sort-instruction">拖拽选项以重新排序</p>
            </div>
          </el-card>
        </div>
      </div>
      
      <div class="action-buttons">
        <el-button @click="prevPage" :disabled="currentPage === 1" size="large">
          上一页
        </el-button>
        <el-button 
          @click="nextPage" 
          :disabled="!canGoNext()" 
          size="large"
          type="primary"
        >
          下一页
        </el-button>
        <el-button 
          v-if="currentPage === totalPages" 
          @click="submitAssessment" 
          :loading="submitting" 
          size="large"
          type="success"
        >
          提交问卷
        </el-button>
      </div>
    </el-card>
    

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import { Upload } from '@element-plus/icons-vue'
import { authService } from '@/services/authService'
import {useGlobalUser} from "@/composables/useGlobalUser";
import draggable from 'vuedraggable';

const router = useRouter()
const route = useRoute()

// 数据
const assessmentTitle = ref('问卷标题')
const allQuestions = ref([]) // 存储所有已获取的题目
const questionsByPage = ref({}) // 按页缓存题目
const answers = ref({})
const currentPage = ref(1)
const pageSize = ref(5) // 每页显示5道题
const totalQuestions = ref(0) // 总题目数
const totalPages = ref(0) // 总页数
const submitting = ref(false)
const fileLists = ref({}) // 存储文件上传列表

// 计算属性
const currentQuestions = computed(() => {
  const pageData = questionsByPage.value[currentPage.value]
  return pageData ? pageData.questions : []
})

// 页面加载时获取第一页题目
onMounted(async () => {
  // 检查用户是否已登录
  if (!useGlobalUser.isAuthenticated.value) {
    ElMessage.warning('请先登录')
    router.push('/')
    return
  }
  
  const paperId = route.params.paperId
  console.info('paperId',paperId)
  if (!paperId) {
    ElMessage.error('未指定问卷')
    router.push('/')
    return
  }

  await fetchQuestionsForPage(paperId, 1)
})

// 获取指定页面的题目
const fetchQuestionsForPage = async (paperId, pageNum) => {
  if (questionsByPage.value[pageNum]) {
    // 如果页面数据已存在，直接使用缓存
    return
  }

  try {
    const response = await api.get(`/questionnaire/paper/${paperId}/questions/page`, {
      params: {
        pageNum: pageNum,
        pageSize: pageSize.value
      }
    })

    if (response.data.questions && response.data.questions.length > 0) {
      // 转换后端返回的数据结构为前端需要的格式
      const questions = response.data.questions.map(item => {
        const q = item.question;
        return {
          id: q.id,
          question_text: q.questionText,
          paperId: q.paperId,
          q_type: q.qtype,
          options: item.answers || []
        };
      });

      // 保存页面数据
      questionsByPage.value[pageNum] = {
        questions: questions
      };
      
      // 将问题添加到所有问题列表中（去重）
      questions.forEach(question => {
        if (!allQuestions.value.some(q => q.id === question.id)) {
          allQuestions.value.push(question);
        }
      });

      // 第一页加载时设置总题目数和总页数
      if (pageNum === 1) {
        totalQuestions.value = response.data.totalQuestions || 0;
        totalPages.value = response.data.totalPages || 1;
        assessmentTitle.value = `问卷 - ${paperId}`;
      }

      // 初始化答案对象
      questions.forEach(question => {
        if (question.q_type === 'MULTI') {
          if (!(question.id in answers.value)) {
            answers.value[question.id] = [];
          }
        } else if (question.q_type === 'SCORE') {
          if (!(question.id in answers.value)) {
            answers.value[question.id] = 0;
          }
        } else if (question.q_type === 'SORT') {
          if (!(question.id in answers.value)) {
            // 对于排序题，初始答案为选项的原始顺序，使用选项内容而非ID
            answers.value[question.id] = question.options.map(option => option.content);
          }
        } else {
          if (!(question.id in answers.value)) {
            answers.value[question.id] = '';
          }
        }
      });
    } else {
      ElMessage.error('未找到问卷题目')
      router.push('/')
    }
  } catch (error) {
    console.error('获取问卷题目失败:', error)
    
    // 区分错误类型
    if (error.response) {
      // 服务器返回了错误响应
      if (error.response.status === 401 || error.response.status === 403) {
        // 无权限访问
        ElMessage.error('您没有权限访问此问卷或登录已过期')
        router.push('/psychological-assessment') // 返回首页登录
      } else if (error.response.status === 404) {
        // 问卷不存在
        ElMessage.error('问卷不存在')
        router.push('/psychological-assessment')
      } else {
        // 其他服务器错误
        ElMessage.error(`获取问卷题目失败: ${error.response.data.message || '服务器错误'}`)
        router.push('/psychological-assessment')
      }
    } else {
      // 网络错误或其他客户端错误
      ElMessage.error('网络连接异常，无法获取问卷题目')
      router.push('/psychological-assessment')
    }
  }
}

// 获取题目在整个问卷中的序号
const getQuestionNumber = (indexInPage) => {
  return (currentPage.value - 1) * pageSize.value + indexInPage + 1;
}

// 答案变化处理
const onAnswerChange = (questionId, value) => {
  answers.value[questionId] = value
}

// 排序题变化处理
const onSortChange = (questionId, options) => {
  // 更新答案为排序后的选项内容数组
  answers.value[questionId] = options.map(option => option.content);
}

// 获取选项排序名次
const getOptionRank = (option, options) => {
  return options.findIndex(opt => opt.content === option.content) + 1;
}

// 文件上传处理
const getFileList = (questionId) => {
  return fileLists.value[questionId] || []
}

const onFileChange = (questionId, file, fileList) => {
  fileLists.value[questionId] = fileList
  // 对于文件上传题，我们可能需要特殊处理
  answers.value[questionId] = fileList.map(f => f.name).join(',')
}

const onFileRemove = (questionId, file, fileList) => {
  fileLists.value[questionId] = fileList
  answers.value[questionId] = fileList.map(f => f.name).join(',')
}

// 检查当前页是否已完成
const isCurrentPageCompleted = () => {
  const pageQuestions = currentQuestions.value;
  for (const question of pageQuestions) {
    const answer = answers.value[question.id];
    if (question.q_type === 'MULTI') {
      if (!answer || answer.length === 0) {
        return false;
      }
    } else if (question.q_type === 'SCORE') {
      if (!answer || answer === 0) {
        return false;
      }
    } else if (question.q_type === 'SORT') {
      if (!answer || answer.length === 0) {
        return false;
      }
    } else {
      if (!answer || answer === '') {
        return false;
      }
    }
  }
  return true;
};

// 是否可以进入下一页
const canGoNext = () => {
  if (currentPage.value >= totalPages.value) {
    return true; // 最后一页时始终允许提交
  }
  return isCurrentPageCompleted();
};

// 分页控制
const prevPage = async () => {
  if (currentPage.value > 1) {
    const prevPageNum = currentPage.value - 1;
    await fetchQuestionsForPage(route.params.paperId, prevPageNum);
    currentPage.value = prevPageNum;
  }
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    if (!canGoNext()) {
      ElMessage.warning('请完成当前页所有题目后再进入下一页');
      return;
    }
    
    const nextPageNum = currentPage.value + 1;
    await fetchQuestionsForPage(route.params.paperId, nextPageNum);
    currentPage.value = nextPageNum;
  }
}

// 提交问卷
const submitAssessment = async () => {
  // 确保所有排序题的答案都是内容数组，不是ID数组
  allQuestions.value.forEach(q => {
    if (q.q_type === 'SORT') {
      if (!answers.value[q.id] || answers.value[q.id].length === 0) {
        // 如果排序题没有答案，使用原始顺序作为默认答案，保存选项内容而非ID
        answers.value[q.id] = q.options ? q.options.map(option => option.content) : [];
      } else if (typeof answers.value[q.id][0] === 'number') {
        // 如果答案是ID数组，转换为内容数组
        answers.value[q.id] = q.options ? q.options.map(option => option.content) : [];
      }
    }
  });
  
  const unanswered = allQuestions.value.filter(q => {
    const answer = answers.value[q.id]
    if (q.q_type === 'MULTI') {
      return !answer || answer.length === 0
    }
    if (q.q_type === 'SORT') {
      return !answer || answer.length === 0
    }
    return !answer || answer === '' || (typeof answer === 'number' && answer === 0)
  })

  if (unanswered.length > 0) {
    ElMessage.warning(`还有 ${unanswered.length} 道题目未回答`)
    return
  }
  submitting.value = true
  try {
    // 获取用户ID
    const userInfo = authService.getCurrentUserFromToken()
    let userId = userInfo.userUid
    
    // 如果从token中获取不到userUid，尝试从本地存储获取
    if (!userId) {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        const storedUserInfo = JSON.parse(userInfoStr)
        userId = storedUserInfo.userUid
      }
    }
    console.info('用户ID:', userId, parseInt(route.params.paperId), answers.value)

    // 异步提交，不等待响应，不关心成功或失败
    api.post('/questionnaire/submit', {
      userId: userId || 1, // 如果无法获取用户ID，使用默认值
      paperId: parseInt(route.params.paperId),
      answers: answers.value
    }).catch(error => {
      // 即使提交失败也忽略错误，因为用户已经收到了成功提示
      ElMessage.error('问卷提交失败:', error);
    });
  } finally {
    submitting.value = false
    ElMessage.info('报告正在生成中，预计30~60秒，请在首页-测评报告中查看')
    resetForm();
    router.push('/')
  }
}

// 重置表单
const resetForm = () => {
  answers.value = {}
  currentPage.value = 1
  questionsByPage.value = {}
  totalQuestions.value = 0
  totalPages.value = 0
  assessmentTitle.value = '问卷标题'
}

// 导航方法
const goHome = () => {
  router.push('/')
}

const goToReports = () => {
  router.push('/reports')
}
</script>

<style scoped>
.assessment-page {
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
  justify-content: space-between;
  align-items: center;
}

.assessment-header h2 {
  margin: 0;
  color: #2c3e50;
}

.assessment-info {
  display: flex;
  gap: 20px;
  color: #7f8c8d;
}

.questions-container {
  margin: 20px 0;
}

.question-item {
  margin-bottom: 20px;
}

.question-card {
  padding: 20px;
}

.question-text {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-weight: 500;
}

.action-buttons {
  margin-top: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.result-success, .result-error {
  text-align: center;
}
</style>