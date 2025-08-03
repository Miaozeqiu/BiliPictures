<script setup lang="ts">
import { ref, inject } from 'vue'

const searchQuery = ref('')
const isSidebarOpen = ref(true)
const isSearchFocused = ref(false)

// 注入App.vue中的请求ID和搜索方法
const requestId = inject<{ value: number }>('requestId')
const fetchMovies = inject<Function>('fetchMovies')
const selectedTagIds = inject<{ value: number[] }>('selectedTagIds')

const emit = defineEmits<{
  toggleSidebar: []
  search: [query: string]
}>()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  emit('toggleSidebar')
}

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 清空已选标签
    if (selectedTagIds && selectedTagIds.value.length > 0) {
      selectedTagIds.value = []
    }

    // 触发搜索事件
    emit('search', searchQuery.value.trim())

    // 增加请求ID并获取电影
    if (requestId) {
      requestId.value++
    }

    if (fetchMovies) {
      fetchMovies()
    }
  }
}

// 清除搜索内容
const clearSearch = () => {
  searchQuery.value = ''
  // 重新加载数据，这里可以根据需求决定是否需要重新获取所有数据
  if (fetchMovies) {
    emit('search', '') // 传递空字符串以获取所有电影
  }
}

// 处理按键事件，按下回车键时触发搜索
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (searchQuery.value.trim()) {
      handleSearch()
    } else {
      clearSearch()
    }
  }
}
</script>

<template>
  <header class="top-navbar">
    <div class="navbar-left">
      <button
        type="button"
        class="VPNavBarHamburger"
        :class="{ active: isSidebarOpen }"
        aria-label="mobile navigation"
        :aria-expanded="isSidebarOpen"
        aria-controls="VPNavScreen"
        @click="toggleSidebar"
      >
        <span class="container">
          <span class="top" />
          <span class="middle" />
          <span class="bottom" />
        </span>
      </button>
      <h1 class="app-title" :class="{ 'hidden-on-focus': isSearchFocused }">BiliPictures</h1>
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="电影，动漫，纪录片..."
          class="search-input"
          @keydown="handleKeyDown"
          @focus="isSearchFocused = true"
          @blur="isSearchFocused = false"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-button">×</button>
      </div>
    </div>

    <div class="navbar-center">
      <span class="search-text" @click="handleSearch">搜索</span>
    </div>

    <!-- <div class="navbar-right">
      <button class="user-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div> -->
  </header>
</template>

<style scoped>
/* 顶部导航栏样式 */
.top-navbar {

  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  background: #ffffff;
  color: #fc8cba;
  /* font-family: 'Caveat', 'Ma Shan Zheng', cursive; */
  padding: 0 0px;
  box-shadow: 0 2px 10px rgba(211, 211, 211, 0.08);
  z-index: 1000;
  border-bottom: 1px solid #eaeaea;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;

}

.VPNavBarHamburger {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 60px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}

@media (min-width: 768px) {
  .VPNavBarHamburger {
    display: flex;
  }
}

.container {
  position: relative;
  width: 16px;
  height: 14px;
  overflow: hidden;
}

.VPNavBarHamburger:hover .top    { top: 0; left: 0; transform: translateX(-4px); }
.VPNavBarHamburger:hover .middle { top: 6px; left: 0; transform: translateX(0); }
.VPNavBarHamburger:hover .bottom { top: 12px; left: 0; transform: translateX(-8px); }

.VPNavBarHamburger.active .top    { top: 6px; transform: translateX(0) rotate(225deg); }
.VPNavBarHamburger.active .middle { top: 6px; transform: translateX(-16px); }
.VPNavBarHamburger.active .bottom { top: 6px; transform: translateX(0) rotate(135deg); }

.VPNavBarHamburger.active:hover .top,
.VPNavBarHamburger.active:hover .middle,
.VPNavBarHamburger.active:hover .bottom {
  background-color: #999;
  transition: top .25s, background-color .25s, transform .25s;
}

.top,
.middle,
.bottom {
  position: absolute;
  width: 16px;
  height: 2px;
  background-color: #fc8cba;
  transition: top .25s, background-color .5s, transform .25s;
}

.top    { top: 0; left: 0; transform: translateX(0); }
.middle { top: 6px; left: 0; transform: translateX(-8px); }
.bottom { top: 12px; left: 0; transform: translateX(-4px); }

.app-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  transition: all 0.3s ease;
}

.navbar-center {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 20px;
  transition: all 0.3s ease;
}


.search-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  transition: all 0.3s ease;
}




.search-input {
  border: 1px solid #e5e5e5;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 8px 30px 8px 12px; /* 为清除按钮留出空间 */
  font-size: 14px;
  color: #333; /* 修改输入文字颜色 */
  flex: 1;
  transition: all 0.3s ease;
  width: 180px;
}

.clear-button {
  position: absolute;
  right: 70px; /* 调整位置，使其在输入框内 */
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 0 5px;
  outline: none;
}

.search-input:focus {
  outline: none; /* 移除默认的浏览器轮廓 */
  border-color: #b7b7b7; /* 聚焦时边框颜色为深灰色 */
  /* box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.08); */
  width: 240px;
}

.search-input::placeholder {
  color: var(--vp-c-text-3);
}

.search-text {
  padding: 8px 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.search-text:hover {
  color: var(--vp-c-brand-1);
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-avatar {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.user-avatar:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 响应式设计 - 完全重新设计的布局 */
@media (max-width: 768px) {
  .top-navbar {
    position: relative;
  }
  
  .navbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 2;
  }
  
  .app-title {
    font-size: 20px;
    font-weight: bold;
    margin: 0;
    transition: all 0.3s ease;
    white-space: nowrap;
  }
  
  .app-title.hidden-on-focus {
    opacity: 0;
    transform: translateX(-20px);
    pointer-events: none;
  }
  
  .search-container {
    position: absolute;
    left: 180px;
    top: 50%;
    transform: translateY(-50%);
    width: 150px;
    transition: all 0.3s ease;
  }
  
  .search-container:focus-within {
    left: 50px;
    width: 280px;
  }
  
  .navbar-center {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
  }
  
  .search-input {
    font-size: 14px;
    padding: 8px 12px;
    width: 120px;
    transition: all 0.3s ease;
  }
  
  .search-input:focus {
    width: 280px;
  }

  .search-btn {
    padding: 8px 12px;
  }
}
</style>
