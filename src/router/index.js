import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Assessment from '../views/Assessment.vue'
import Reports from '../views/Reports.vue'
import PsychologicalAssessment from '../views/PsychologicalAssessment.vue'
import { authService } from '@/services/authService'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/assessment/:paperId',
    name: 'Assessment',
    component: Assessment,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/psychological-assessment',
    name: 'PsychologicalAssessment',
    component: PsychologicalAssessment
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查是否需要登录
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    // 如果目标页面需要认证且用户未登录，则重定向到主页并显示提示
    next({ path: '/' })
    // 在这里可以使用ElMessage或其他方式显示提示信息
    setTimeout(() => {
      // 这里模拟显示登录提示
      if (window.showLoginModal) {
        window.showLoginModal()
      } else {
        alert('请先登录以访问此页面')
      }
    }, 100)
  } else {
    next()
  }
})

export default router