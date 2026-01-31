import api from '@/utils/api'

export const paperManagementService = {
  // 获取问卷列表
  getPapers: async () => {
    try {
      const response = await api.get('/paper-management/papers')
      return response.data
    } catch (error) {
      console.error('获取问卷列表失败:', error)
      throw error
    }
  },

  // 分页获取问卷列表
  getPapersPage: async (params) => {
    try {
      const response = await api.get('/paper-management/papers/page', { params })
      return response.data
    } catch (error) {
      console.error('分页获取问卷列表失败:', error)
      throw error
    }
  },

  // 获取问卷详情
  getPaperById: async (id) => {
    try {
      const response = await api.get(`/paper-management/papers/${id}`)
      return response.data
    } catch (error) {
      console.error(`获取问卷详情失败，ID: ${id}`, error)
      throw error
    }
  },

  // 创建问卷
  createPaper: async (paperData) => {
    try {
      const response = await api.post('/paper-management/papers', paperData)
      return response.data
    } catch (error) {
      console.error('创建问卷失败:', error)
      throw error
    }
  },

  // 更新问卷
  updatePaper: async (id, paperData) => {
    try {
      const response = await api.put(`/paper-management/papers/${id}`, paperData)
      return response.data
    } catch (error) {
      console.error(`更新问卷失败，ID: ${id}`, error)
      throw error
    }
  },

  // 删除问卷
  deletePaper: async (id) => {
    try {
      const response = await api.delete(`/paper-management/papers/${id}`)
      return response.data
    } catch (error) {
      console.error(`删除问卷失败，ID: ${id}`, error)
      throw error
    }
  },

  // 分页获取问卷下的题目及选项
  getQuestionsByPaperId: async (paperId, params) => {
    try {
      const response = await api.get(`/paper-management/papers/${paperId}/questions/page`, { params })
      return response.data
    } catch (error) {
      console.error(`获取问卷题目失败，问卷ID: ${paperId}`, error)
      throw error
    }
  },

  // 为问卷添加题目
  addQuestion: async (paperId, questionData) => {
    try {
      const response = await api.post(`/paper-management/papers/${paperId}/questions`, questionData)
      return response.data
    } catch (error) {
      console.error('添加题目失败:', error)
      throw error
    }
  },

  // 更新题目
  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await api.put(`/paper-management/questions/${questionId}`, questionData)
      return response.data
    } catch (error) {
      console.error(`更新题目失败，ID: ${questionId}`, error)
      throw error
    }
  },

  // 删除题目
  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/paper-management/questions/${questionId}`)
      return response.data
    } catch (error) {
      console.error(`删除题目失败，ID: ${questionId}`, error)
      throw error
    }
  },

  // 为题目添加选项
  addAnswer: async (questionId, answerData) => {
    try {
      const response = await api.post(`/paper-management/questions/${questionId}/answers`, answerData)
      return response.data
    } catch (error) {
      console.error('添加选项失败:', error)
      throw error
    }
  },

  // 更新选项
  updateAnswer: async (answerId, answerData) => {
    try {
      const response = await api.put(`/paper-management/answers/${answerId}`, answerData)
      return response.data
    } catch (error) {
      console.error(`更新选项失败，ID: ${answerId}`, error)
      throw error
    }
  },

  // 删除选项
  deleteAnswer: async (answerId) => {
    try {
      const response = await api.delete(`/paper-management/answers/${answerId}`)
      return response.data
    } catch (error) {
      console.error(`删除选项失败，ID: ${answerId}`, error)
      throw error
    }
  }
}