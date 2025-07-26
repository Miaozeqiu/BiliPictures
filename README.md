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
   
   复制 `src/config/database-example.ts` 为 `src/config/database.ts`，并配置您的数据库连接信息。

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **构建生产版本**
   ```bash
   npm run build
   ```

## 🚀 部署


### Netlify 部署

1. 构建项目：`npm run build`
2. 将 `dist` 目录上传到 Netlify
3. 配置重定向规则（已包含在 `netlify.toml` 中）



## 🎨 界面预览

### 桌面端
- 响应式网格布局
- 电影海报展示
- 详细信息弹窗
- 智能搜索和筛选

### 移动端
- 优化的触摸体验
- 自适应布局
- 简化的操作界面


## 📄 许可证

MIT License 


## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱: miaozeqiu3142@outlook.com

---

⭐ 如果这个项目对您有帮助，请给它一个 Star！