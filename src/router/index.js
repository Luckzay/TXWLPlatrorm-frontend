import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Assessment from '../views/Assessment.vue'
import Reports from '../views/Reports.vue'
import PsychologicalAssessment from '../views/PsychologicalAssessment.vue'
import PaperManagement from "@/views/PaperManagement.vue";
import { authService } from '@/services/authService'
import {useGlobalUser} from "@/composables/useGlobalUser";

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
  },
  {
    path: '/paper-management',
    name: 'PaperManagement',
    component: PaperManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查是否需要登录
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authService.isAuthenticated.value) {
    next({ path: '/' })
    setTimeout(() => {
      // 这里模拟显示登录提示
      if (window.showLoginModal) {
        window.showLoginModal()
      } else {
        alert('请先登录以访问此页面')
      }
    }, 100)
  } else if (to.meta.requiresAdmin && authService.isAuthenticated.value) {
    // 检查管理员权限 - 只有角色ID为1（超级管理员）或2（问卷管理员）可以访问
    if ([1, 2].includes(useGlobalUser.state.roleId)) {
      next();
    } else {
      next({ path: '/' });
      setTimeout(() => {
        alert('您没有权限访问此页面');
      }, 100);
    }
  } else {
    next()
  }
})

export default router