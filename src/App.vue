<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import TopNavbar from './components/TopNavbar.vue'
import TagFilter from './components/TagFilter.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import { DatabaseService } from './config/database.ts'
import type { Movie } from './config/supabase.ts'

const isSidebarOpen = ref(true)
// 全局状态：当前电影数据和加载状态
const currentMovies = ref<Movie[]>([])
const isRefreshing = ref<boolean>(false) // 用于整页刷新
const isLoadingMore = ref<boolean>(false) // 用于加载更多
const selectedTagIds = ref<number[]>([])
const requestId = ref(0) // 用于处理竞态条件
const searchQuery = ref('') // 用于搜索功能

const currentPlatform = ref<'全部' | '电影' | '剧集' | '纪录片' | '动漫'>('电影')

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}





const currentSort = ref<{ sortBy: string; sortOrder: string }>({ sortBy: 'movie_id', sortOrder: 'desc' })

const handlePlatformChange = (platform: '全部' | '电影' | '剧集' | '纪录片' | '动漫') => {
  currentPlatform.value = platform
  localStorage.setItem('currentPlatform', platform)
  requestId.value++ // 创建新的请求ID
  fetchMovies()
}

const handleSortChanged = (sort: { sortBy: string; sortOrder: string }) => {
  currentSort.value = sort
  requestId.value++ // 创建新的请求ID
  fetchMovies()
}

// 处理标签变化
const handleTagChange = (tagIds: number[]) => {
  selectedTagIds.value = tagIds
  // 如果有标签选择，清空搜索关键词
  if (tagIds.length > 0) {
    searchQuery.value = ''
  }
  requestId.value++ // 创建新的请求ID
  fetchMovies()
}

// 处理搜索事件
const handleSearch = (query: string) => {
  searchQuery.value = query
  // 搜索时清空标签选择
  selectedTagIds.value = []
  requestId.value++ // 创建新的请求ID
  fetchMovies()
}

const currentPage = ref(1)
const hasMoreMovies = ref(true)

const fetchMovies = async (loadMore = false) => {
  // 如果有搜索关键词，清空标签选择
  if (searchQuery.value) {
    selectedTagIds.value = []
  }
  const localRequestId = requestId.value

  if (loadMore) {
    // 如果正在刷新或加载更多，则不允许再次加载更多
    if (isRefreshing.value || isLoadingMore.value || !hasMoreMovies.value) return
    isLoadingMore.value = true
  } else {
    // 如果是刷新操作，允许新的请求覆盖旧的请求
    // if (isRefreshing.value) return // 允许新请求中断旧请求
    isRefreshing.value = true
    // 刷新时重置状态
    if (mainContentRef.value) {
      mainContentRef.value.scrollTop = 0
    }
    currentPage.value = 1
    currentMovies.value = []
    hasMoreMovies.value = true
  }

  try {
    const params: any = {
      sort_by: currentSort.value.sortBy,
      sort_order: currentSort.value.sortOrder,
      limit: 20,
      offset: (currentPage.value - 1) * 20
    }

    // 始终应用平台/类型筛选
    if (currentPlatform.value !== '全部') {
      params.type = currentPlatform.value
    }

    let newMovies: Movie[] = []
    if (selectedTagIds.value.length > 0) {
      newMovies = await DatabaseService.getMoviesByTags(selectedTagIds.value, params)
    } else {
      // 添加搜索参数
      if (searchQuery.value) {
        params.search = searchQuery.value
      }
      newMovies = await DatabaseService.getMovies(params)
    }

    if (localRequestId !== requestId.value) {
      // 如果请求ID不匹配，说明是过时的请求，直接返回
      return
    }

    if (newMovies.length < 20) {
      hasMoreMovies.value = false
    }

    currentMovies.value = loadMore ? [...currentMovies.value, ...newMovies] : newMovies
    currentPage.value++
  } catch (error) {
    console.error('获取电影数据失败:', error)
  } finally {
    if (localRequestId === requestId.value) {
      if (loadMore) {
        isLoadingMore.value = false
      } else {
        isRefreshing.value = false
      }
    }
  }
}

// 提供给子组件
provide('currentMovies', currentMovies)
provide('currentLoadingState', isRefreshing) // 主加载状态应反映整页刷新
provide('requestId', requestId)
provide('fetchMovies', fetchMovies)
provide('selectedTagIds', selectedTagIds)

const mainContentRef = ref<HTMLElement | null>(null)

const handleScroll = () => {
  if (mainContentRef.value && mainContentRef.value.scrollTop + mainContentRef.value.clientHeight >= mainContentRef.value.scrollHeight - 5) {
    fetchMovies(true)
  }
}

// 路由路径到平台类型的映射
const routeToPlatform = {
  '/': '全部',
  '/home': '全部',
  '/movie': '电影',
  '/anime': '动漫',
  '/documentary': '纪录片',
  '/series': '剧集'
}

// 根据路由路径设置平台类型
const updatePlatformFromRoute = (path: string) => {
  if (routeToPlatform[path]) {
    currentPlatform.value = routeToPlatform[path] as '全部' | '电影' | '剧集' | '纪录片' | '动漫'
    localStorage.setItem('currentPlatform', currentPlatform.value)
    fetchMovies()
  }
}

// 监听路由变化
const route = useRoute()
watch(() => route.path, (newPath) => {
  updatePlatformFromRoute(newPath)
})

onMounted(() => {
  // 首先根据当前路由设置平台类型
  const currentPath = window.location.pathname
  if (routeToPlatform[currentPath]) {
    currentPlatform.value = routeToPlatform[currentPath] as '全部' | '电影' | '剧集' | '纪录片' | '动漫'
    localStorage.setItem('currentPlatform', currentPlatform.value)
  } else {
    // 如果当前路由没有对应的平台类型，则使用保存的平台类型
    const savedPlatform = localStorage.getItem('currentPlatform')
    if (savedPlatform && ['全部', '电影', '剧集', '纪录片', '动漫'].includes(savedPlatform)) {
      currentPlatform.value = savedPlatform as '全部' | '电影' | '剧集' | '纪录片' | '动漫'
    }
  }

  fetchMovies()
  mainContentRef.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  mainContentRef.value?.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="app-layout">
    <!-- 顶部导航栏 -->
    <TopNavbar @toggle-sidebar="toggleSidebar" @search="handleSearch" />

    <!-- 侧边导航栏 -->
    <Sidebar :is-sidebar-open="isSidebarOpen" @platform-changed="handlePlatformChange" @sort-changed="handleSortChanged" />

    <!-- 主内容区域 -->
    <main class="main-content" :class="{ expanded: !isSidebarOpen }" ref="mainContentRef">
      <TagFilter :selectedTagIds="selectedTagIds" @tagChange="handleTagChange" />
            <RouterView />
      <LoadingSpinner v-if="isLoadingMore" />
    </main>
  </div>
</template>

<style scoped>
/* 在scoped样式中的body选择器不会生效,需要使用:global修饰符 */
:global(body) {
  margin: 0 !important;
}
.app-layout {
  position: relative;
  width: 100%;
  height: 100vh;
  /* background-color: #f5f5f5; */
  overflow: hidden;
}

/* 顶部导航栏样式已移至 TopNavbar.vue 组件 */

/* 侧边导航栏样式已移至 Sidebar.vue 组件 */

/* 主内容区域样式 */
.main-content {
  position: absolute;
  top: 60px;
  left: 250px;
  right: 0;
  bottom: 0;
  padding: 20px;
  transition: left 0.3s ease;
  /* background: #f5f5f5; */
  overflow-y: auto;
  z-index: 1;
}

.main-content.expanded {
  left: 0;
}


</style>
