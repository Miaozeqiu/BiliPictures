import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://s.bilipictures.top'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qZmhoand5ZHhibGhyZWF0bWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODgzODIsImV4cCI6MjA2Nzc2NDM4Mn0.vdpICawfu-dUMsM1B7oArCuS-WCrLutsUS0et1e4yNg'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 数据库表类型定义
export interface Movie {
  movie_id: number
  movie_title: string
  original_title?: string
  type: '电影' | '剧集' | '纪录片' | '动漫'
  description?: string
  release_year?: number
  release_date?: string
  cover_url?: string
  douban_rating?: number
  douban_url?: string
  bilibili_url?: string
  region?: string
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
