<template>
  <div class="movie-showcase">
    <!-- 骨架屏 -->
    <div v-if="isLoading" class="movie-grid">
      <div
        v-for="n in 8"
        :key="`skeleton-${n}`"
        class="movie-card skeleton-card"
      >
        <div class="movie-poster skeleton-poster">
          <div class="skeleton-image"></div>
          <div class="skeleton-overlay">
            <div class="skeleton-rating"></div>
          </div>
        </div>
        <div class="movie-info">
          <div class="skeleton-title"></div>
          <div class="skeleton-year"></div>
        </div>
      </div>
    </div>

    <!-- 暂无数据 -->
    <div v-else-if="!movies.length" class="no-data-message">
      <p>暂时没有数据</p>
    </div>

    <!-- 实际内容 -->
    <div v-else class="movie-grid">
      <div
        v-for="movie in movies"
        :key="movie.id"
        class="movie-card"
        @click="handleMovieClick(movie, $event)"
      >
        <div class="movie-poster">
          <img
            :src="movie.poster"
            :alt="movie.title"
            class="poster-image"
            loading="lazy"
          />
          <div class="movie-overlay">
            <div class="movie-rating">
              <span class="rating-star">★</span>
              {{ movie.rating }}
            </div>
          </div>
        </div>

        <div class="movie-info">
          <h3 class="movie-title">{{ movie.title }}</h3>
          <p class="movie-year">{{ movie.year }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import type { Movie } from '@/config/supabase'
import { supabase } from '@/config/supabase'

// 定义props
const props = defineProps<{
  dbMovies?: Movie[]
  isLoading?: boolean
}>()

// 动画相关状态
const originalPosterRect = ref(null)
const originalPosterElement = ref(null)

// 响应式数据
const movies = ref<any[]>([])

// 响应式加载状态
const isLoading = ref(true)

// 监听props变化，更新电影数据
watch(() => props.dbMovies, (newMovies) => {
  console.log('Received new movies in Showcase:', JSON.stringify(newMovies, null, 2));
  if (newMovies && newMovies.length > 0) {
    // 将数据库数据转换为组件需要的格式
      movies.value = newMovies.map(movie => ({
        id: movie.movie_id,
        title: movie.movie_title,
        year: movie.release_year?.toString() || '未知',
        rating: movie.douban_rating || 0,
        poster: movie.cover_url || '/src/爱在落日黄昏时.webp', // 使用默认图片作为fallback
        description: movie.description || '暂无描述',
        douban_url: movie.douban_url || '',
        biliLinks: movie.movie_bilibili_urls && movie.movie_bilibili_urls.length > 0 ?
          movie.movie_bilibili_urls.map(link => ({
            url: link.bilibili_url,
            suspicious: link.suspicious || false,
            id: link.id,
            note: link.note || ''
          })) :
          []
      }))
    isLoading.value = false
  } else if (newMovies && !props.isLoading) {
    // 如果没有电影数据，则清空数组
    movies.value = []
    isLoading.value = false
  }
}, { immediate: true })

// 监听loading状态
watch(() => props.isLoading, (loading) => {
  if (loading !== undefined) {
    isLoading.value = loading
  }
}, { immediate: true })

// 处理电影点击事件
const handleMovieClick = async (movie, event) => {
  console.log('点击了电影:', movie.title)

  // 获取被点击的海报元素
  const posterElement = event.currentTarget.querySelector('.poster-image')
  if (!posterElement) return

  // 获取原始位置和尺寸
  const rect = posterElement.getBoundingClientRect()
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  // 保存原始位置和元素引用（取整数像素值）
  originalPosterRect.value = {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  }
  originalPosterElement.value = posterElement

  // 创建背景模糊层
  const blurBackground = document.createElement('div')
  blurBackground.className = 'blur-background'
  blurBackground.style.position = 'fixed'
  blurBackground.style.top = '0'
  blurBackground.style.left = '0'
  blurBackground.style.width = '100%'
  blurBackground.style.height = '100%'
  blurBackground.style.background = 'rgba(0, 0, 0, 0.5)'
  blurBackground.style.backdropFilter = 'blur(10px)'
  blurBackground.style.zIndex = '9998'
  blurBackground.style.opacity = '0'
  blurBackground.style.transition = 'opacity 0.4s ease'
  blurBackground.style.cursor = 'pointer'
  blurBackground.addEventListener('click', returnToOriginalPosition)
  document.body.appendChild(blurBackground)

  // 创建动画容器
  const animatedContainer = document.createElement('div')
  animatedContainer.className = 'animated-poster-container'
  animatedContainer.style.position = 'fixed'
  animatedContainer.style.left = `${Math.round(rect.left)}px`
  animatedContainer.style.top = `${Math.round(rect.top)}px`
  animatedContainer.style.width = `${Math.round(rect.width)}px`
  animatedContainer.style.height = `${Math.round(rect.height)}px`
  animatedContainer.style.zIndex = '9999'
  animatedContainer.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  animatedContainer.style.display = 'flex'
  animatedContainer.style.alignItems = 'center'
  animatedContainer.style.gap = '0'

  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768

  // 创建动画海报副本（复用原始图片，避免重新请求）
  const animatedPoster = posterElement.cloneNode(true)
  animatedPoster.className = 'animated-poster'
  animatedPoster.style.width = '100%'
  animatedPoster.style.height = '100%'
  animatedPoster.style.borderRadius = isMobile ? '8px' : '8px 0 0 8px' // 移动端全圆角
  animatedPoster.style.objectFit = 'cover'
  animatedPoster.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)'
  animatedPoster.style.flexShrink = '0'
  animatedPoster.style.display = isMobile ? 'none' : 'block' // 移动端隐藏海报

  // 创建文字信息容器
  const textInfo = document.createElement('div')
  textInfo.className = 'animated-text-info'
  textInfo.style.background = 'rgba(255, 255, 255, 0.95)'
  textInfo.style.backdropFilter = 'blur(10px)'
  textInfo.style.padding = '1rem'
  textInfo.style.borderRadius = isMobile ? '8px' : '0 8px 8px 0' // 移动端全圆角
  // textInfo.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)'
  textInfo.style.minWidth = isMobile ? '90vw' : '300px' // 移动端占据更多宽度
  textInfo.style.maxWidth = isMobile ? '90vw' : '350px' // 移动端占据更多宽度
  textInfo.style.height = '100%'
  textInfo.style.maxHeight = '80vh'
  textInfo.style.boxSizing = 'border-box'
  textInfo.style.display = 'flex'
  textInfo.style.flexDirection = 'column'
  textInfo.style.justifyContent = 'flex-start'
  textInfo.style.opacity = '0'
  textInfo.style.width = '0'
  textInfo.style.overflowX = 'hidden'
  textInfo.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  
  // 添加美观的滚动条样式
  textInfo.style.scrollbarWidth = 'thin'
  textInfo.style.scrollbarColor = '#c1c1c1 transparent'
  
  // 为Webkit浏览器添加自定义滚动条样式
  const scrollbarStyle = document.createElement('style')
  scrollbarStyle.textContent = `
    .animated-text-info div::-webkit-scrollbar {
      width: 6px;
    }
    .animated-text-info div::-webkit-scrollbar-track {
      background: transparent;
    }
    .animated-text-info div::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }
    .animated-text-info div::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.4);
    }
  `
  if (!document.querySelector('style[data-scrollbar="animated-text-info"]')) {
    scrollbarStyle.setAttribute('data-scrollbar', 'animated-text-info')
    document.head.appendChild(scrollbarStyle)
  }

  // 创建固定头部区域
  const headerSection = document.createElement('div')
  headerSection.style.cssText = 'flex-shrink: 0; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;'
  
  // 创建标题元素
  const titleElement = document.createElement('h3')
  titleElement.textContent = movie.title
  titleElement.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #333; font-weight: 600; white-space: normal; word-wrap: break-word; line-height: 1.3; opacity: 0; transform: translateY(20px); transition: all 0.6s ease;'
  headerSection.appendChild(titleElement)

  // 创建年份元素
  const yearElement = document.createElement('p')
  yearElement.textContent = movie.year
  yearElement.style.cssText = 'margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem; opacity: 0; transform: translateY(20px); transition: all 0.6s ease;'
  headerSection.appendChild(yearElement)

  // 创建评分容器
  const ratingContainer = document.createElement('div')
  ratingContainer.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0; opacity: 0; transform: translateY(20px); transition: all 0.6s ease;'
  const starSpan = document.createElement('span')
  starSpan.textContent = '★'
  starSpan.style.cssText = 'color: #ffd700; font-size: 1rem;'
  const ratingSpan = document.createElement('span')
  ratingSpan.textContent = movie.rating
  ratingSpan.style.cssText = 'color: #333; font-weight: 600;'
  ratingContainer.appendChild(starSpan)
  ratingContainer.appendChild(ratingSpan)
  headerSection.appendChild(ratingContainer)
  
  textInfo.appendChild(headerSection)
  
  // 创建可滚动内容区域
  const scrollableContent = document.createElement('div')
  scrollableContent.style.cssText = 'flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: #c1c1c1 transparent;'

  // 创建描述元素
  const descElement = document.createElement('p')
  descElement.style.cssText = 'margin: 0 0 1rem 0; color: #555; font-size: 0.85rem; line-height: 1.4; opacity: 0; transform: translateY(20px); transition: all 0.6s ease;'
  
  // 处理描述文本：去除换行符，确保至少显示50个字符
  const cleanDescription = movie.description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  const minLength = 100
  let displayText = ''
  
  if (cleanDescription.length <= minLength) {
    displayText = cleanDescription
  } else {
    displayText = cleanDescription.substring(0, minLength) + '...'
  }
  
  // 创建描述文本节点
  const descTextNode = document.createTextNode(displayText)
  descElement.appendChild(descTextNode)
  
  // 如果有豆瓣链接，添加"详情"链接
  if (movie.douban_url) {
    const detailLink = document.createElement('a')
    detailLink.href = movie.douban_url
    detailLink.target = '_blank'
    detailLink.textContent = '详情'
    detailLink.style.cssText = 'color: #00a1d6; text-decoration: none; margin-left: 4px; font-weight: 500; transition: color 0.3s ease;'
    
    // 添加悬停效果
    detailLink.addEventListener('mouseenter', () => {
      detailLink.style.color = '#ff6699'
      detailLink.style.textDecoration = 'underline'
    })
    detailLink.addEventListener('mouseleave', () => {
      detailLink.style.color = '#00a1d6'
      detailLink.style.textDecoration = 'none'
    })
    
    descElement.appendChild(detailLink)
  }
  
  scrollableContent.appendChild(descElement)

  // 创建B站链接容器
  const linkContainer = document.createElement('div')
  linkContainer.style.cssText = 'margin-bottom: 0.5rem; opacity: 0; transform: translateY(20px); transition: all 0.6s ease;'
  const linkLabel = document.createElement('p')
  linkLabel.textContent = 'B站观看链接:'
  linkLabel.style.cssText = 'margin: 0 0 0.3rem 0; color: #333; font-size: 0.8rem; font-weight: 600;'
  const linkDiv = document.createElement('div')
          if (movie.biliLinks && movie.biliLinks.length > 0) {
          movie.biliLinks.forEach(linkObj => {
            // 为每个链接创建一个容器
            const linkItemContainer = document.createElement('div')
            linkItemContainer.style.cssText = 'display: flex; flex-direction: column; margin-bottom: 10px; background: #f5f5f5; border-radius: 4px;'

            // 创建链接容器，用于显示链接和可能的失效标记
            const linkWrapperDiv = document.createElement('div')
            linkWrapperDiv.style.cssText = 'display: flex; align-items: center; margin-bottom: 8px;'

            // 创建链接元素
            const linkElement = document.createElement('a')
            linkElement.href = linkObj.url
            linkElement.textContent = linkObj.url
            linkElement.target = '_blank'
            linkElement.style.cssText = 'word-break: break-all; color: #00a1d6; text-decoration: none; transition: all 0.3s ease; flex-grow: 1;'

            // 添加链接悬停效果
            linkElement.addEventListener('mouseenter', () => {
              linkElement.style.color = '#ff6699'
              linkElement.style.textDecoration = 'underline'
            })
            linkElement.addEventListener('mouseleave', () => {
              linkElement.style.color = '#00a1d6'
              linkElement.style.textDecoration = 'none'
            })

            linkWrapperDiv.appendChild(linkElement)

            // 如果链接被标记为可疑，添加警告标记
            if (linkObj.suspicious) {
              const suspiciousTag = document.createElement('span')
              suspiciousTag.textContent = '可能失效'
              suspiciousTag.style.cssText = 'background-color: #FCE4EC; color: #E91E63; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 8px; white-space: nowrap;'
              linkWrapperDiv.appendChild(suspiciousTag)
            }

            linkItemContainer.appendChild(linkWrapperDiv)

            // 如果有备注信息，添加备注显示
            if (linkObj.note && linkObj.note.trim()) {
              const noteElement = document.createElement('div')
              noteElement.style.cssText = 'margin: 0px 0px 8px 0px; padding: 6px 8px; background: #e3f2fd; color: #1976d2; border-radius: 4px; font-size: 0.75rem; line-height: 1.3;'
              noteElement.textContent = `备注: ${linkObj.note}`
              linkItemContainer.appendChild(noteElement)
            }

            // 为每个链接创建按钮容器
            const linkButtonContainer = document.createElement('div')
            linkButtonContainer.style.cssText = 'display: flex; gap: 0.5rem;'

            // 为每个链接创建复制按钮
            const linkCopyBtn = document.createElement('button')
            linkCopyBtn.className = 'bili-copy-btn copy-btn'
            linkCopyBtn.style.cssText = 'padding: 0.4rem 0.8rem; background: #fce4ec; color: #e91e63; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; white-space: nowrap;'

            // 创建按钮文字元素
            const linkButtonText = document.createElement('span')
            linkButtonText.className = 'button-text'
            linkButtonText.textContent = '复制'
            linkButtonText.style.cssText = 'margin-left: 6px; opacity: 0; width: 0; transition: all 0.3s ease; overflow: hidden;'

            // 创建复制按钮图标容器
            const linkCopyIconSpan = document.createElement('span')
            linkCopyIconSpan.className = 'btn-icon'
            linkCopyIconSpan.style.marginLeft = '5px'
            linkCopyIconSpan.innerHTML = `<svg t="1749530288180" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7853" width="16" height="16" style="fill: currentColor;"><path d="M96 224l160-160h351.872C643.296 64 672 92.48 672 128.128V192h-64V159.968A31.776 31.776 0 0 0 576.032 128H352v160H160v448.032c0 17.92 14.304 31.968 31.968 31.968H256v64H160.128A63.968 63.968 0 0 1 96 767.872V224z m192-96L192 224h96V128z m64 288l160-160h352.16C899.424 256 928 284.512 928 319.712V896.32A63.744 63.744 0 0 1 864.16 960h-448.32A63.776 63.776 0 0 1 352 896.288V416z m192-96l-128 128h128v-128z m64 192h-192v352.224a32 32 0 0 0 32.224 31.776h383.552A32 32 0 0 0 864 864.224V351.776A32 32 0 0 0 831.776 320H608v192z" p-id="7854"></path></svg>`

            // 创建成功图标容器
            const linkSuccessIconSpan = document.createElement('span')
            linkSuccessIconSpan.className = 'btn-icon'
            linkSuccessIconSpan.style.display = 'none'
            linkSuccessIconSpan.style.marginLeft = '5px'
            linkSuccessIconSpan.innerHTML = `<svg t="1749531073420" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15547" width="16" height="16" style="fill: currentColor;"><path d="M335.872 734.208 108.544 506.88c-24.576-24.576-65.536-24.576-90.112 0-24.576 24.576-24.576 65.536 0 90.112l271.36 271.36c20.48 20.48 52.224 24.576 75.776 10.24 6.144-3.072 11.264-7.168 16.384-11.264l622.592-622.592c24.576-24.576 24.576-65.536 0-90.112-24.576-24.576-65.536-24.576-90.112 0L335.872 734.208z" p-id="15548"></path></svg>`

            linkCopyBtn.appendChild(linkCopyIconSpan)
            linkCopyBtn.appendChild(linkSuccessIconSpan)
            linkCopyBtn.appendChild(linkButtonText)

            // 为每个链接创建标记按钮
            const linkMarkBtn = document.createElement('button')
            linkMarkBtn.className = 'bili-mark-btn mark-btn'

            // 检查链接是否已被标记为可疑
            const isAlreadySuspicious = linkObj.suspicious === true

            // 设置按钮样式，如果已标记为可疑则禁用
            linkMarkBtn.style.cssText = `padding: 0.4rem 0.8rem; background: #fce4ec; color: #e91e63; border: none; border-radius: 4px; font-size: 0.75rem; cursor: ${isAlreadySuspicious ? 'not-allowed' : 'pointer'}; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; white-space: nowrap; opacity: 1;`

            // 如果已标记为可疑，则禁用按钮
            if (isAlreadySuspicious) {
              linkMarkBtn.disabled = true
            }

            // 创建标记按钮文字元素
            const linkMarkButtonText = document.createElement('span')
            linkMarkButtonText.className = 'mark-button-text'
            linkMarkButtonText.textContent = '失效了'
            linkMarkButtonText.style.cssText = 'margin-left: 6px; opacity: 0; width: 0; transition: all 0.3s ease; overflow: hidden;'

            // 创建标记按钮图标容器
            const linkMarkIconSpan = document.createElement('span')
            linkMarkIconSpan.className = 'mark-icon'
            linkMarkIconSpan.style.marginLeft = '5px'
            linkMarkIconSpan.innerHTML = `<svg t="1753159792531" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8435" width="16" height="16" style="fill: #e91e63;"><path d="M415.402667 550.528l-95.445334 95.232a43.776 43.776 0 0 0 0 63.488 44.032 44.032 0 0 0 63.616 0l95.445334-95.232 31.829333 31.744c36.394667 36.266667 36.394667 92.970667 0 129.28l-129.536 129.194667c-36.352 36.266667-93.184 36.266667-129.536 0l-129.578667-129.237334a90.197333 90.197333 0 0 1 0-129.237333l129.578667-129.237333a90.709333 90.709333 0 0 1 129.536 0l34.090667 34.005333z" fill="#e91e63" p-id="8436"></path><path d="M606.293333 487.04l95.488-95.189333a43.776 43.776 0 0 0 0-63.488 44.032 44.032 0 0 0-63.658666 0L542.72 423.594667l-31.829333-31.744a90.197333 90.197333 0 0 1 0-129.28l129.536-129.194667a90.709333 90.709333 0 0 1 129.578666 0l129.536 129.237333c36.352 36.266667 36.352 92.928 0 129.237334l-129.536 129.237333c-36.352 36.266667-93.184 36.266667-129.578666 0l-34.090667-34.005333z" fill="#e91e63" p-id="8437"></path><path d="M156.288 167.381333a44.032 44.032 0 0 1 63.658667 0L283.562667 230.826667a43.776 43.776 0 0 1 0 63.488 44.032 44.032 0 0 1-63.616 0L156.288 230.826667c-15.872-18.133333-15.872-47.616 0-63.488zM390.4 42.666667c25.002667 0 45.482667 20.394667 45.482667 45.354666v90.666667c0 24.96-20.48 45.354667-45.482667 45.354667a45.525333 45.525333 0 0 1-45.44-45.354667V88.021333C344.96 63.061333 365.44 42.666667 390.4 42.666667zM42.666667 391.850667c0-24.96 20.48-45.354667 45.44-45.354667h90.922666c25.002667 0 45.482667 20.394667 45.482667 45.354667 0 24.917333-20.48 45.312-45.482667 45.312h-90.88A45.525333 45.525333 0 0 1 42.666667 391.850667zM858.581333 865.706667a43.776 43.776 0 0 0 0-63.488l-63.616-63.488a44.032 44.032 0 0 0-63.658666 0 43.776 43.776 0 0 0 0 63.488l63.658666 63.488a44.032 44.032 0 0 0 63.616 0zM981.333333 634.453333c0-24.96-20.48-45.354667-45.44-45.354666h-90.922666c-25.002667 0-45.482667 20.394667-45.482667 45.354666 0 24.917333 20.48 45.312 45.482667 45.312h90.88c25.045333 0 45.482667-20.394667 45.482666-45.312zM633.6 981.333333c25.002667 0 45.44-20.394667 45.44-45.354666v-90.666667c0-24.96-20.48-45.354667-45.44-45.354667-25.002667 0-45.482667 20.394667-45.482667 45.354667v90.666667c0 24.96 20.48 45.354667 45.482667 45.354666z" fill="#e91e63" p-id="8438"></path></svg>`

            linkMarkBtn.appendChild(linkMarkIconSpan)
            linkMarkBtn.appendChild(linkMarkButtonText)

            // 添加按钮到按钮容器
            linkButtonContainer.appendChild(linkCopyBtn)
            linkButtonContainer.appendChild(linkMarkBtn)

            // 添加按钮容器到链接容器
            linkItemContainer.appendChild(linkButtonContainer)

            // 添加链接容器到主容器
            linkDiv.appendChild(linkItemContainer)

            // 添加复制按钮事件监听
            linkCopyBtn.addEventListener('click', (e) => {
              e.stopPropagation() // 阻止事件冒泡
              navigator.clipboard.writeText(linkObj.url).then(() => {
                // 切换图标显示
                linkCopyIconSpan.style.display = 'none'
                linkSuccessIconSpan.style.display = 'inline-block'
                linkCopyBtn.classList.add('success')

                // 3秒后恢复原状
                setTimeout(() => {
                  linkCopyIconSpan.style.display = 'inline-block'
                  linkSuccessIconSpan.style.display = 'none'
                  linkCopyBtn.classList.remove('success')
                }, 3000)
              })
            })

            // 添加复制按钮悬停效果
            linkCopyBtn.addEventListener('mouseenter', () => {
              linkCopyBtn.style.background = '#f8bbd9'
              linkButtonText.style.opacity = '1'
              linkButtonText.style.width = '36px'
            })
            linkCopyBtn.addEventListener('mouseleave', () => {
              linkCopyBtn.style.background = '#fce4ec'
              linkButtonText.style.opacity = '0'
              linkButtonText.style.width = '0'
            })

            // 添加标记按钮事件监听
            linkMarkBtn.addEventListener('click', async (e) => {
              e.stopPropagation() // 阻止事件冒泡
              console.log('标记按钮被点击，链接：', linkObj.url)

              try {
                // 检查链接是否已经被标记为可疑
                if (linkObj.suspicious) {
                  console.log('此链接已被标记为可能失效，按钮应该被禁用')
                  return
                }

                // 检查链接是否有ID
                if (!linkObj.id) {
                  console.error('链接缺少ID，无法更新数据库')
                  alert('无法标记此链接，缺少必要的ID')
                  return
                }

                // 显示确认弹窗
                const confirmMark = confirm('其他用户也会看到这个失效标记，是否确认标记？')
                if (!confirmMark) return

                // 显示加载状态
                const originalIconHTML = linkMarkIconSpan.innerHTML
                linkMarkIconSpan.innerHTML = `<svg class="loading-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="fill: #e91e63; animation: spin 1s linear infinite;"><path d="M512 64c247.2 0 448 200.8 448 448S759.2 960 512 960 64 759.2 64 512h64c0 212 172 384 384 384s384-172 384-384-172-384-384-384V64z"></path></svg>`

                // 添加旋转动画样式
                const styleElement = document.createElement('style')
                styleElement.textContent = `
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `
                document.head.appendChild(styleElement)

                // 禁用按钮，防止重复点击
                linkMarkBtn.disabled = true
                linkMarkBtn.style.opacity = '0.7'
                linkMarkBtn.style.cursor = 'not-allowed'

                // 更新数据库中的 suspicious 标志
                const { error } = await supabase
                  .from('movie_bilibili_urls')
                  .update({ suspicious: true })
                  .eq('id', linkObj.id)

                if (error) {
                  console.error('更新链接状态失败:', error)
                  alert('标记失效链接失败，请稍后再试')

                  // 恢复按钮状态
                  linkMarkIconSpan.innerHTML = originalIconHTML
                  linkMarkBtn.disabled = false
                  linkMarkBtn.style.opacity = '1'
                  linkMarkBtn.style.cursor = 'pointer'
                  return
                }

                // 添加可疑标记到 UI
                const suspiciousTag = document.createElement('span')
                suspiciousTag.textContent = '可能失效'
                suspiciousTag.style.cssText = 'background-color: #FCE4EC; color: #E91E63; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 8px; white-space: nowrap;'
                linkWrapperDiv.appendChild(suspiciousTag)

                // 更新本地状态
                linkObj.suspicious = true

                // 保持按钮禁用状态
                linkMarkBtn.disabled = true
                linkMarkBtn.style.cursor = 'not-allowed'
                linkMarkIconSpan.innerHTML = originalIconHTML
              } catch (err) {
                console.error('标记链接失败:', err)
                alert('操作失败，请稍后再试')

                // 恢复按钮状态
                linkMarkIconSpan.innerHTML = originalIconHTML
                linkMarkBtn.disabled = false
                linkMarkBtn.style.opacity = '1'
                linkMarkBtn.style.cursor = 'pointer'
              }
            })

            // 添加标记按钮悬停效果
            linkMarkBtn.addEventListener('mouseenter', () => {
              linkMarkBtn.style.background = '#f8bbd9'
              linkMarkButtonText.style.opacity = '1'
              linkMarkButtonText.style.width = '36px'
            })
            linkMarkBtn.addEventListener('mouseleave', () => {
              linkMarkBtn.style.background = '#fce4ec'
              linkMarkButtonText.style.opacity = '0'
              linkMarkButtonText.style.width = '0'
            })
          })
        } else {
          linkDiv.textContent = '暂无播放链接'
        }
  linkDiv.style.cssText = 'background: #f5f5f5; padding: 0.3rem; border-radius: 4px; font-size: 0.75rem; color: #666; word-break: break-all; margin-bottom: 0.5rem;'
  linkContainer.appendChild(linkLabel)
  linkContainer.appendChild(linkDiv)
  scrollableContent.appendChild(linkContainer)
  
  // 将可滚动内容区域添加到主容器
  textInfo.appendChild(scrollableContent)

  // 创建按钮容器
  const buttonContainer = document.createElement('div')
  buttonContainer.style.cssText = 'display: flex; gap: 0.5rem; opacity: 0; transform: translateY(20px); transition: all 0.6s ease;'

  // 创建复制按钮
  const copyBtn = document.createElement('button')
  copyBtn.className = 'bili-copy-btn copy-btn'
  copyBtn.style.cssText = 'padding: 0.4rem 0.8rem; background: #fce4ec; color: #e91e63; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; white-space: nowrap;'

  // 创建按钮文字元素
  const buttonText = document.createElement('span')
  buttonText.className = 'button-text'
  buttonText.textContent = '复制'
  buttonText.style.cssText = 'margin-left: 6px; opacity: 0; width: 0; transition: all 0.3s ease; overflow: hidden;'

  // 创建复制按钮图标容器
  const copyIconSpan = document.createElement('span')
  copyIconSpan.className = 'btn-icon'
  copyIconSpan.style.marginLeft = '5px'
  copyIconSpan.innerHTML = `<svg t="1749530288180" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7853" width="16" height="16" style="fill: currentColor;"><path d="M96 224l160-160h351.872C643.296 64 672 92.48 672 128.128V192h-64V159.968A31.776 31.776 0 0 0 576.032 128H352v160H160v448.032c0 17.92 14.304 31.968 31.968 31.968H256v64H160.128A63.968 63.968 0 0 1 96 767.872V224z m192-96L192 224h96V128z m64 288l160-160h352.16C899.424 256 928 284.512 928 319.712V896.32A63.744 63.744 0 0 1 864.16 960h-448.32A63.776 63.776 0 0 1 352 896.288V416z m192-96l-128 128h128v-128z m64 192h-192v352.224a32 32 0 0 0 32.224 31.776h383.552A32 32 0 0 0 864 864.224V351.776A32 32 0 0 0 831.776 320H608v192z" p-id="7854"></path></svg>`

  // 创建成功图标容器
  const successIconSpan = document.createElement('span')
  successIconSpan.className = 'btn-icon'
  successIconSpan.style.display = 'none'
  successIconSpan.style.marginLeft = '5px'
  successIconSpan.innerHTML = `<svg t="1749531073420" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15547" width="16" height="16" style="fill: currentColor;"><path d="M335.872 734.208 108.544 506.88c-24.576-24.576-65.536-24.576-90.112 0-24.576 24.576-24.576 65.536 0 90.112l271.36 271.36c20.48 20.48 52.224 24.576 75.776 10.24 6.144-3.072 11.264-7.168 16.384-11.264l622.592-622.592c24.576-24.576 24.576-65.536 0-90.112-24.576-24.576-65.536-24.576-90.112 0L335.872 734.208z" p-id="15548"></path></svg>`

  copyBtn.appendChild(copyIconSpan)
  copyBtn.appendChild(successIconSpan)
  copyBtn.appendChild(buttonText)

  // 创建标记按钮
  const markBtn = document.createElement('button')
  markBtn.className = 'bili-mark-btn mark-btn'
  markBtn.style.cssText = 'padding: 0.4rem 0.8rem; background: #fce4ec; color: #e91e63; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; white-space: nowrap;'

  // 创建标记按钮文字元素
  const markButtonText = document.createElement('span')
  markButtonText.className = 'mark-button-text'
  markButtonText.textContent = '失效了'
  markButtonText.style.cssText = 'margin-left: 6px; opacity: 0; width: 0; transition: all 0.3s ease; overflow: hidden;'

  // 创建标记按钮图标容器
  const markIconSpan = document.createElement('span')
markIconSpan.className = 'mark-icon'
markIconSpan.style.marginLeft = '5px'
  markIconSpan.innerHTML = `<svg t="1753159792531" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8435" width="16" height="16" style="fill: #e91e63;"><path d="M415.402667 550.528l-95.445334 95.232a43.776 43.776 0 0 0 0 63.488 44.032 44.032 0 0 0 63.616 0l95.445334-95.232 31.829333 31.744c36.394667 36.266667 36.394667 92.970667 0 129.28l-129.536 129.194667c-36.352 36.266667-93.184 36.266667-129.536 0l-129.578667-129.237334a90.197333 90.197333 0 0 1 0-129.237333l129.578667-129.237333a90.709333 90.709333 0 0 1 129.536 0l34.090667 34.005333z" fill="#e91e63" p-id="8436"></path><path d="M606.293333 487.04l95.488-95.189333a43.776 43.776 0 0 0 0-63.488 44.032 44.032 0 0 0-63.658666 0L542.72 423.594667l-31.829333-31.744a90.197333 90.197333 0 0 1 0-129.28l129.536-129.194667a90.709333 90.709333 0 0 1 129.578666 0l129.536 129.237333c36.352 36.266667 36.352 92.928 0 129.237334l-129.536 129.237333c-36.352 36.266667-93.184 36.266667-129.578666 0l-34.090667-34.005333z" fill="#e91e63" p-id="8437"></path><path d="M156.288 167.381333a44.032 44.032 0 0 1 63.658667 0L283.562667 230.826667a43.776 43.776 0 0 1 0 63.488 44.032 44.032 0 0 1-63.616 0L156.288 230.826667c-15.872-18.133333-15.872-47.616 0-63.488zM390.4 42.666667c25.002667 0 45.482667 20.394667 45.482667 45.354666v90.666667c0 24.96-20.48 45.354667-45.482667 45.354667a45.525333 45.525333 0 0 1-45.44-45.354667V88.021333C344.96 63.061333 365.44 42.666667 390.4 42.666667zM42.666667 391.850667c0-24.96 20.48-45.354667 45.44-45.354667h90.922666c25.002667 0 45.482667 20.394667 45.482667 45.354667 0 24.917333-20.48 45.312-45.482667 45.312h-90.88A45.525333 45.525333 0 0 1 42.666667 391.850667zM858.581333 865.706667a43.776 43.776 0 0 0 0-63.488l-63.616-63.488a44.032 44.032 0 0 0-63.658666 0 43.776 43.776 0 0 0 0 63.488l63.658666 63.488a44.032 44.032 0 0 0 63.616 0zM981.333333 634.453333c0-24.96-20.48-45.354667-45.44-45.354666h-90.922666c-25.002667 0-45.482667 20.394667-45.482667 45.354666 0 24.917333 20.48 45.312 45.482667 45.312h90.88c25.045333 0 45.482667-20.394667 45.482666-45.312zM633.6 981.333333c25.002667 0 45.44-20.394667 45.44-45.354666v-90.666667c0-24.96-20.48-45.354667-45.44-45.354667-25.002667 0-45.482667 20.394667-45.482667 45.354667v90.666667c0 24.96 20.48 45.354667 45.482667 45.354666z" fill="#e91e63" p-id="8438"></path></svg>`

  markBtn.appendChild(markIconSpan)
  markBtn.appendChild(markButtonText)

  // 添加标记按钮事件监听
  markBtn.addEventListener('click', () => {
    console.log('标记按钮被点击')
    // 这里可以添加标记功能的逻辑
  })

  // 添加标记按钮悬停效果
  markBtn.addEventListener('mouseenter', () => {
    markBtn.style.background = '#f8bbd9'
    markButtonText.style.opacity = '1'
    markButtonText.style.width = '36px'
  })
  markBtn.addEventListener('mouseleave', () => {
    markBtn.style.background = '#fce4ec'
    markButtonText.style.opacity = '0'
    markButtonText.style.width = '0'
  })

  // 不需要额外的按钮容器

  // 存储所有需要动画的元素
  const animatedElements = [titleElement, yearElement, ratingContainer, descElement, linkContainer]

  // 组装容器
  if (!isMobile) {
    animatedContainer.appendChild(animatedPoster)
  }
  animatedContainer.appendChild(textInfo)

  // 隐藏原始海报
  posterElement.style.opacity = '0'

  // 添加到页面
  document.body.appendChild(animatedContainer)

  // 文字信息将与动画同步显示

  // 创建返回按钮
  const returnButton = document.createElement('button')
  returnButton.className = 'return-button'
  returnButton.innerHTML = '×'
  returnButton.style.position = 'absolute'
  returnButton.style.top = '10px'
  returnButton.style.right = '10px'
  returnButton.style.width = '40px'
  returnButton.style.height = '40px'
  returnButton.style.borderRadius = '50%'
  returnButton.style.border = 'none'
  returnButton.style.background = 'rgba(0, 0, 0, 0.7)'
  returnButton.style.color = 'white'
  returnButton.style.fontSize = '24px'
  returnButton.style.cursor = 'pointer'
  returnButton.style.display = 'flex'
  returnButton.style.alignItems = 'center'
  returnButton.style.justifyContent = 'center'
  returnButton.style.zIndex = '100000'
  returnButton.style.opacity = '0'
  returnButton.style.transition = 'all 0.3s ease'
  returnButton.style.transform = 'scale(0.8)'
  returnButton.addEventListener('click', returnToOriginalPosition)

  animatedContainer.appendChild(returnButton)

  // 执行动画效果
  requestAnimationFrame(() => {
    // 显示背景模糊
    blurBackground.style.opacity = '1'

    let newWidth, newHeight, centerX, centerY
    
    if (isMobile) {
      // 移动端：只显示文字信息，占据大部分屏幕宽度
      newWidth = Math.round(window.innerWidth * 0.9)
      newHeight = Math.round(window.innerHeight * 0.6)
      centerX = Math.round((window.innerWidth - newWidth) / 2)
      centerY = Math.round((window.innerHeight - newHeight) / 2)
    } else {
      // 桌面端：计算保持比例的尺寸
      const maxWidth = Math.min(window.innerWidth * 0.8, 600)
      const maxHeight = window.innerHeight * 0.8
      const aspectRatio = rect.width / rect.height

      if (maxWidth / aspectRatio <= maxHeight) {
        newWidth = Math.round(maxWidth)
        newHeight = Math.round(maxWidth / aspectRatio)
      } else {
        newHeight = Math.round(maxHeight)
        newWidth = Math.round(maxHeight * aspectRatio)
      }

      // 计算居中位置，考虑文字区域向左偏移
      const textAreaWidth = 350 // 文字区域的大概宽度
      centerX = Math.round((window.innerWidth - newWidth) / 2 - textAreaWidth / 4)
      centerY = Math.round((window.innerHeight - newHeight) / 2)
    }

    animatedContainer.style.left = `${centerX}px`
    animatedContainer.style.top = `${centerY}px`
    animatedContainer.style.width = `${newWidth}px`
    animatedContainer.style.height = `${newHeight}px`
    animatedContainer.style.transform = 'scale(1)'
    animatedContainer.style.zIndex = '99999'

    // 同步显示文字信息容器
    textInfo.style.opacity = '1'
    textInfo.style.width = textInfo.style.maxWidth

    // 逐个显示文字元素
    animatedElements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = '1'
        element.style.transform = 'translateY(0)'
      }, 0 + index * 100) // 容器展开后延迟500ms开始，每个元素间隔100ms
    })

    // 显示返回按钮
    setTimeout(() => {
      returnButton.style.opacity = '1'
      returnButton.style.transform = 'scale(1)'
    }, 400)
  })
}

// 返回原位置
const returnToOriginalPosition = () => {
  const animatedContainer = document.querySelector('.animated-poster-container')
  const textInfo = animatedContainer?.querySelector('.animated-text-info')
  const blurBackground = document.querySelector('.blur-background')
  const returnButton = document.querySelector('.return-button')

  if (animatedContainer && animatedContainer.parentNode && originalPosterRect.value && originalPosterElement.value) {
    // 隐藏背景模糊
    if (blurBackground) {
      blurBackground.style.opacity = '0'
    }

    // 同步隐藏文字信息
    if (textInfo) {
      textInfo.style.opacity = '0'
      textInfo.style.width = '0'
    }

    // 立即隐藏返回按钮
    if (returnButton) {
      returnButton.style.opacity = '0'
      returnButton.style.transform = 'scale(0.8)'
    }

    // 执行反向动画：回到原始位置（取整数像素值）
    animatedContainer.style.left = `${Math.round(originalPosterRect.value.left)}px`
    animatedContainer.style.top = `${Math.round(originalPosterRect.value.top)}px`
    animatedContainer.style.width = `${Math.round(originalPosterRect.value.width)}px`
    animatedContainer.style.height = `${Math.round(originalPosterRect.value.height)}px`
    animatedContainer.style.transform = 'scale(1)'
    animatedContainer.style.zIndex = '9999'

    // 动画完成后移除动画容器并恢复原始海报
    setTimeout(() => {
      // 先移除动画容器
      if (animatedContainer.parentNode) {
        document.body.removeChild(animatedContainer)
      }
      // 移除背景模糊
      if (blurBackground && blurBackground.parentNode) {
        document.body.removeChild(blurBackground)
      }
      // 立即恢复原始海报的显示，禁用transition避免闪烁
      if (originalPosterElement.value) {
        originalPosterElement.value.style.transition = 'none'
        originalPosterElement.value.style.opacity = '1'
        // 强制重绘后恢复transition
        requestAnimationFrame(() => {
          if (originalPosterElement.value) {
            originalPosterElement.value.style.transition = 'opacity 0.3s ease'
          }
        })
      }
      // 清理引用
      originalPosterRect.value = null
      originalPosterElement.value = null
    }, 400) // 与动画时长一致
  } else {
    // 如果没有动画容器或原始位置信息，直接移除
    if (animatedContainer && animatedContainer.parentNode) {
      document.body.removeChild(animatedContainer)
    }
  }
}

// 生命周期
onMounted(() => {
  console.log('电影展示组件已加载')
  console.log('电影数据:', movies.value)
})
</script>

<style scoped>
.no-data-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
  color: #888;
  font-size: 1.2rem;
}
.movie-showcase {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.showcase-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1, #213547);
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--vp-c-text-2, #5a5a5a);
  margin: 0;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 150px));
  gap: 1rem;
  padding: 1rem 0;
  justify-content: center;
}

.movie-card {
  /* background: white; */
  border-radius: 12px;
  overflow: hidden;
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); */
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
}



.movie-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
  border-radius: 8px;
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); */
  transition: transform 0.3s ease;
}



.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}



.movie-rating {
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}



.rating-star {
  color: #ffd700;
}

/* 动画海报样式 */
.animated-poster {
  pointer-events: none;
  user-select: none;
  will-change: transform, left, top, width, height;
}

/* 返回按钮样式 */
.return-button {
  transition: all 0.3s ease !important;
}

.return-button:hover {
  background: rgba(0, 0, 0, 0.9) !important;
  transform: scale(1.1) !important;
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-brand-1, #646cff);
  transition: all 0.3s ease;
}

.play-button:hover {
  background: white;
  transform: scale(1.1);
}

.play-button svg {
  width: 24px;
  height: 24px;
  margin-left: 2px;
}

.movie-info {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.movie-title {
  font-size: 1.1rem;
  /* font-weight: 600; */
  color: #333;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-year {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.movie-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.rating-score {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-brand-1, #646cff);
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.star.filled {
  color: #ffd700;
}



/* 响应式设计 */
/* 骨架屏样式 */
.skeleton-card {
  pointer-events: none;
}

.skeleton-poster {
  position: relative;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: flex-end;
  padding: 0.5rem;
}

.skeleton-rating {
  width: 40px;
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  width: 80%;
  height: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-year {
  width: 50%;
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 768px) {
  .movie-showcase {
    padding: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .movie-grid {
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
}



/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 按钮基础样式 */
.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 32px;
  gap: 0;
  transition: all 0.3s ease;
}

/* 文字始终隐藏 */
.btn-text {
  display: none;
}



</style>
