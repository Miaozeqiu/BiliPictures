# Supabase 数据库中间件

这个中间件提供了连接 Supabase 数据库的功能，支持电影数据的读取、筛选和排序操作。

## 文件结构

- `supabase.ts` - Supabase 客户端配置和类型定义
- `database.ts` - 数据库操作中间件主文件
- `database-example.ts` - 使用示例
- `README.md` - 说明文档

## 数据库表结构

### movies 表
- `movie_id` - 电影ID (主键)
- `movie_title` - 电影标题
- `original_title` - 原始标题
- `type` - 类型 (movie/tv_series/documentary/anime)
- `description` - 描述
- `release_year` - 发行年份
- `release_date` - 发行日期
- `cover_url` - 封面图片URL
- `douban_rating` - 豆瓣评分
- `douban_url` - 豆瓣链接
- `region` - 地区

### tags 表
- `tag_id` - 标签ID (主键)
- `tag_name` - 标签名称

### movie_tags 表
- `movie_id` - 电影ID (外键)
- `tag_id` - 标签ID (外键)

## 基本使用

### 1. 导入中间件

```typescript
import { DatabaseService } from '@/config/database'
// 或者导入便捷方法
import { getMovies, getMovieById, getAllTags } from '@/config/database'
```

### 2. 获取所有电影

```typescript
const movies = await DatabaseService.getMovies()
console.log(movies)
```

### 3. 筛选和排序

```typescript
const params = {
  type: 'movie',           // 筛选电影类型
  min_rating: 8.0,         // 最低评分
  region: '美国',          // 地区筛选
  sort_by: 'douban_rating', // 按评分排序
  sort_order: 'desc',      // 降序
  limit: 10                // 限制10条
}

const movies = await DatabaseService.getMovies(params)
```

### 4. 搜索电影

```typescript
const searchResults = await DatabaseService.getMovies({
  search: '复仇者联盟',
  sort_by: 'douban_rating',
  sort_order: 'desc'
})
```

### 5. 根据标签筛选

```typescript
const tagIds = [1, 2, 3] // 标签ID数组
const movies = await DatabaseService.getMoviesByTags(tagIds, {
  sort_by: 'douban_rating',
  sort_order: 'desc'
})
```

### 6. 获取电影详情

```typescript
const movie = await DatabaseService.getMovieById(1)
const tags = await DatabaseService.getMovieTags(1)
```

### 7. 分页查询

```typescript
const page = 1
const pageSize = 20
const movies = await DatabaseService.getMovies({
  limit: pageSize,
  offset: (page - 1) * pageSize,
  sort_by: 'release_date',
  sort_order: 'desc'
})
```

## 查询参数说明

### MovieQueryParams 接口

```typescript
interface MovieQueryParams {
  type?: 'movie' | 'tv_series' | 'documentary' | 'anime'  // 电影类型
  tag_ids?: number[]           // 标签ID数组
  region?: string              // 地区 (模糊匹配)
  min_rating?: number          // 最低评分
  max_rating?: number          // 最高评分
  release_year?: number        // 发行年份
  search?: string              // 搜索关键词 (标题、原标题、描述)
  sort_by?: 'movie_title' | 'release_year' | 'douban_rating' | 'release_date'  // 排序字段
  sort_order?: 'asc' | 'desc'  // 排序方向
  limit?: number               // 限制条数
  offset?: number              // 偏移量
}
```

## 可用方法

### DatabaseService 类方法

- `getMovies(params?)` - 获取电影列表
- `getMoviesByTags(tagIds, params?)` - 根据标签获取电影
- `getMovieById(movieId)` - 获取单个电影
- `getMovieTags(movieId)` - 获取电影标签
- `getAllTags()` - 获取所有标签
- `searchTags(tagName)` - 搜索标签
- `getMovieStats()` - 获取电影统计信息

### 便捷导出方法

所有 DatabaseService 的静态方法都可以直接导入使用：

```typescript
import { 
  getMovies, 
  getMovieById, 
  getAllTags, 
  getMovieStats 
} from '@/config/database'
```

## 错误处理

所有方法都会抛出错误，建议使用 try-catch 处理：

```typescript
try {
  const movies = await getMovies()
  // 处理成功结果
} catch (error) {
  console.error('获取电影失败:', error)
  // 处理错误
}
```

## 使用示例

查看 `database-example.ts` 文件获取更多详细的使用示例。

## 注意事项

1. 确保已安装 `@supabase/supabase-js` 依赖
2. 数据库连接信息已在 `supabase.ts` 中配置
3. 所有查询都是异步操作，需要使用 await 或 Promise
4. 搜索功能支持模糊匹配
5. 分页查询建议设置合理的 limit 值以提高性能