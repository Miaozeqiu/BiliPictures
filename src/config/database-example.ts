/**
 * 数据库中间件使用示例
 * 展示如何使用DatabaseService进行各种查询操作
 */

import { DatabaseService, MovieQueryParams } from './database'
import type { Movie, Tag } from './supabase'

/**
 * 使用示例类
 */
export class DatabaseExamples {
  /**
   * 示例1: 获取所有电影
   */
  static async getAllMoviesExample(): Promise<Movie[]> {
    try {
      const movies = await DatabaseService.getMovies()
      console.log('所有电影:', movies)
      return movies
    } catch (error) {
      console.error('获取所有电影失败:', error)
      return []
    }
  }

  /**
   * 示例2: 按类型筛选电影
   */
  static async getMoviesByTypeExample(type: 'movie' | 'tv_series' | 'documentary' | 'anime'): Promise<Movie[]> {
    try {
      const params: MovieQueryParams = {
        type: type,
        sort_by: 'douban_rating',
        sort_order: 'desc',
        limit: 10
      }
      const movies = await DatabaseService.getMovies(params)
      console.log(`${type}类型的电影:`, movies)
      return movies
    } catch (error) {
      console.error(`获取${type}类型电影失败:`, error)
      return []
    }
  }

  /**
   * 示例3: 按评分筛选电影
   */
  static async getHighRatedMoviesExample(): Promise<Movie[]> {
    try {
      const params: MovieQueryParams = {
        min_rating: 8.0,
        sort_by: 'douban_rating',
        sort_order: 'desc',
        limit: 20
      }
      const movies = await DatabaseService.getMovies(params)
      console.log('高评分电影(8.0+):', movies)
      return movies
    } catch (error) {
      console.error('获取高评分电影失败:', error)
      return []
    }
  }

  /**
   * 示例4: 搜索电影
   */
  static async searchMoviesExample(searchTerm: string): Promise<Movie[]> {
    try {
      const params: MovieQueryParams = {
        search: searchTerm,
        sort_by: 'douban_rating',
        sort_order: 'desc'
      }
      const movies = await DatabaseService.getMovies(params)
      console.log(`搜索"${searchTerm}"的结果:`, movies)
      return movies
    } catch (error) {
      console.error(`搜索"${searchTerm}"失败:`, error)
      return []
    }
  }

  /**
   * 示例5: 按年份和地区筛选
   */
  static async getMoviesByYearAndRegionExample(year: number, region: string): Promise<Movie[]> {
    try {
      const params: MovieQueryParams = {
        release_year: year,
        region: region,
        sort_by: 'douban_rating',
        sort_order: 'desc'
      }
      const movies = await DatabaseService.getMovies(params)
      console.log(`${year}年${region}地区的电影:`, movies)
      return movies
    } catch (error) {
      console.error(`获取${year}年${region}地区电影失败:`, error)
      return []
    }
  }

  /**
   * 示例6: 分页获取电影
   */
  static async getMoviesWithPaginationExample(page: number = 1, pageSize: number = 10): Promise<Movie[]> {
    try {
      const params: MovieQueryParams = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        sort_by: 'release_date',
        sort_order: 'desc'
      }
      const movies = await DatabaseService.getMovies(params)
      console.log(`第${page}页电影(每页${pageSize}条):`, movies)
      return movies
    } catch (error) {
      console.error(`获取第${page}页电影失败:`, error)
      return []
    }
  }

  /**
   * 示例7: 根据标签获取电影
   */
  static async getMoviesByTagsExample(tagIds: number[]): Promise<Movie[]> {
    try {
      const params: MovieQueryParams = {
        sort_by: 'douban_rating',
        sort_order: 'desc'
      }
      const movies = await DatabaseService.getMoviesByTags(tagIds, params)
      console.log(`标签ID为[${tagIds.join(', ')}]的电影:`, movies)
      return movies
    } catch (error) {
      console.error(`根据标签获取电影失败:`, error)
      return []
    }
  }

  /**
   * 示例8: 获取电影详情和标签
   */
  static async getMovieDetailsExample(movieId: number): Promise<{movie: Movie | null, tags: Tag[]}> {
    try {
      const [movie, tags] = await Promise.all([
        DatabaseService.getMovieById(movieId),
        DatabaseService.getMovieTags(movieId)
      ])

      console.log(`电影ID ${movieId} 的详情:`, movie)
      console.log(`电影ID ${movieId} 的标签:`, tags)

      return { movie, tags }
    } catch (error) {
      console.error(`获取电影ID ${movieId} 详情失败:`, error)
      return { movie: null, tags: [] }
    }
  }

  /**
   * 示例9: 获取所有标签
   */
  static async getAllTagsExample(): Promise<Tag[]> {
    try {
      const tags = await DatabaseService.getAllTags()
      console.log('所有标签:', tags)
      return tags
    } catch (error) {
      console.error('获取所有标签失败:', error)
      return []
    }
  }

  /**
   * 示例10: 搜索标签
   */
  static async searchTagsExample(tagName: string): Promise<Tag[]> {
    try {
      const tags = await DatabaseService.searchTags(tagName)
      console.log(`搜索标签"${tagName}"的结果:`, tags)
      return tags
    } catch (error) {
      console.error(`搜索标签"${tagName}"失败:`, error)
      return []
    }
  }

  /**
   * 示例11: 获取电影统计信息
   */
  static async getMovieStatsExample(): Promise<{total: number, by_type: Record<string, number>}> {
    try {
      const stats = await DatabaseService.getMovieStats()
      console.log('电影统计信息:', stats)
      return stats
    } catch (error) {
      console.error('获取电影统计信息失败:', error)
      return { total: 0, by_type: {} }
    }
  }

  /**
   * 示例12: 复合查询 - 获取特定类型、高评分、包含特定标签的电影
   */
  static async getComplexQueryExample(): Promise<Movie[]> {
    try {
      // 假设我们要查找:
      // - 电影类型
      // - 评分8.0以上
      // - 2020年以后的
      // - 按评分降序排列
      // - 限制10条
      const params: MovieQueryParams = {
        type: 'movie',
        min_rating: 8.0,
        release_year: 2020,
        sort_by: 'douban_rating',
        sort_order: 'desc',
        limit: 10
      }

      const movies = await DatabaseService.getMovies(params)
      console.log('复合查询结果:', movies)
      return movies
    } catch (error) {
      console.error('复合查询失败:', error)
      return []
    }
  }
}

// 导出便捷方法
export const {
  getAllMoviesExample,
  getMoviesByTypeExample,
  getHighRatedMoviesExample,
  searchMoviesExample,
  getMoviesByYearAndRegionExample,
  getMoviesWithPaginationExample,
  getMoviesByTagsExample,
  getMovieDetailsExample,
  getAllTagsExample,
  searchTagsExample,
  getMovieStatsExample,
  getComplexQueryExample
} = DatabaseExamples
