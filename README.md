# BiliPictures

一个公共的B站收藏夹项目，专注于收集和分享优质的影视作品B站链接。

## 🎬 项目简介

BiliPictures 是一个公共的B站收藏夹项目，专注于收集和分享优质的影视作品B站链接。通过简洁的界面展示和分类功能，用户可以快速找到感兴趣的影视内容，并直接跳转到B站观看。

## ✨ 功能特性

- 🎯 **精选电影推荐** - 精心挑选的高质量影视作品
- 🔍 **搜索** - 快速搜索您感兴趣的电影
- 🏷️ **标签筛选** - 按类型、年份等多维度筛选
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化界面** - 简洁美观的用户界面
- 🔗 **观看链接** - 提供 B站 等平台的观看链接


## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **路由管理**: Vue Router
- **数据库**: Supabase
- **样式**: CSS3 + 响应式设计
- **部署**: Vercel / Netlify

## 📦 安装与运行

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/Miaozeqiu/BiliPictures.git
   cd bili-pictures
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
  参考.env.example文件，创建.env文件并配置您的数据库连接信息。
  您需要配置的环境变量包括：
  - `VITE_SUPABASE_URL`：您的Supabase项目URL
  - `VITE_SUPABASE_ANON_KEY`：您的Supabase匿名密钥

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **构建生产版本**
   ```bash
   npm run build
   ```
6. supabase 创建表

```sql
create table public.movie_bilibili_urls (
  id serial not null,
  movie_id integer not null,
  bilibili_url character varying(255) not null,
  suspicious boolean null default false,
  note text null,
  constraint movie_bilibili_urls_pkey primary key (id),
  constraint fk_movie_id foreign KEY (movie_id) references movies (movie_id) on delete CASCADE,
  constraint movie_bilibili_urls_note_check check ((length(note) <= 50))
) TABLESPACE pg_default;

create table public.movie_tags (
  movie_id integer not null,
  tag_id integer not null,
  constraint movie_tags_pkey primary key (movie_id, tag_id),
  constraint movie_tags_movie_id_fkey foreign KEY (movie_id) references movies (movie_id) on delete CASCADE,
  constraint movie_tags_tag_id_fkey foreign KEY (tag_id) references tags (tag_id)
) TABLESPACE pg_default;

create table public.movies (
  movie_id serial not null,
  movie_title character varying(255) not null,
  original_title character varying(255) null,
  type public.movie_type not null,
  description text null,
  release_year integer null,
  release_date date null,
  cover_url character varying null,
  douban_rating numeric(3, 1) null,
  douban_url character varying null,
  region text null,
  aka text null,
  constraint movies_pkey primary key (movie_id)
) TABLESPACE pg_default;

create table public.tags (
  tag_id serial not null,
  tag_name character varying(255) not null,
  constraint tags_pkey primary key (tag_id),
  constraint tags_tag_name_key unique (tag_name)
) TABLESPACE pg_default;
```

## 🚀 部署

### Netlify 部署
1. 克隆项目，并在Netlify中导入项目
2. 配置环境变量：
   - 在Netlify控制台中，为您的站点配置环境变量。
   - 参考.env.example文件，添加您的Supabase环境变量。
   - 您需要添加的环境变量包括：
     - `VITE_SUPABASE_URL`：您的Supabase项目URL
     - `VITE_SUPABASE_ANON_KEY`：您的Supabase匿名密钥


## 📄 许可证

MIT License 


## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱: miaozeqiu3142@outlook.com

---

⭐ 如果这个项目对您有帮助，请给它一个 Star！