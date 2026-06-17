#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    return 0
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    return 0
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    return 0
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

if [ "$(id -u)" != "0" ]; then
    print_error "此脚本需要以root权限运行，请使用 sudo ./deploy.sh"
fi

PROJECT_NAME="points-mall"
PROJECT_DIR="/opt/$PROJECT_NAME"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
ENV_FILE="$BACKEND_DIR/.env"
NGINX_CONF="/etc/nginx/conf.d/$PROJECT_NAME.conf"
SYSTEMD_SERVICE="/etc/systemd/system/$PROJECT_NAME-backend.service"

print_info "=============================================="
print_info "        学生积分商城 - 一键部署脚本"
print_info "         (适配阿里云 Linux 3)"
print_info "=============================================="

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS="$ID"
        VERSION="$VERSION_ID"
    elif [ -f /etc/redhat-release ]; then
        OS="centos"
        VERSION=$(cat /etc/redhat-release | grep -o '[0-9]\+\.[0-9]\+' | head -1)
    elif [ -f /etc/debian_version ]; then
        OS="debian"
        VERSION=$(cat /etc/debian_version)
    else
        OS="unknown"
        VERSION="unknown"
    fi
    print_info "检测到操作系统: $OS $VERSION"
}

detect_os

print_info "更新系统包..."
if [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
    yum update -y
elif [ "$OS" = "debian" ] || [ "$OS" = "ubuntu" ]; then
    apt-get update -y
    apt-get upgrade -y
else
    print_warning "未知操作系统，跳过系统更新"
fi

print_info "安装基础依赖..."
MISSING_DEPS=""

if ! command -v git &> /dev/null; then
    MISSING_DEPS="$MISSING_DEPS git"
else
    print_warning "git已安装，跳过"
fi

if ! command -v curl &> /dev/null; then
    MISSING_DEPS="$MISSING_DEPS curl"
else
    print_warning "curl已安装，跳过"
fi

if ! command -v gcc &> /dev/null; then
    MISSING_DEPS="$MISSING_DEPS gcc"
else
    print_warning "gcc已安装，跳过"
fi

if [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
    if ! command -v g++ &> /dev/null; then
        MISSING_DEPS="$MISSING_DEPS gcc-c++"
    else
        print_warning "gcc-c++已安装，跳过"
    fi
    if ! rpm -q openssl-devel &> /dev/null; then
        MISSING_DEPS="$MISSING_DEPS openssl-devel"
    else
        print_warning "openssl-devel已安装，跳过"
    fi
elif [ "$OS" = "debian" ] || [ "$OS" = "ubuntu" ]; then
    if ! command -v g++ &> /dev/null; then
        MISSING_DEPS="$MISSING_DEPS g++"
    else
        print_warning "g++已安装，跳过"
    fi
    if ! dpkg -l libssl-dev &> /dev/null; then
        MISSING_DEPS="$MISSING_DEPS libssl-dev"
    else
        print_warning "libssl-dev已安装，跳过"
    fi
fi

if [ -n "$MISSING_DEPS" ]; then
    if [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
        yum install -y $MISSING_DEPS
    elif [ "$OS" = "debian" ] || [ "$OS" = "ubuntu" ]; then
        apt-get install -y $MISSING_DEPS
    else
        print_error "未知操作系统，无法安装基础依赖"
    fi
else
    print_success "所有基础依赖已安装"
fi

print_info "安装Nginx..."
if ! command -v nginx &> /dev/null; then
    if [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
        curl -o /tmp/nginx.rpm http://nginx.org/packages/centos/8/x86_64/RPMS/nginx-1.30.2-1.el8.ngx.x86_64.rpm
        rpm -ivh /tmp/nginx.rpm || true
        dnf install nginx -y || true
    elif [ "$OS" = "debian" ] || [ "$OS" = "ubuntu" ]; then
        apt-get install -y nginx
    else
        print_error "未知操作系统，无法安装Nginx"
    fi
else
    print_warning "Nginx已安装，跳过"
fi

print_info "安装Node.js 20.x..."
NODE_INSTALLED=false
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    print_warning "Node.js已安装，版本: v$NODE_VERSION"
    NODE_INSTALLED=true
else
    print_warning "Node.js未安装，开始安装..."
fi

if [ "$NODE_INSTALLED" = false ]; then
    if [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    elif [ "$OS" = "debian" ] || [ "$OS" = "ubuntu" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    else
        print_error "未知操作系统，无法安装Node.js"
    fi
fi

print_info "创建项目目录..."
mkdir -p "$PROJECT_DIR"

if [ -d "$BACKEND_DIR" ]; then
    print_warning "检测到已有项目目录，将备份并重新克隆..."
    mv "$PROJECT_DIR" "${PROJECT_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$PROJECT_DIR"
fi

print_info "克隆项目代码..."
git clone https://github.com/wangcai-a/points-mall.git "$PROJECT_DIR"

print_info "设置Python虚拟环境..."
if [ -f "/root/miniconda3/etc/profile.d/conda.sh" ]; then
    source /root/miniconda3/etc/profile.d/conda.sh
elif [ -f "/root/anaconda3/etc/profile.d/conda.sh" ]; then
    source /root/anaconda3/etc/profile.d/conda.sh
elif [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/miniconda3/etc/profile.d/conda.sh"
elif [ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/anaconda3/etc/profile.d/conda.sh"
elif [ -f "/home/admin/miniconda3/etc/profile.d/conda.sh" ]; then
    source "/home/admin/miniconda3/etc/profile.d/conda.sh"
else
    print_error "未找到conda安装路径，请检查conda是否已安装"
fi

CONDA_PYTHON=$(which python)
print_info "使用conda Python: $CONDA_PYTHON"

$CONDA_PYTHON -m venv "$BACKEND_DIR/venv"
source "$BACKEND_DIR/venv/bin/activate"

print_info "安装后端依赖..."
pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt"

print_info "配置环境变量..."
if [ ! -f "$ENV_FILE" ]; then
    cat > "$ENV_FILE" <<EOF
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
EOF
    print_success "已生成新的 SECRET_KEY"
fi

print_info "安装前端依赖..."
cd "$FRONTEND_DIR"

rm -rf node_modules package-lock.json
npm install --platform=linux --arch=x64

print_info "构建前端项目..."
npm run build

print_info "配置Nginx反向代理..."
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;

    location / {
        root $FRONTEND_DIR/dist;
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

print_info "配置systemd服务..."
cat > "$SYSTEMD_SERVICE" <<EOF
[Unit]
Description=Points Mall Backend Service
After=network.target

[Service]
User=root
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin:/usr/bin:/bin"
ExecStart=$BACKEND_DIR/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

print_info "启动后端服务..."
systemctl daemon-reload
systemctl enable "$PROJECT_NAME-backend"
systemctl start "$PROJECT_NAME-backend"

print_info "启动Nginx服务..."
systemctl enable nginx
systemctl restart nginx

print_info "设置防火墙规则..."
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --zone=public --add-service=http --permanent
    firewall-cmd --zone=public --add-port=8000/tcp --permanent
    firewall-cmd --reload
    print_success "防火墙规则已配置"
else
    print_warning "未安装firewalld，请手动配置防火墙"
fi

print_info "验证服务状态..."
sleep 3
if systemctl is-active --quiet "$PROJECT_NAME-backend"; then
    print_success "后端服务运行正常"
else
    print_error "后端服务启动失败，请检查日志: journalctl -u $PROJECT_NAME-backend"
fi

if systemctl is-active --quiet nginx; then
    print_success "Nginx服务运行正常"
else
    print_error "Nginx服务启动失败，请检查日志: journalctl -u nginx"
fi

print_info ""
print_success "=============================================="
print_success "        部署完成！"
print_success "=============================================="
print_info ""
print_info "访问地址:"
print_info "  - 前端页面: http://<服务器IP>"
print_info "  - API文档: http://<服务器IP>/docs"
print_info "  - 默认管理员账号: admin / admin123"
print_info ""
print_info "常用命令:"
print_info "  - 查看后端日志: journalctl -u $PROJECT_NAME-backend -f"
print_info "  - 重启后端服务: systemctl restart $PROJECT_NAME-backend"
print_info "  - 重启Nginx: systemctl restart nginx"
print_info "  - 查看Nginx状态: systemctl status nginx"