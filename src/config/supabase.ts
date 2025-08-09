import { createClient } from '@supabase/supabase-js'

// 从环境变量获取Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 验证环境变量是否存在
if (!supabaseUrl || !supabaseKey) {
  throw new Error('缺少必要的Supabase环境变量：VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// 数据库表类型定义
export interface MovieBilibiliUrl {
  id: number
  bilibili_url: string
  suspicious?: boolean
  note?: string
}

export interface Movie {
  movie_id: number
  movie_title: string
  original_title?: string
  aka?: string
  type: '电影' | '剧集' | '纪录片' | '动漫'
  description?: string
  release_year?: number
  release_date?: string
  cover_url?: string
  douban_rating?: number
  douban_url?: string
  bilibili_url?: string
  region?: string
  movie_bilibili_urls?: MovieBilibiliUrl[]
}

export interface Tag {
  tag_id: number
  tag_name: string
}

export interface MovieTag {
  movie_id: number
  tag_id: number
}

// 查询参数类型
export interface MovieQueryParams {
  type?: '电影' | '剧集' | '纪录片' | '动漫'
  tag_ids?: number[]
  region?: string
  min_rating?: number
  max_rating?: number
  release_year?: number
  search?: string
  sort_by?: 'movie_title' | 'release_year' | 'douban_rating' | 'release_date'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}
