import axios from 'axios'

// 根据环境变量确定API基础URL
let baseURL = 'http://localhost:8080/api'; // 默认本地开发地址

// 在生产环境中使用相对路径或通过环境变量指定后端地址
if (process.env.NODE_ENV === 'production') {
  // 如果前端后端部署在同一主机上，可以使用相对路径或localhost
  // 或者从环境变量中读取后端API地址
  baseURL = window.location.protocol + '//' + window.location.hostname + ':8080/api';
  
  // 如果通过反向代理部署在同一域名下，可以使用相对路径
  // baseURL = '/api';
}

// 创建axios实例
const api = axios.create({
  baseURL: baseURL, // 后端API基础URL
  timeout: 10000, // 请求超时时间
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么，比如添加token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response
  },
  error => {
    // 对响应错误做点什么
    if (error.response?.status === 401) {
      // Token过期或未授权，清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      window.location.href = '/' // 或者跳转到登录页
    }
    return Promise.reject(error)
  }
)

export default api