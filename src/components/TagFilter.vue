<template>
  <div class="tag-filter">
    <div class="tags-container">
      <!-- 已选标签显示区域 -->
      <div class="selected-tag-list" v-if="selectedTags.length > 0">
        <div
          v-for="tag in selectedTags"
          :key="tag.id"
          class="selected-tag"
        >
          <span class="tag-name">{{ tag.name }}</span>
          <svg class="remove-icon" viewBox="0 0 1024 1024" @click="removeTag(tag.id)">
            <path d="M563.8 512l262.5-312.9c4.4-5.2 0.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3.1-3.6-7.6-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3.1 3.6 7.6 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      <!-- 添加标签按钮 -->
      <div class="add-tag-section">
      <button class="add-tag-btn" @click="toggleDropdown" :class="{ active: showDropdown }" :disabled="isLoading">
        <svg v-if="!isLoading" class="plus-icon" viewBox="0 0 1024 1024">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m192 472c0 4.4-3.6 8-8 8H544v152c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V544H328c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h152V328c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v152h152c4.4 0 8 3.6 8 8v48z" fill="currentColor"></path>
        </svg>
        <div v-else class="loading-spinner"></div>
        {{ isLoading ? '加载中...' : '添加标签' }}
      </button>

      <!-- 下拉标签选择器 -->
      <div class="tag-dropdown" v-if="showDropdown">
        <div
          v-for="tag in availableTags"
          :key="tag.id"
          class="dropdown-tag-item"
          :class="{ disabled: isTagSelected(tag.id) }"
          @click="addTag(tag)"
        >
          <span class="tag-name">{{ tag.name }}</span>
          <svg v-if="isTagSelected(tag.id)" class="check-icon" viewBox="0 0 1024 1024">
            <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1 0.4-12.8-6.3-12.8z" fill="currentColor"></path>
          </svg>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DatabaseService } from '@/config/database'

interface LocalTag {
  id: number
  name: string
}

interface Props {
  selectedTagIds: number[]
}

interface Emits {
  (e: 'tagChange', tagIds: number[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 从数据库获取的标签列表
const availableTags = ref<LocalTag[]>([])
const isLoading = ref(true)

// 从数据库加载标签
const loadTags = async () => {
  try {
    isLoading.value = true
    // 添加分页参数，限制一次最多加载100个标签
    const dbTags = await DatabaseService.getAllTags({ limit: 100, offset: 0 })
    // 转换数据库标签格式为组件需要的格式
    availableTags.value = dbTags.map(tag => ({
      id: tag.tag_id,
      name: tag.tag_name
    }))
  } catch (error) {
    console.error('加载标签失败:', error)
    // 如果加载失败，使用默认标签
    availableTags.value = [
      { id: 1, name: '剧情' },
      { id: 2, name: '冒险动作' },
      { id: 3, name: '动画' },
      { id: 4, name: '中国台湾' },
      { id: 5, name: '中国香港' }
    ]
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载标签
onMounted(() => {
  loadTags()
})

// 控制下拉菜单显示
const showDropdown = ref(false)

// 计算属性：已选择的标签
const selectedTags = computed(() => {
  return availableTags.value.filter(tag => props.selectedTagIds.includes(tag.id))
})

// 切换下拉菜单
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 检查标签是否已选择
const isTagSelected = (tagId: number) => {
  return props.selectedTagIds.includes(tagId)
}

// 添加标签
const addTag = (tag: LocalTag) => {
  if (!isTagSelected(tag.id)) {
    const newSelectedTagIds = [...props.selectedTagIds, tag.id]
    emit('tagChange', newSelectedTagIds)
  }
  showDropdown.value = false
}

// 移除标签
const removeTag = (tagId: number) => {
  const newSelectedTagIds = props.selectedTagIds.filter(id => id !== tagId)
  emit('tagChange', newSelectedTagIds)
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.add-tag-section')) {
    showDropdown.value = false
  }
}

// 监听点击外部事件
document.addEventListener('click', handleClickOutside)
</script>

<style scoped>
.tag-filter {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.tags-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.selected-tag {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  transition: background 0.3s;
}

.selected-tag:hover {
  background: #0056b3;
}

.selected-tag .tag-name {
  margin-right: 8px;
}

.selected-tag .remove-icon {
  width: 14px;
  height: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}

.selected-tag .remove-icon:hover {
  transform: scale(1.2);
}

/* 添加标签按钮样式 */
.add-tag-section {
  position: relative;
  width: 120px;
}

.add-tag-btn {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: white;
  border: 2px dashed #007bff;
  border-radius: 8px;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  justify-content: center;
}

.add-tag-btn:hover {
  background: #f0f8ff;
  border-color: #0056b3;
}

.add-tag-btn.active {
  background: #007bff;
  color: white;
  border-style: solid;
}

.plus-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.add-tag-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-tag-btn:disabled:hover {
  background: white;
  border-color: #007bff;
  transform: none;
}

/* 下拉菜单样式 */
.tag-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 4px;
}

.dropdown-tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-tag-item:last-child {
  border-bottom: none;
}

.dropdown-tag-item:hover {
  background: #f8f9fa;
}

.dropdown-tag-item.disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.dropdown-tag-item.disabled:hover {
  background: #f5f5f5;
}

.dropdown-tag-item .tag-name {
  font-size: 14px;
  flex: 1;
}

.dropdown-tag-item .check-icon {
  width: 16px;
  height: 16px;
  color: #28a745;
}
</style>
