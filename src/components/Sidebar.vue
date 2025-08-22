<template>
  <aside class="sidebar" :class="{ collapsed: !isSidebarOpen }">
    <div class="sidebar-content">
      <!-- 平台切换组件 -->
      <div class="platform-switch-container">
        <PlatformSwitch v-model="selectedPlatform" @update:modelValue="handlePlatformChange" />
      </div>

      <!-- 排序方式组件 -->
      <div class="sort-switch-container">
        <h3 class="section-title">排序方式</h3>
        <SortSwitch v-model="selectedSort" @update:modelValue="handleSortChange" />
      </div>

      <!-- 底部图标链接 -->
      <div class="bottom-links">
        <a href="https://pages.csid.cc/articles/BiliPictures" class="icon-link" title="关于">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <a href="https://github.com/Miaozeqiu/BiliPictures" target="_blank" class="icon-link" title="GitHub">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>

    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PlatformSwitch from './PlatformSwitch.vue'
import SortSwitch from './SortSwitch.vue'

defineProps<{
  isSidebarOpen: boolean
}>()

const emit = defineEmits<{
  platformChanged: [platform: '全部' | '电影' | '剧集' | '纪录片' | '动漫'],
  sortChanged: [sort: { sortBy: string, sortOrder: string }]
}>()

const router = useRouter()
const selectedPlatform = ref('电影')
const selectedSort = ref('默认')

// 平台切换路由映射
const platformRoutes: Record<string, string> = {
  '全部': '/',
  '电影': '/movie',
  '动漫': '/anime',
  '纪录片': '/documentary',
  '剧集': '/series'
}

// 平台类型映射到数据库类型
const platformToDbType: Record<string, '全部' | '电影' | '剧集' | '纪录片' | '动漫'> = {
  '全部': '全部',
  '电影': '电影',
  '动漫': '动漫',
  '纪录片': '纪录片',
  '剧集': '剧集'
}

// 排序方式映射到数据库字段
const sortToDbField: Record<string, { sort_by: string; sort_order: 'asc' | 'desc' }> = {
  '默认': { sort_by: 'movie_id', sort_order: 'desc' },
  '豆瓣评分': { sort_by: 'douban_rating', sort_order: 'desc' },
  '上映时间': { sort_by: 'release_date', sort_order: 'desc' }
}

// 处理平台切换
const handlePlatformChange = (platform: string) => {
  const route = platformRoutes[platform]
  if (route) {
    router.push(route)
  }
  emit('platformChanged', platformToDbType[platform])
}

// 处理排序切换
const handleSortChange = (sort: string) => {
  selectedSort.value = sort
  const sortConfig = sortToDbField[sort]
  emit('sortChanged', { sortBy: sortConfig.sort_by, sortOrder: sortConfig.sort_order })
}
</script>

<style scoped>
.sidebar {
  
  --primary-color: white;
  --primary-hover: hsl(216, 100%, 65%);
  --bg-color: #ffffff;
  --text-color: hsl(0, 0%, 39%);
  --text-hover: rgb(55, 55, 55);
  --border-radius: 0.8em;
  --transition-time: 0.3s;
  --scale-hover: 0.05;
  --scale-active: 0.02;

  overflow-y: hidden;
  position: fixed;
  top: 60px;
  left: 0;
  width: 250px;
  height: calc(100vh - 60px);
  background: var(--bg-color);
  border-top: 1px solid hsl(0, 0%, 92%);
  border-right: 1px solid hsl(0, 0%, 92%);
  transition: transform var(--transition-time) ease;
  z-index: 999;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-content {
  padding: 20px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.platform-switch-container {
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sort-switch-container {
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 1px solid hsl(0, 0%, 95%);
  margin-top: 10px;
}



.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}

.bottom-links {

  padding: 20px 15px;
  display: flex;
  justify-content: center;
  gap: 20px;
  border-top: 1px solid hsl(0, 0%, 95%);
}

.icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius);
  color: var(--text-color);
  text-decoration: none;
  transition: all var(--transition-time) ease;
  background: transparent;
}

.icon-link:hover {
  color: var(--primary-hover);
  background: hsl(216, 100%, 97%);

}

.icon-link:active {

}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    width: 280px;
    height: calc(100vh - 60px);
    z-index: 1000;
    transform: translateX(-100%);

  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>
