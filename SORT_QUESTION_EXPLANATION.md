# 排序题（SORT）功能实现说明

## 功能概述
排序题允许用户通过拖拽的方式对选项进行排序。这在心理测评场景中非常有用，比如让用户按兴趣程度对活动进行排序。

## 实现技术
- 使用 `vuedraggable` 组件实现拖拽排序功能
- 使用 Element Plus 组件库构建界面
- 将排序结果以选项内容数组的形式保存

## 代码实现细节

### 1. 模板部分
在 Assessment.vue 的模板中增加了 SORT 类型的处理：
```html
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
```

### 2. 事件处理
- `onSortChange`: 当选项被重新排序时触发，将排序后的选项内容数组保存到答案中
- `getOptionRank`: 获取选项在当前排序中的位置
- `initSortQuestion`: 初始化排序题选项，确保原始顺序被保存

### 3. 答案存储
排序题的答案以选项内容的数组形式存储，例如 `['体验营3：和来自不同国家的同龄人进行外语对话...', '体验营1：参与经典文学作品的赏析会...', '体验营2：运用公式和模型...']` 表示第一个选项是"体验营3"，第二个选项是"体验营1"，以此类推。

### 4. 验证逻辑
- 在 `isCurrentPageCompleted` 函数中添加了对 SORT 类型的验证
- 在 `submitAssessment` 函数中添加了对 SORT 类型的验证

### 5. 默认行为
当用户没有对排序题进行任何拖拽操作时，系统会自动使用选项的原始顺序作为答案提交，确保每道题都有有效的答案。

### 6. 样式
提供了专门的CSS样式以改善用户体验，包括拖拽时的视觉反馈。

## 后端配合
后端需要能够：
1. 正确识别 SORT 类型的问题
2. 在数据库中存储问题类型为 'SORT'
3. 返回正确的选项数据结构
4. 接收并处理排序结果

## 示例
根据你提供的SQL示例，排序题会显示如下内容：
- 题目文本："请想象你有机会参加一场涵盖多学科的体验营，请按照你对这些活动的感兴趣程度依次点击下方选项，进行排序。"
- 选项包括多个体验营活动，用户可以通过拖拽来按兴趣程度排序