<template>
  <div class="paper-management">
    <!-- 问卷列表页面 -->
    <div v-if="!currentPaper" class="paper-list">
      <div class="header">
        <h2>问卷管理</h2>
        <el-button type="primary" @click="showCreatePaperDialog = true">新增问卷</el-button>
      </div>

      <!-- 问卷列表 -->
      <el-table :data="papers" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="paperName" label="问卷名称"></el-table-column>
        <el-table-column prop="paperType" label="类型" width="100">
          <template #default="{ row }">
            {{ getPaperTypeName(row.paperType) }}
          </template>
        </el-table-column>
        <el-table-column prop="accessRoleIds" label="可访问角色">
          <template #default="{ row }">
            {{ getRoleNames(JSON.parse(row.accessRoleIds)) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="viewPaper(row)">查看</el-button>
            <el-button size="small" type="primary" @click="editPaper(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deletePaper(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        class="pagination"
      />
    </div>

    <!-- 问卷详情页面 -->
    <div v-else class="paper-detail">
      <el-button @click="backToList" icon="ArrowLeft" class="back-btn">返回列表</el-button>
      <el-button @click="goHome" icon="House" class="back-btn">返回主页</el-button>
      
      <!-- 问卷基本信息 -->
      <el-card class="paper-info-card">
        <template #header>
          <div class="card-header">
            <span>问卷信息</span>
            <el-button type="primary" @click="showEditPaperInfoDialog = true">编辑问卷信息</el-button>
          </div>
        </template>
        
        <div class="paper-info">
          <div class="info-item">
            <label>ID:</label>
            <span>{{ currentPaper.id }}</span>
          </div>
          <div class="info-item">
            <label>问卷名称:</label>
            <span>{{ currentPaper.paperName }}</span>
          </div>
          <div class="info-item">
            <label>问卷类型:</label>
            <span>{{ getPaperTypeName(currentPaper.paperType) }}</span>
          </div>
          <div class="info-item">
            <label>可访问角色:</label>
            <span>{{ getRoleNames(JSON.parse(currentPaper.accessRoleIds)) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 题目列表 -->
      <el-card class="questions-card">
        <template #header>
          <div class="card-header">
            <span>题目管理</span>
            <el-button type="primary" @click="showAddQuestionDialog = true">添加题目</el-button>
          </div>
        </template>
        
        <el-table :data="questions" style="width: 100%" v-loading="questionsLoading">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="questionText" label="题目内容" show-overflow-tooltip></el-table-column>
          <el-table-column prop="qType" label="题型" width="100">
            <template #default="{ row }">
              {{ getQuestionTypeName(row.qtype) }}
            </template>
          </el-table-column>
          <el-table-column label="选项/答案" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="openOptionsModal(row)">管理选项</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <el-button size="small" @click="editQuestion(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteQuestion(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 题目分页 -->
        <el-pagination
          v-model:current-page="currentQuestionPage"
          v-model:page-size="currentQuestionPageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalQuestions"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleQuestionPageChange"
          @size-change="handleQuestionSizeChange"
          class="pagination"
        />
      </el-card>
    </div>

    <!-- 新建问卷对话框 -->
    <el-dialog v-model="showCreatePaperDialog" title="新建问卷" width="500px">
      <el-form :model="newPaperForm" :rules="paperFormRules" ref="newPaperFormRef">
        <el-form-item label="问卷名称" prop="paperName">
          <el-input v-model="newPaperForm.paperName" placeholder="请输入问卷名称"></el-input>
        </el-form-item>
        <el-form-item label="问卷类型" prop="paperType">
          <el-select v-model="newPaperForm.paperType" placeholder="请选择问卷类型">
            <el-option label="普通" :value="1"></el-option>
            <el-option label="测评" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="可访问角色" prop="accessRoleIds">
          <el-checkbox-group v-model="newPaperForm.selectedRoles">
            <el-checkbox label="3" value="3">妈妈</el-checkbox>
            <el-checkbox label="4" value="4">爸爸</el-checkbox>
            <el-checkbox label="5" value="5">学生</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreatePaperDialog = false">取消</el-button>
          <el-button type="primary" @click="createPaper">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑问卷对话框 -->
    <el-dialog v-model="showEditPaperDialog" title="编辑问卷" width="500px">
      <el-form :model="editPaperForm" :rules="paperFormRules" ref="editPaperFormRef">
        <el-form-item label="问卷名称" prop="paperName">
          <el-input v-model="editPaperForm.paperName" placeholder="请输入问卷名称"></el-input>
        </el-form-item>
        <el-form-item label="问卷类型" prop="paperType">
          <el-select v-model="editPaperForm.paperType" placeholder="请选择问卷类型">
            <el-option label="普通" :value="1"></el-option>
            <el-option label="测评" :value="2"></el-option>
            <el-option label="360评估" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="可访问角色" prop="accessRoleIds">
          <el-checkbox-group v-model="editPaperForm.selectedRoles">
            <el-checkbox label="3" value="3">妈妈</el-checkbox>
            <el-checkbox label="4" value="4">爸爸</el-checkbox>
            <el-checkbox label="5" value="5">学生</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditPaperDialog = false">取消</el-button>
          <el-button type="primary" @click="updatePaper">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑问卷信息对话框 -->
    <el-dialog v-model="showEditPaperInfoDialog" title="编辑问卷信息" width="500px">
      <el-form :model="editPaperInfoForm" :rules="paperFormRules" ref="editPaperInfoFormRef">
        <el-form-item label="问卷名称" prop="paperName">
          <el-input v-model="editPaperInfoForm.paperName" placeholder="请输入问卷名称"></el-input>
        </el-form-item>
        <el-form-item label="问卷类型" prop="paperType">
          <el-select v-model="editPaperInfoForm.paperType" placeholder="请选择问卷类型">
            <el-option label="普通" :value="1"></el-option>
            <el-option label="测评" :value="2"></el-option>
            <el-option label="360评估" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="可访问角色" prop="accessRoleIds">
          <el-checkbox-group v-model="editPaperInfoForm.selectedRoles">
            <el-checkbox label="3" value="3">妈妈</el-checkbox>
            <el-checkbox label="4" value="4">爸爸</el-checkbox>
            <el-checkbox label="5" value="5">学生</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditPaperInfoDialog = false">取消</el-button>
          <el-button type="primary" @click="updatePaperInfo">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加题目对话框 -->
    <el-dialog v-model="showAddQuestionDialog" title="添加题目" width="600px">
      <el-form :model="newQuestionForm" :rules="questionFormRules" ref="newQuestionFormRef">
        <el-form-item label="题目内容" prop="questionText">
          <el-input 
            v-model="newQuestionForm.questionText" 
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="题型" prop="qType">
          <el-select v-model="newQuestionForm.qType" placeholder="请选择题型">
            <el-option label="单选题" value="SINGLE"></el-option>
            <el-option label="多选题" value="MULTI"></el-option>
            <el-option label="填空题" value="BLANK"></el-option>
            <el-option label="排序题" value="SORT"></el-option>
            <el-option label="评分题" value="SCORE"></el-option>
            <el-option label="文件题" value="FILE"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddQuestionDialog = false">取消</el-button>
          <el-button type="primary" @click="addQuestion">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑题目对话框 -->
    <el-dialog v-model="showEditQuestionDialog" title="编辑题目" width="600px">
      <el-form :model="editQuestionForm" :rules="questionFormRules" ref="editQuestionFormRef">
        <el-form-item label="题目内容" prop="questionText">
          <el-input 
            v-model="editQuestionForm.questionText" 
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="题型" prop="qType">
          <el-select v-model="editQuestionForm.qType" placeholder="请选择题型">
            <el-option label="单选题" value="SINGLE"></el-option>
            <el-option label="多选题" value="MULTI"></el-option>
            <el-option label="填空题" value="BLANK"></el-option>
            <el-option label="排序题" value="SORT"></el-option>
            <el-option label="评分题" value="SCORE"></el-option>
            <el-option label="文件题" value="FILE"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditQuestionDialog = false">取消</el-button>
          <el-button type="primary" @click="saveQuestion">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 选项管理对话框 -->
    <el-dialog v-model="showOptionsModal" :title="`管理选项 - ${currentQuestion?.questionText || ''}`" width="800px">
      <div class="options-modal-content">
        <el-button type="success" @click="openAddOptionDialog" class="add-option-btn">添加选项</el-button>
        
        <el-table :data="currentQuestionOptions" style="width: 100%" v-loading="optionsLoading">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="content" label="选项内容" show-overflow-tooltip></el-table-column>
          <el-table-column prop="correctness" label="正确性" width="120">
            <template #default="{ row }">
              {{ getCorrectnessLabel(row.correctness) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="openEditOptionDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteOption(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeOptionsModal">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/编辑选项对话框 -->
    <el-dialog v-model="showAddEditOptionDialog" :title="editingOption ? '编辑选项' : '添加选项'" width="600px">
      <el-form :model="optionForm" :rules="optionFormRules" ref="optionFormRef">
        <el-form-item label="选项内容" prop="content">
          <el-input 
            v-model="optionForm.content" 
            type="textarea"
            :rows="3"
            placeholder="请输入选项内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="正确性" prop="correctness">
          <el-select v-model="optionForm.correctness" placeholder="请选择正确性">
            <el-option label="开放性答案" value="OPEN"></el-option>
            <el-option label="错误/一般选项" value="WRONG"></el-option>
            <el-option label="正确答案" value="CORRECT"></el-option>
            <el-option label="排序答案" value="SORT"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddEditOptionDialog = false">取消</el-button>
          <el-button type="primary" @click="saveOption">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { paperManagementService } from '@/services/paperManagementService'
import { useGlobalUser } from '@/composables/useGlobalUser'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = useGlobalUser.state

// 响应式数据
const papers = ref([])
const currentPaper = ref(null)
const questions = ref([])
const loading = ref(false)
const questionsLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalQuestions = ref(0)
const currentQuestionPage = ref(1)
const currentQuestionPageSize = ref(10)

// 对话框控制
const showCreatePaperDialog = ref(false)
const showEditPaperDialog = ref(false)
const showEditPaperInfoDialog = ref(false)
const showAddQuestionDialog = ref(false)
const showEditQuestionDialog = ref(false)
const showOptionsModal = ref(false)
const showAddEditOptionDialog = ref(false)

// 当前操作的题目和选项
const currentQuestion = ref(null)
const currentQuestionOptions = ref([])
const optionsLoading = ref(false)
const editingOption = ref(null)

// 表单数据
const newPaperForm = reactive({
  paperName: '',
  paperType: 1,
  selectedRoles: [] // 3, 4, 5
})

const editPaperForm = reactive({
  id: null,
  paperName: '',
  paperType: 1,
  selectedRoles: []
})

const editPaperInfoForm = reactive({
  id: null,
  paperName: '',
  paperType: 1,
  selectedRoles: []
})

const newQuestionForm = reactive({
  questionText: '',
  qType: 'SINGLE'
})

const editQuestionForm = reactive({
  id: null,
  questionText: '',
  qType: 'SINGLE',
  paperId: null
})

const optionForm = reactive({
  content: '',
  correctness: 'OPEN',
  questionId: null
})

// 表单验证规则
const paperFormRules = {
  paperName: [
    { required: true, message: '请输入问卷名称', trigger: 'blur' },
    { min: 1, max: 100, message: '问卷名称长度在1到100个字符之间', trigger: 'blur' }
  ],
  paperType: [
    { required: true, message: '请选择问卷类型', trigger: 'change' }
  ]
}

const questionFormRules = {
  questionText: [
    { required: true, message: '请输入题目内容', trigger: 'blur' }
  ],
  qType: [
    { required: true, message: '请选择题型', trigger: 'change' }
  ]
}

const optionFormRules = {
  content: [
    { required: true, message: '请输入选项内容', trigger: 'blur' }
  ],
  correctness: [
    { required: true, message: '请选择正确性', trigger: 'change' }
  ]
}

// 获取问卷列表
const fetchPapers = async (page = 1) => {
  loading.value = true
  try {
    const response = await paperManagementService.getPapersPage({
      pageNum: page,
      pageSize: pageSize.value
    })
    
    papers.value = response.records
    total.value = response.total
    currentPage.value = response.current
  } catch (error) {
    console.error('获取问卷列表失败:', error)
    ElMessage.error('获取问卷列表失败')
  } finally {
    loading.value = false
  }
}

// 获取当前问卷的题目列表
const fetchQuestions = async (paperId, page = 1) => {
  questionsLoading.value = true
  try {
    const response = await paperManagementService.getQuestionsByPaperId(paperId, {
      pageNum: page,
      pageSize: currentQuestionPageSize.value
    })
    
    questions.value = response.records.map(item => ({
      ...item.question,
      options: item.answers || []
    }))
    
    totalQuestions.value = response.total
    currentQuestionPage.value = response.current
  } catch (error) {
    console.error('获取题目列表失败:', error)
    ElMessage.error('获取题目列表失败')
  } finally {
    questionsLoading.value = false
  }
}

// 查看问卷详情
const viewPaper = async (paper) => {
  currentPaper.value = paper
  await fetchQuestions(paper.id, 1)
  currentQuestionPage.value = 1
}

// 编辑问卷
const editPaper = (paper) => {
  editPaperForm.id = paper.id
  editPaperForm.paperName = paper.paperName
  editPaperForm.paperType = paper.paperType
  // 解析访问角色ID，去掉默认的1和2
  const roleIds = JSON.parse(paper.accessRoleIds)
  editPaperForm.selectedRoles = roleIds.filter(id => id !== 1 && id !== 2).map(String)
  showEditPaperDialog.value = true
}

// 删除问卷
const deletePaper = async (paper) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除问卷 "${paper.paperName}" 吗？这将同时删除该问卷下的所有题目和选项！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await paperManagementService.deletePaper(paper.id)
    ElMessage.success('删除成功')
    await fetchPapers(currentPage.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问卷失败:', error)
      ElMessage.error('删除问卷失败')
    }
  }
}

// 创建问卷
const createPaper = async () => {
  try {
    // 确保超级管理员和问卷管理员始终在访问权限中
    const accessRoleIds = [1, 2, ...newPaperForm.selectedRoles.map(Number)]
    const paperData = {
      paperName: newPaperForm.paperName,
      paperType: newPaperForm.paperType,
      accessRoleIds: JSON.stringify(accessRoleIds)
    }
    
    await paperManagementService.createPaper(paperData)
    ElMessage.success('创建成功')
    showCreatePaperDialog.value = false
    resetNewPaperForm()
    await fetchPapers(currentPage.value)
  } catch (error) {
    console.error('创建问卷失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('创建问卷失败')
    }
  }
}

// 更新问卷
const updatePaper = async () => {
  try {
    // 确保超级管理员和问卷管理员始终在访问权限中
    const accessRoleIds = [1, 2, ...editPaperForm.selectedRoles.map(Number)]
    const paperData = {
      paperName: editPaperForm.paperName,
      paperType: editPaperForm.paperType,
      accessRoleIds: JSON.stringify(accessRoleIds)
    }
    
    await paperManagementService.updatePaper(editPaperForm.id, paperData)
    ElMessage.success('更新成功')
    showEditPaperDialog.value = false
    await fetchPapers(currentPage.value)
  } catch (error) {
    console.error('更新问卷失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('更新问卷失败')
    }
  }
}

// 更新问卷信息
const updatePaperInfo = async () => {
  try {
    // 确保超级管理员和问卷管理员始终在访问权限中
    const accessRoleIds = [1, 2, ...editPaperInfoForm.selectedRoles.map(Number)]
    const paperData = {
      paperName: editPaperInfoForm.paperName,
      paperType: editPaperInfoForm.paperType,
      accessRoleIds: JSON.stringify(accessRoleIds)
    }
    
    await paperManagementService.updatePaper(currentPaper.value.id, paperData)
    ElMessage.success('更新成功')
    showEditPaperInfoDialog.value = false
    
    // 更新当前显示的问卷信息
    currentPaper.value.paperName = paperData.paperName
    currentPaper.value.paperType = paperData.paperType
    currentPaper.value.accessRoleIds = paperData.accessRoleIds
  } catch (error) {
    console.error('更新问卷信息失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('更新问卷信息失败')
    }
  }
}

// 添加题目
const addQuestion = async () => {
  try {
    const questionData = {
      questionText: newQuestionForm.questionText,
      qtype: newQuestionForm.qType,
      paperId: currentPaper.value.id
    }
    
    await paperManagementService.addQuestion(currentPaper.value.id, questionData)
    ElMessage.success('添加成功')
    showAddQuestionDialog.value = false
    resetNewQuestionForm()
    await fetchQuestions(currentPaper.value.id, currentQuestionPage.value)
  } catch (error) {
    console.error('添加题目失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('添加题目失败')
    }
  }
}

// 编辑题目
const editQuestion = (question) => {
  editQuestionForm.id = question.id
  editQuestionForm.questionText = question.questionText
  editQuestionForm.qType = question.qType
  editQuestionForm.paperId = question.paperId
  showEditQuestionDialog.value = true
}

// 保存题目修改
const saveQuestion = async () => {
  try {
    const questionData = {
      questionText: editQuestionForm.questionText,
      qType: editQuestionForm.qType,
      paperId: editQuestionForm.paperId
    }
    
    await paperManagementService.updateQuestion(editQuestionForm.id, questionData)
    ElMessage.success('更新成功')
    showEditQuestionDialog.value = false
    await fetchQuestions(currentPaper.value.id, currentQuestionPage.value)
  } catch (error) {
    console.error('更新题目失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('更新题目失败')
    }
  }
}

// 删除题目
const deleteQuestion = async (question) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除题目 "${question.questionText}" 吗？这将同时删除该题目的所有选项！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await paperManagementService.deleteQuestion(question.id)
    ElMessage.success('删除成功')
    await fetchQuestions(currentPaper.value.id, currentQuestionPage.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除题目失败:', error)
      ElMessage.error('删除题目失败')
    }
  }
}

// 打开选项管理模态框
const openOptionsModal = async (question) => {
  currentQuestion.value = question
  await loadOptionsForQuestion(question.id)
  showOptionsModal.value = true
}

// 加载指定题目的选项
const loadOptionsForQuestion = async (questionId) => {
  optionsLoading.value = true
  try {
    // 从现有的questions数据中获取选项
    const question = questions.value.find(q => q.id === questionId)
    if (question && question.options) {
      currentQuestionOptions.value = [...question.options]
    } else {
      currentQuestionOptions.value = []
    }
  } catch (error) {
    console.error('加载选项失败:', error)
    ElMessage.error('加载选项失败')
    currentQuestionOptions.value = []
  } finally {
    optionsLoading.value = false
  }
}

// 关闭选项管理模态框
const closeOptionsModal = () => {
  showOptionsModal.value = false
  currentQuestion.value = null
  currentQuestionOptions.value = []
}

// 打开添加选项对话框
const openAddOptionDialog = () => {
  editingOption.value = null
  Object.assign(optionForm, {
    content: '',
    correctness: 'OPEN',
    questionId: currentQuestion.value.id
  })
  showAddEditOptionDialog.value = true
}

// 打开编辑选项对话框
const openEditOptionDialog = (option) => {
  editingOption.value = option
  Object.assign(optionForm, {
    content: option.content,
    correctness: option.correctness,
    questionId: currentQuestion.value.id
  })
  showAddEditOptionDialog.value = true
}

// 保存选项（新增或编辑）
const saveOption = async () => {
  try {
    const optionData = {
      content: optionForm.content,
      correctness: optionForm.correctness
    }

    if (editingOption.value) {
      // 编辑现有选项
      await paperManagementService.updateAnswer(editingOption.value.id, optionData)
      ElMessage.success('更新选项成功')
      
      // 更新本地数据
      const index = currentQuestionOptions.value.findIndex(opt => opt.id === editingOption.value.id)
      if (index !== -1) {
        Object.assign(currentQuestionOptions.value[index], optionData)
      }
    } else {
      // 添加新选项
      const response = await paperManagementService.addAnswer(currentQuestion.value.id, optionData)
      ElMessage.success('添加选项成功')
      
      // 添加到本地数据
      currentQuestionOptions.value.push(response) // 假设API返回新创建的选项
    }
    
    showAddEditOptionDialog.value = false
    resetOptionForm()
    
    // 重新获取题目列表以更新选项
    await fetchQuestions(currentPaper.value.id, currentQuestionPage.value)
  } catch (error) {
    console.error('操作选项失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('操作选项失败')
    }
  }
}

// 删除选项
const deleteOption = async (option) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选项 "${option.content}" 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await paperManagementService.deleteAnswer(option.id)
    ElMessage.success('删除成功')
    
    // 从本地数据中移除
    const index = currentQuestionOptions.value.findIndex(opt => opt.id === option.id)
    if (index !== -1) {
      currentQuestionOptions.value.splice(index, 1)
    }
    
    // 重新获取题目列表以更新选项
    await fetchQuestions(currentPaper.value.id, currentQuestionPage.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除选项失败:', error)
      ElMessage.error('删除选项失败')
    }
  }
}

// 重置选项表单
const resetOptionForm = () => {
  optionForm.content = ''
  optionForm.correctness = 'OPEN'
  optionForm.questionId = null
  editingOption.value = null
}

// 获取正确性标签
const getCorrectnessLabel = (correctness) => {
  const labels = {
    'WRONG': '错误/一般选项',
    'CORRECT': '正确答案',
    'OPEN': '开放性答案',
    'SORT': '排序答案'
  }
  return labels[correctness] || correctness
}

// 返回问卷列表
const backToList = () => {
  currentPaper.value = null
  questions.value = []
}

// 返回主页
const goHome = () => {
  router.push('/')
}

// 处理问卷分页变化
const handlePageChange = async (page) => {
  await fetchPapers(page)
}

// 处理问卷每页大小变化
const handleSizeChange = async (size) => {
  pageSize.value = size
  await fetchPapers(1)
}

// 处理题目分页变化
const handleQuestionPageChange = async (page) => {
  await fetchQuestions(currentPaper.value.id, page)
}

// 处理题目每页大小变化
const handleQuestionSizeChange = async (size) => {
  currentQuestionPageSize.value = size
  await fetchQuestions(currentPaper.value.id, 1)
}

// 获取问卷类型名称
const getPaperTypeName = (type) => {
  const types = { 1: '普通', 2: '测评', 3: '360评估' }
  return types[type] || '未知'
}

// 获取角色名称
const getRoleNames = (roleIds) => {
  const roles = {
    1: '超级管理员',
    2: '问卷管理员',
    3: '妈妈',
    4: '爸爸',
    5: '学生'
  }
  
  return roleIds.map(id => roles[id]).join(', ')
}

// 获取题型名称
const getQuestionTypeName = (type) => {
  const types = {
    'SINGLE': '单选题',
    'MULTI': '多选题',
    'BLANK': '填空题',
    'SORT': '排序题',
    'SCORE': '评分题',
    'FILE': '文件题'
  }
  return types[type] || '未知'
}

// 重置表单
const resetNewPaperForm = () => {
  newPaperForm.paperName = ''
  newPaperForm.paperType = 1
  newPaperForm.selectedRoles = []
}

const resetNewQuestionForm = () => {
  newQuestionForm.questionText = ''
  newQuestionForm.qType = 'SINGLE'
}

// 页面加载时获取问卷列表
onMounted(async () => {
  // 检查用户权限
  if (!currentUser || ![1, 2].includes(currentUser.roleId)) {
    ElMessage.error('您没有权限访问此页面')
    router.push('/')
    return
  }
  
  await fetchPapers()
})
</script>

<style scoped>
.paper-management {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 140px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.back-btn {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.paper-info {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 15px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item label {
  font-weight: bold;
  min-width: 100px;
  color: #555;
}

.option-preview {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.option-preview:last-child {
  border-bottom: none;
}

.options-modal-content {
  max-height: 500px;
  overflow-y: auto;
}

.add-option-btn {
  margin-bottom: 15px;
}
</style>