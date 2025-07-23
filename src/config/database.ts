import { supabase } from './supabase'
import type { Movie, Tag, MovieTag, MovieQueryParams } from './supabase'

/**
 * 数据库操作中间件类
 */
export class DatabaseService {
  /**
   * 获取所有电影列表，支持筛选和排序
   * @param params 查询参数
   * @returns Promise<Movie[]>
   */
  static async getMovies(params: MovieQueryParams = {}): Promise<Movie[]> {
    let query = supabase
      .from('movies')
      .select(`
        *,
        movie_bilibili_urls ( id, bilibili_url, suspicious )
      `)
      // 只返回包含bilibili_url的电影
      .not('movie_bilibili_urls', 'is', null)

    // 筛选条件
    if (params.type) {
      query = query.eq('type', params.type)
    }

    if (params.region) {
      query = query.ilike('region', `%${params.region}%`)
    }

    if (params.min_rating !== undefined) {
      query = query.gte('douban_rating', params.min_rating)
    }

    if (params.max_rating !== undefined) {
      query = query.lte('douban_rating', params.max_rating)
    }

    if (params.release_year) {
      query = query.eq('release_year', params.release_year)
    }

    if (params.search) {
      query = query.or(`movie_title.ilike.%${params.search}%,original_title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
    }

    // 排序
    if (params.sort_by) {
      const ascending = params.sort_order === 'asc'
      query = query.order(params.sort_by, { ascending })
    } else {
      // 默认按电影ID排序
      query = query.order('movie_id', { ascending: true })
    }

    // 分页
    if (params.limit) {
      query = query.limit(params.limit)
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('获取电影列表失败:', error)
      throw new Error(`获取电影列表失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 根据标签筛选电影
   * @param tagIds 标签ID数组
   * @param params 其他查询参数
   * @returns Promise<Movie[]>
   */
  static async getMoviesByTags(tagIds: number[], params: MovieQueryParams = {}): Promise<Movie[]> {
    // 先获取包含指定标签的电影ID
    const { data: movieTags, error: tagError } = await supabase
      .from('movie_tags')
      .select('movie_id')
      .in('tag_id', tagIds)

    if (tagError) {
      console.error('获取电影标签失败:', tagError)
      throw new Error(`获取电影标签失败: ${tagError.message}`)
    }

    if (!movieTags || movieTags.length === 0) {
      return []
    }

    const movieIds = movieTags.map(mt => mt.movie_id)

    // 构建查询
    let query = supabase
      .from('movies')
      .select(`
        *,
        movie_bilibili_urls ( id, bilibili_url, suspicious )
      `)
      .in('movie_id', movieIds)
      // 只返回包含bilibili_url的电影
      .not('movie_bilibili_urls', 'is', null)

    // 应用其他筛选条件
    if (params.type) {
      query = query.eq('type', params.type)
    }

    if (params.region) {
      query = query.ilike('region', `%${params.region}%`)
    }

    if (params.min_rating !== undefined) {
      query = query.gte('douban_rating', params.min_rating)
    }

    if (params.max_rating !== undefined) {
      query = query.lte('douban_rating', params.max_rating)
    }

    if (params.release_year) {
      query = query.eq('release_year', params.release_year)
    }

    if (params.search) {
      query = query.or(`movie_title.ilike.%${params.search}%,original_title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
    }

    // 排序
    if (params.sort_by) {
      const ascending = params.sort_order === 'asc'
      query = query.order(params.sort_by, { ascending })
    } else {
      query = query.order('movie_id', { ascending: true })
    }

    // 分页
    if (params.limit) {
      query = query.limit(params.limit)
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('根据标签获取电影失败:', error)
      throw new Error(`根据标签获取电影失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 根据ID获取单个电影
   * @param movieId 电影ID
   * @returns Promise<Movie | null>
   */
  static async getMovieById(movieId: number): Promise<Movie | null> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('movie_id', movieId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // 未找到记录
      }
      console.error('获取电影详情失败:', error)
      throw new Error(`获取电影详情失败: ${error.message}`)
    }

    return data
  }

  /**
   * 获取电影的标签
   * @param movieId 电影ID
   * @returns Promise<Tag[]>
   */
  static async getMovieTags(movieId: number): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('movie_tags')
      .select(`
        tags (
          tag_id,
          tag_name
        )
      `)
      .eq('movie_id', movieId)

    if (error) {
      console.error('获取电影标签失败:', error)
      throw new Error(`获取电影标签失败: ${error.message}`)
    }

    return data?.map(item => item.tags).filter(Boolean) || []
  }

  /**
   * 获取所有标签
   * @returns Promise<Tag[]>
   */
  static async getAllTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('tag_name', { ascending: true })

    if (error) {
      console.error('获取标签列表失败:', error)
      throw new Error(`获取标签列表失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 根据名称搜索标签
   * @param tagName 标签名称
   * @returns Promise<Tag[]>
   */
  static async searchTags(tagName: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('tag_name', `%${tagName}%`)
      .order('tag_name', { ascending: true })

    if (error) {
      console.error('搜索标签失败:', error)
      throw new Error(`搜索标签失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 获取电影统计信息
   * @returns Promise<{total: number, by_type: Record<string, number>}>
   */
  static async getMovieStats(): Promise<{total: number, by_type: Record<string, number>}> {
    // 获取总数
    const { count: total, error: totalError } = await supabase
      .from('movies')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('获取电影总数失败:', totalError)
      throw new Error(`获取电影总数失败: ${totalError.message}`)
    }

    // 按类型统计
    const { data: typeStats, error: typeError } = await supabase
      .from('movies')
      .select('type')

    if (typeError) {
      console.error('获取电影类型统计失败:', typeError)
      throw new Error(`获取电影类型统计失败: ${typeError.message}`)
    }

    const by_type: Record<string, number> = {}
    typeStats?.forEach(movie => {
      by_type[movie.type] = (by_type[movie.type] || 0) + 1
    })

    return {
      total: total || 0,
      by_type
    }
  }
}

// 导出便捷方法
export const getMovies = DatabaseService.getMovies.bind(DatabaseService)
export const getMoviesByTags = DatabaseService.getMoviesByTags.bind(DatabaseService)
export const getMovieById = DatabaseService.getMovieById.bind(DatabaseService)
export const getMovieTags = DatabaseService.getMovieTags.bind(DatabaseService)
export const getAllTags = DatabaseService.getAllTags.bind(DatabaseService)
export const searchTags = DatabaseService.searchTags.bind(DatabaseService)
export const getMovieStats = DatabaseService.getMovieStats.bind(DatabaseService)

// 导出类型
export type { MovieQueryParams }

// 默认导出
export default DatabaseService
