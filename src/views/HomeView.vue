<script setup lang="ts">
import { inject } from 'vue'
import MovieShowcase from '../components/MovieShowcase.vue'
import type { Movie as DbMovie } from '@/config/supabase'
import type { Ref } from 'vue'

// 注入来自App.vue的电影数据和加载状态
const currentMovies = inject<Ref<DbMovie[]>>('currentMovies')
const currentLoadingState = inject<Ref<boolean>>('currentLoadingState')
</script>

<template>
  <div class="home-container">
    <div class="featured-section">
      <MovieShowcase :db-movies="currentMovies || []" :is-loading="currentLoadingState || false" />
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.welcome-section {
  text-align: center;
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  margin-bottom: 40px;
}

.welcome-title {
  font-size: 3rem;
  font-weight: bold;
  margin: 0 0 20px 0;
}

.welcome-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.featured-section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

/* 电影展示组件样式已在MovieShowcase.vue中定义 */

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 40px 20px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin: 0 0 10px 0;
}

.stat-label {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 2rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  /* 响应式电影展示样式已在MovieShowcase.vue中定义 */

  .stats-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
