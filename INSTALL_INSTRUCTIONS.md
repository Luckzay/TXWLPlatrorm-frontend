# 依赖安装说明

## 问题描述
在安装项目依赖时可能会遇到以下错误：
```
npm error While resolving: vite-plugin-vue-devtools@8.0.5
npm error Found: vite@5.4.21
npm error Could not resolve dependency:
npm error peer vite@"^6.0.0 || ^7.0.0-0" from vite-plugin-vue-devtools@8.0.5
```

## 解决方案

### 方案1：使用 --legacy-peer-deps 参数（推荐）
在项目根目录运行以下命令：
```bash
npm install --legacy-peer-deps
```

### 方案2：使用 --force 参数
```bash
npm install --force
```

### 方案3：清理缓存后安装
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

## 已添加的依赖
- `vuedraggable`: 用于实现排序题的拖拽功能

## 注意事项
1. 项目中已更新vite至v6.0.0以兼容vite-plugin-vue-devtools
2. 排序题功能依赖vuedraggable库实现拖拽排序功能
3. 所有功能已在Assessment.vue中实现，等待依赖安装完成后即可正常使用

## 安装成功后
安装完成后，排序题（SORT类型）功能将可以正常工作，用户可以拖拽选项进行排序。