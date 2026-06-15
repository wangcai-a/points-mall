# 学生积分商城 - 后端部署启动文档

## 1. 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Python | 3.10+ | 后端开发语言 |
| SQLite | 3.x | 内置数据库，无需额外安装 |

## 2. 安装步骤

### 2.1 进入项目目录

```bash
cd d:\code\积分商城\backend
```

### 2.2 创建虚拟环境（可选但推荐）

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows PowerShell
venv\Scripts\Activate.ps1

# Windows Command Prompt
venv\Scripts\activate.bat
```

### 2.3 安装依赖

```bash
python -m pip install fastapi uvicorn sqlalchemy openpyxl python-jose passlib python-multipart pydantic python-dotenv
```

或使用 requirements.txt：

```bash
python -m pip install -r requirements.txt
```

## 3. 配置说明

### 3.1 环境变量配置

编辑 `backend/.env` 文件：

```env
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

- `SECRET_KEY`: JWT 签名密钥，生产环境请使用随机生成的安全密钥
- `ALGORITHM`: JWT 算法，默认 HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token 有效期（分钟），默认 1440 分钟（24小时）

### 3.2 数据库配置

数据库使用 SQLite，数据库文件会自动创建在项目根目录下的 `test.db`。

数据库连接配置在 `app/config.py` 中：

```python
database_url: str = "sqlite:///./test.db"
```

## 4. 启动方式

### 4.1 开发模式启动

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

参数说明：
- `--host 0.0.0.0`: 允许外部访问
- `--port 8000`: 监听端口为 8000
- `--reload`: 自动重载（开发环境使用）

### 4.2 生产模式启动

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

参数说明：
- `--workers 4`: 使用 4 个工作进程（根据服务器 CPU 核数调整）

### 4.3 使用 Gunicorn（推荐生产环境）

```bash
# 安装 Gunicorn
pip install gunicorn

# 启动
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app -b 0.0.0.0:8000
```

## 5. 服务验证

### 5.1 检查服务是否启动成功

访问首页：

```
http://localhost:8000/
```

成功响应：
```json
{"message": "学生积分商城 API"}
```

### 5.2 查看 API 文档

FastAPI 自动生成交互式 API 文档：

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 5.3 测试登录接口

使用 curl 或 API 文档测试登录：

```bash
curl -X POST "http://localhost:8000/api/auth/login" -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin123"}'
```

成功响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "teacher": {
      "id": 1,
      "username": "admin",
      "name": "管理员"
    }
  }
}
```

## 6. 默认数据

### 6.1 默认管理员账号

| 字段 | 值 |
|------|------|
| 用户名 | admin |
| 密码 | admin123 |

### 6.2 默认商品数据

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

## 7. 目录结构说明

```
backend/
├── app/                    # 应用主目录
│   ├── main.py             # 应用入口，FastAPI 实例创建和路由注册
│   ├── config.py           # 配置管理，环境变量读取
│   ├── database.py         # 数据库连接配置，SQLAlchemy 引擎和会话
│   ├── models/             # 数据模型，SQLAlchemy ORM 定义
│   ├── schemas/            # 数据传输对象，Pydantic 模型
│   ├── routers/            # API 路由定义
│   ├── services/           # 业务逻辑层
│   └── utils/              # 工具函数（JWT、Excel 解析）
├── requirements.txt        # Python 依赖列表
└── .env                   # 环境变量配置
```

## 8. API 接口列表

### 8.1 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 教师登录 |
| GET | /api/auth/me | 获取当前登录教师信息 |

### 8.2 学生管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/students | 获取学生列表 |
| POST | /api/students | 创建学生 |
| GET | /api/students/{id} | 获取学生详情 |
| PUT | /api/students/{id} | 更新学生信息 |
| DELETE | /api/students/{id} | 删除学生 |
| GET | /api/students/{id}/points-history | 获取学生积分变动历史 |

### 8.3 商品管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/products | 获取商品列表 |
| GET | /api/products/categories | 获取商品分类 |
| GET | /api/products/{id} | 获取商品详情 |
| POST | /api/products | 创建商品 |
| PUT | /api/products/{id} | 更新商品信息 |
| DELETE | /api/products/{id} | 删除商品 |

### 8.4 订单管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/orders | 获取订单列表 |
| POST | /api/orders | 创建订单（兑换商品） |
| GET | /api/orders/{id} | 获取订单详情 |
| PUT | /api/orders/{id} | 更新订单状态 |

### 8.5 积分管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/points/award | 发放积分 |
| POST | /api/points/deduct | 扣除积分 |
| POST | /api/points/import | 上传 Excel 文件并解析 |
| POST | /api/points/import/confirm | 确认导入并更新积分 |

### 8.6 抽奖接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/lottery/prizes | 获取奖品列表 |
| POST | /api/lottery/draw | 执行抽奖 |
| GET | /api/lottery/records | 获取抽奖记录 |

## 9. 常见问题

### 9.1 端口被占用

错误信息：`Error: [Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000): ...`

解决方案：使用其他端口启动

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### 9.2 依赖安装失败

错误信息：`ERROR: Could not install packages due to an OSError`

解决方案：升级 pip

```bash
python -m pip install --upgrade pip
```

### 9.3 数据库文件权限问题

确保项目目录有读写权限，SQLite 需要在项目目录创建 `test.db` 文件。

### 9.4 JWT Token 无效

确保 `.env` 文件中的 `SECRET_KEY` 一致，重启服务后旧 Token 会失效。

## 10. 注意事项

1. **生产环境**：务必修改 `SECRET_KEY` 为安全的随机字符串
2. **数据库备份**：定期备份 `test.db` 文件
3. **日志记录**：生产环境建议配置日志记录
4. **HTTPS**：生产环境建议配置 HTTPS

---

**文档版本**：v1.0  
**创建日期**：2026-06-15