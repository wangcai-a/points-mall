# 学生积分商城 - Linux 部署文档

## 目录

1. [系统要求](#系统要求)
2. [一键自动化部署](#一键自动化部署)
3. [手动部署步骤](#手动部署步骤)
4. [配置说明](#配置说明)
5. [服务管理](#服务管理)
6. [常见问题](#常见问题)
7. [安全建议](#安全建议)

---

## 系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Ubuntu 20.04 LTS / 22.04 LTS |
| CPU | 至少 1 核 |
| 内存 | 至少 2GB |
| 硬盘 | 至少 10GB 可用空间 |
| 网络 | 公网 IP，开放 80 端口 |

---

## 一键自动化部署

### 方式一：使用脚本自动部署

```bash
# 1. 将项目代码上传到服务器或克隆仓库
git clone https://github.com/your-repo/points-mall.git
cd points-mall

# 2. 赋予脚本执行权限
chmod +x deploy.sh

# 3. 运行部署脚本（需要 root 权限）
sudo ./deploy.sh
```

### 方式二：远程执行（推荐）

```bash
# 将脚本复制到服务器并执行
scp deploy.sh user@your-server-ip:/tmp/
ssh user@your-server-ip "sudo bash /tmp/deploy.sh"
```

### 部署脚本功能说明

部署脚本 [deploy.sh](file:///d:/code/积分商城/deploy.sh) 会自动完成以下操作：

1. **更新系统** - 更新 apt 包并升级系统
2. **安装依赖** - 安装 Python3、Node.js、Nginx、Git 等
3. **克隆代码** - 从 Git 仓库拉取项目代码
4. **配置环境** - 创建 Python 虚拟环境并安装依赖
5. **构建前端** - 安装前端依赖并构建生产版本
6. **配置 Nginx** - 设置反向代理配置
7. **配置 systemd** - 创建后端服务自启动配置
8. **启动服务** - 启动后端和 Nginx 服务
9. **配置防火墙** - 开放必要端口

---

## 手动部署步骤

### 1. 更新系统

```bash
sudo apt-get update -y
sudo apt-get upgrade -y
```

### 2. 安装基础依赖

```bash
sudo apt-get install -y python3 python3-venv python3-dev nginx git curl build-essential libssl-dev
```

### 3. 安装 Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
```

### 4. 创建项目目录

```bash
sudo mkdir -p /opt/points-mall
sudo chown -R $USER:$USER /opt/points-mall
```

### 5. 克隆项目代码

```bash
git clone https://github.com/your-repo/points-mall.git /opt/points-mall
```

### 6. 配置后端

```bash
cd /opt/points-mall/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install --upgrade pip
pip install -r requirements.txt

# 配置环境变量
cat > .env <<EOF
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
EOF
```

### 7. 构建前端

```bash
cd /opt/points-mall/frontend

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 8. 配置 Nginx

```bash
cat > /etc/nginx/sites-available/points-mall <<EOF
server {
    listen 80;
    server_name _;

    location / {
        root /opt/points-mall/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /docs/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
    }

    location /redoc/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
    }
}
EOF

# 创建符号链接
sudo ln -s /etc/nginx/sites-available/points-mall /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 9. 配置 systemd 服务

```bash
cat > /etc/systemd/system/points-mall-backend.service <<EOF
[Unit]
Description=Points Mall Backend Service
After=network.target

[Service]
User=root
WorkingDirectory=/opt/points-mall/backend
Environment="PATH=/opt/points-mall/backend/venv/bin:/usr/bin:/bin"
ExecStart=/opt/points-mall/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable points-mall-backend
sudo systemctl start points-mall-backend
```

### 10. 配置防火墙

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 8000/tcp
sudo ufw --force enable
```

---

## 配置说明

### 环境变量

后端服务使用 `.env` 文件配置，位于 `/opt/points-mall/backend/.env`：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| SECRET_KEY | 自动生成 | JWT 密钥，务必在生产环境修改 |
| ALGORITHM | HS256 | JWT 算法 |
| ACCESS_TOKEN_EXPIRE_MINUTES | 1440 | Token 过期时间（分钟） |

### 数据库配置

项目使用 SQLite 数据库，数据库文件位于 `/opt/points-mall/backend/test.db`。

如需修改数据库连接，编辑 `backend/app/config.py`：

```python
database_url: str = "sqlite:///./test.db?charset=utf8mb4"
```

### Nginx 配置

Nginx 配置文件位于 `/etc/nginx/sites-available/points-mall`：

- **前端页面**：`/` → 指向 `frontend/dist` 目录
- **API 请求**：`/api/` → 反向代理到 `http://127.0.0.1:8000`
- **文件上传**：`/uploads/` → 反向代理到 `http://127.0.0.1:8000`
- **API 文档**：`/docs/` 和 `/redoc/` → 反向代理到后端

---

## 服务管理

### 后端服务

```bash
# 查看状态
sudo systemctl status points-mall-backend

# 启动服务
sudo systemctl start points-mall-backend

# 停止服务
sudo systemctl stop points-mall-backend

# 重启服务
sudo systemctl restart points-mall-backend

# 查看日志（实时）
sudo journalctl -u points-mall-backend -f

# 查看日志（最近 100 行）
sudo journalctl -u points-mall-backend --no-pager -n 100
```

### Nginx 服务

```bash
# 查看状态
sudo systemctl status nginx

# 启动服务
sudo systemctl start nginx

# 停止服务
sudo systemctl stop nginx

# 重启服务
sudo systemctl restart nginx

# 测试配置
sudo nginx -t

# 查看日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 常见问题

### 1. 服务启动失败

**问题**：后端服务无法启动

**解决**：

```bash
# 查看详细日志
sudo journalctl -u points-mall-backend --no-pager

# 常见原因：
# - 端口 8000 被占用
# - 虚拟环境未正确创建
# - 依赖包安装失败
```

### 2. 前端页面无法访问

**问题**：访问 `http://<服务器IP>` 显示 404 或空白页

**解决**：

```bash
# 检查前端构建是否成功
ls -la /opt/points-mall/frontend/dist/

# 检查 Nginx 配置
sudo nginx -t

# 检查 Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

### 3. API 请求失败

**问题**：前端页面可以访问，但 API 请求返回错误

**解决**：

```bash
# 检查后端服务是否运行
sudo systemctl status points-mall-backend

# 直接测试 API
curl http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 4. 文件上传失败

**问题**：上传图片时出现权限错误

**解决**：

```bash
# 检查 uploads 目录权限
sudo chmod -R 755 /opt/points-mall/backend/uploads
```

### 5. Node.js 版本问题

**问题**：前端构建失败，提示 Node.js 版本过低

**解决**：

```bash
# 安装正确版本
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# 验证版本
node --version
npm --version
```

---

## 安全建议

### 1. 修改默认密码

部署完成后，立即修改默认管理员密码：

```bash
# 通过 API 修改密码
curl -X PUT http://<服务器IP>/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"old_password":"admin123","new_password":"your-new-password"}'
```

### 2. 配置 HTTPS

使用 Let's Encrypt 配置 SSL 证书：

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 限制访问

修改 Nginx 配置，限制管理页面访问：

```nginx
location /teacher/ {
    allow 192.168.1.0/24;
    deny all;
    # ...
}
```

### 4. 定期备份

```bash
# 创建备份脚本
cat > /opt/points-mall/backup.sh <<EOF
#!/bin/bash
BACKUP_DIR="/backup/points-mall"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份数据库
cp /opt/points-mall/backend/test.db "$BACKUP_DIR/test.db_$DATE"

# 备份上传文件
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /opt/points-mall/backend/uploads

# 保留最近 30 天备份
find "$BACKUP_DIR" -type f -mtime +30 -delete
EOF

chmod +x /opt/points-mall/backup.sh

# 添加到 crontab（每天凌晨 2 点执行）
echo "0 2 * * * /opt/points-mall/backup.sh" | sudo crontab -
```

### 5. 禁用不必要的端口

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

---

## 附录

### 项目结构

```
/opt/points-mall/
├── backend/                    # 后端代码
│   ├── app/                    # FastAPI 应用
│   ├── uploads/                # 文件上传目录
│   ├── venv/                   # Python 虚拟环境
│   ├── .env                    # 环境变量配置
│   ├── requirements.txt        # Python 依赖
│   └── test.db                 # SQLite 数据库
└── frontend/                   # 前端代码
    ├── src/                    # 源代码
    ├── dist/                   # 构建产物
    ├── package.json            # Node.js 依赖
    └── vite.config.ts          # Vite 配置
```

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端页面 | http://<服务器IP> |
| API 文档 | http://<服务器IP>/docs |
| Redoc 文档 | http://<服务器IP>/redoc |