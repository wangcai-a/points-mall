# 积分商城 - 服务启动部署文档

## 目录
1. [环境要求](#1-环境要求)
2. [后端服务启动](#2-后端服务启动)
3. [前端服务启动](#3-前端服务启动)
4. [服务验证](#4-服务验证)
5. [默认账号与数据](#5-默认账号与数据)
6. [项目结构](#6-项目结构)
7. [技术栈](#7-技术栈)
8. [生产部署](#8-生产部署)
9. [常见问题](#9-常见问题)
10. [更新日志](#10-更新日志)

---

## 1. 环境要求

### 1.1 后端环境
| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Python | 3.10+ | 后端开发语言 |
| SQLite | 3.x | 内置数据库，无需额外安装 |

### 1.2 前端环境
| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | 前端运行时 |
| npm | >= 9.0.0 | 包管理器 |

---

## 2. 后端服务启动

### 2.1 进入后端目录
```bash
cd D:\code\积分商城\backend
```

### 2.2 安装依赖（首次运行）
```bash
python -m pip install -r requirements.txt
```

### 2.3 配置说明

**环境变量配置**（`backend/.env`）：
```env
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 2.4 启动命令

**开发模式**（推荐）：
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**生产模式**：
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**使用虚拟环境（Windows）**：
```powershell
$env:PYTHONIOENCODING='utf-8'
$env:PYTHONUTF8='1'
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**参数说明**：
- `--host 0.0.0.0`: 允许外部访问
- `--port 8000`: 监听端口为 8000
- `--reload`: 自动重载（开发环境使用）
- `--workers 4`: 使用多进程（生产环境使用）

---

## 3. 前端服务启动

### 3.1 进入前端目录
```bash
cd D:\code\积分商城\frontend
```

### 3.2 安装依赖（首次运行）
```bash
npm install
```

### 3.3 配置说明

**API 代理配置**（`vite.config.ts`）：
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

### 3.4 启动命令

**开发模式**（推荐）：
```bash
npm run dev
```

**构建生产版本**：
```bash
npm run build
```

**预览生产版本**：
```bash
npm run preview
```

---

## 4. 服务验证

### 4.1 后端服务验证

| 地址 | 说明 |
|------|------|
| `http://localhost:8000/` | 首页，返回欢迎信息 |
| `http://localhost:8000/docs` | Swagger UI 交互式文档 |
| `http://localhost:8000/redoc` | ReDoc 文档 |

**预期响应**（首页）：
```json
{"message": "学生积分商城 API"}
```

**测试登录接口**（PowerShell）：
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username": "admin", "password": "admin123"}'
```

### 4.2 前端服务验证

访问前端应用：
```
http://localhost:5173
```

### 4.3 登录测试

使用默认管理员账号登录系统：
- **用户名**: admin
- **密码**: admin123

---

## 5. 默认账号与数据

### 5.1 默认管理员账号
| 字段 | 值 |
|------|------|
| 用户名 | admin |
| 密码 | admin123 |
| 姓名 | 管理员 |

### 5.2 默认商品数据
| 商品名称 | 所需积分 | 库存 | 分类 |
|----------|----------|------|------|
| 笔记本 | 50 | 100 | 学习用品 |
| 钢笔 | 100 | 50 | 学习用品 |
| 书包 | 300 | 30 | 学习用品 |
| 文具盒 | 80 | 80 | 学习用品 |
| 运动水杯 | 120 | 40 | 生活用品 |
| 卡通贴纸 | 30 | 200 | 生活用品 |
| 书签 | 40 | 150 | 生活用品 |
| 奖状 | 20 | 500 | 荣誉奖品 |

---

## 6. 项目结构

```
积分商城/
├── backend/                 # 后端项目
│   ├── app/                # 应用代码
│   │   ├── main.py         # 应用入口
│   │   ├── database.py     # 数据库配置
│   │   ├── config.py       # 配置文件
│   │   ├── routers/        # 路由模块
│   │   ├── services/       # 业务逻辑
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # Pydantic 模型
│   │   └── utils/          # 工具函数
│   ├── requirements.txt    # Python 依赖
│   ├── .env                # 环境变量
│   └── test.db            # SQLite 数据库
├── frontend/               # 前端项目
│   ├── src/               # 源代码
│   │   ├── pages/         # 页面组件
│   │   │   ├── auth/      # 认证页面
│   │   │   ├── student/   # 学生端页面
│   │   │   └── teacher/   # 教师端页面
│   │   ├── components/    # UI 组件
│   │   │   ├── layout/    # 布局组件
│   │   │   └── ui/        # 基础组件
│   │   ├── services/      # API 服务
│   │   ├── store/         # 状态管理
│   │   └── types/         # TypeScript 类型
│   ├── package.json       # Node.js 依赖
│   └── vite.config.ts     # Vite 配置
└── START.md               # 本文档
```

---

## 7. 技术栈

### 后端技术栈
| 组件 | 版本 | 说明 |
|------|------|------|
| FastAPI | 0.104+ | Web 框架 |
| Uvicorn | 0.24+ | ASGI 服务器 |
| SQLAlchemy | 2.0+ | ORM |
| Pydantic | 2.0+ | 数据验证 |
| Python-JOSE | 3.3+ | JWT 认证 |
| Passlib | 1.7+ | 密码哈希 |

### 前端技术栈
| 组件 | 版本 | 说明 |
|------|------|------|
| React | 18 | UI 框架 |
| Vite | 6 | 构建工具 |
| TypeScript | 5 | 语言 |
| TailwindCSS | 3 | 样式 |
| React Router | 6 | 路由 |
| Axios | 1.6+ | HTTP 客户端 |
| Lucide React | 0.294+ | 图标 |

---

## 8. 生产部署

### 8.1 后端部署
```bash
# 使用 gunicorn + uvicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 8.2 前端部署
```bash
# 构建生产版本
npm run build

# 部署 dist 目录到静态服务器
```

### 8.3 Nginx 配置示例
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

---

## 9. 常见问题

### 9.1 端口被占用
**问题**：启动时提示端口被占用
```
Error: [Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000)
```
**解决方案**：
```bash
# 查找占用端口的进程
netstat -ano | findstr ":8000"

# 终止进程（替换 PID 为实际进程号）
taskkill /F /PID <PID>

# 或使用其他端口启动
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### 9.2 依赖安装失败
**问题**：pip/npm 安装依赖失败
**解决方案**：
```bash
# Python
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Node.js
npm cache clean --force
rm -rf node_modules
npm install
```

### 9.3 API 请求失败
**问题**：前端无法访问后端 API
**解决方案**：
1. 确保后端服务已启动
2. 确认 `vite.config.ts` 中的代理配置正确
3. 检查防火墙是否允许端口访问

### 9.4 中文乱码问题
**问题**：终端显示中文为乱码字符
**解决方案**：
```powershell
$env:PYTHONIOENCODING='utf-8'
$env:PYTHONUTF8='1'
```

### 9.5 JWT Token 无效
**问题**：登录后访问接口提示 Token 无效
**解决方案**：确保 `.env` 文件中的 `SECRET_KEY` 配置正确，重启服务后重新登录

### 9.6 数据库文件权限问题
**问题**：SQLite 无法创建数据库文件
**解决方案**：确保项目目录有读写权限

---

## 10. 更新日志

- 2026-06-15: 整合启动文档，合并 START.md、STARTUP.md、backend/DEPLOYMENT.md、frontend/DEPLOY.md
- 2026-06-15: 初始版本，支持基础功能

---

**文档版本**: v2.0  
**生成日期**: 2026年6月15日  
**适用项目**: 积分商城系统