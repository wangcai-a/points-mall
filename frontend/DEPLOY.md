# 学生积分商城 - 前端部署启动文档

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

## 项目安装

### 1. 进入前端目录

```bash
cd frontend
```

### 2. 安装依赖

使用 npm 安装项目依赖：

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

## 开发环境启动

### 启动开发服务器

```bash
npm run dev
```

启动后，访问地址：`http://localhost:5173`

### 配置后端 API 代理

项目已配置 API 代理，确保开发环境下请求会转发到后端服务。

如需修改代理配置，编辑 `vite.config.ts` 文件：

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // 后端地址
        changeOrigin: true,
      },
    },
  },
});
```

## 生产环境构建

### 1. 构建生产版本

```bash
npm run build
```

构建完成后，产物会输出到 `dist` 目录。

### 2. 预览生产版本

```bash
npm run preview
```

预览地址：`http://localhost:4173`

## 项目结构说明

```
frontend/
├── src/
│   ├── components/      # 组件目录
│   │   ├── layout/      # 布局组件
│   │   └── ui/          # UI基础组件
│   ├── pages/          # 页面目录
│   │   ├── auth/       # 认证页面
│   │   ├── student/    # 学生端页面
│   │   └── teacher/    # 教师端页面
│   ├── services/       # API服务
│   ├── store/          # 状态管理
│   ├── types/          # TypeScript类型
│   ├── App.tsx         # 应用入口
│   └── main.tsx        # 主入口
├── public/             # 静态资源
├── dist/               # 构建输出目录
└── package.json        # 项目配置
```

## 部署说明

### 静态部署

构建后的 `dist` 目录可以直接部署到任意静态资源服务器：

- Nginx
- Apache
- CDN
- Vercel
- Netlify

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 可用脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产版本 |
| `npm run lint` | 代码检查 |
| `npm run lint:fix` | 自动修复代码问题 |

## 常见问题

### 1. 依赖安装失败

```bash
# 清除缓存后重试
npm cache clean --force
rm -rf node_modules
npm install
```

### 2. TypeScript 类型错误

项目使用严格 TypeScript 模式，确保代码符合类型规范。

### 3. API 请求失败

- 检查后端服务是否启动
- 确认 `vite.config.ts` 中的代理配置正确
- 检查浏览器控制台的网络请求详情

## 技术栈

- **框架**: React 18
- **构建工具**: Vite 6
- **语言**: TypeScript 5
- **样式**: TailwindCSS 3
- **路由**: React Router 6
- **HTTP**: Axios
- **图标**: Lucide React
