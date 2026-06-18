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

OS=$(uname -s)
PROJECT_NAME="points-mall"
PROJECT_DIR="/opt/$PROJECT_NAME"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
ENV_FILE="$BACKEND_DIR/.env"

print_info "=============================================="
print_info "        学生积分商城 - 一键部署脚本"
print_info "         (适配 Linux / macOS)"
print_info "=============================================="

detect_os() {
    if [ "$OS" = "Linux" ]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO="$ID"
            VERSION="$VERSION_ID"
        elif [ -f /etc/redhat-release ]; then
            DISTRO="centos"
            VERSION=$(cat /etc/redhat-release | grep -o '[0-9]\+\.[0-9]\+' | head -1)
        elif [ -f /etc/debian_version ]; then
            DISTRO="debian"
            VERSION=$(cat /etc/debian_version)
        else
            DISTRO="unknown"
            VERSION="unknown"
        fi
        print_info "检测到操作系统: Linux $DISTRO $VERSION"
    elif [ "$OS" = "Darwin" ]; then
        MACOS_VERSION=$(sw_vers -productVersion)
        print_info "检测到操作系统: macOS $MACOS_VERSION"
    else
        print_error "不支持的操作系统: $OS"
    fi
}

install_dependencies_linux() {
    print_info "更新系统包..."
    if [ "$DISTRO" = "centos" ] || [ "$DISTRO" = "rhel" ] || [ "$DISTRO" = "fedora" ]; then
        yum update -y
    elif [ "$DISTRO" = "debian" ] || [ "$DISTRO" = "ubuntu" ]; then
        apt-get update -y
        apt-get upgrade -y
    else
        print_warning "未知发行版，跳过系统更新"
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

    if [ "$DISTRO" = "centos" ] || [ "$DISTRO" = "rhel" ] || [ "$DISTRO" = "fedora" ]; then
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
    elif [ "$DISTRO" = "debian" ] || [ "$DISTRO" = "ubuntu" ]; then
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
        if [ "$DISTRO" = "centos" ] || [ "$DISTRO" = "rhel" ] || [ "$DISTRO" = "fedora" ]; then
            yum install -y $MISSING_DEPS
        elif [ "$DISTRO" = "debian" ] || [ "$DISTRO" = "ubuntu" ]; then
            apt-get install -y $MISSING_DEPS
        else
            print_error "未知发行版，无法安装基础依赖"
        fi
    else
        print_success "所有基础依赖已安装"
    fi

    print_info "安装Nginx..."
    if ! command -v nginx &> /dev/null; then
        if [ "$DISTRO" = "centos" ] || [ "$DISTRO" = "rhel" ] || [ "$DISTRO" = "fedora" ]; then
            curl -o /tmp/nginx.rpm http://nginx.org/packages/centos/8/x86_64/RPMS/nginx-1.30.2-1.el8.ngx.x86_64.rpm
            rpm -ivh /tmp/nginx.rpm || true
            dnf install nginx -y || true
        elif [ "$DISTRO" = "debian" ] || [ "$DISTRO" = "ubuntu" ]; then
            apt-get install -y nginx
        else
            print_error "未知发行版，无法安装Nginx"
        fi
    else
        print_warning "Nginx已安装，跳过"
    fi

    print_info "安装Node.js 20.x..."
    if ! command -v node &> /dev/null; then
        print_warning "Node.js未安装，开始安装..."
        if [ "$DISTRO" = "centos" ] || [ "$DISTRO" = "rhel" ] || [ "$DISTRO" = "fedora" ]; then
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            yum install -y nodejs
        elif [ "$DISTRO" = "debian" ] || [ "$DISTRO" = "ubuntu" ]; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        else
            print_error "未知发行版，无法安装Node.js"
        fi
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        print_warning "Node.js已安装，版本: v$NODE_VERSION"
    fi
}

install_dependencies_macos() {
    print_info "检查Homebrew..."
    if ! command -v brew &> /dev/null; then
        print_warning "Homebrew未安装，正在安装..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        print_warning "Homebrew已安装"
    fi

    print_info "安装基础依赖..."
    if ! command -v git &> /dev/null; then
        brew install git
    else
        print_warning "git已安装，跳过"
    fi

    if ! command -v curl &> /dev/null; then
        brew install curl
    else
        print_warning "curl已安装，跳过"
    fi

    print_info "安装Python..."
    if ! command -v python3 &> /dev/null; then
        brew install python3
    else
        print_warning "Python已安装，版本: $(python3 --version)"
    fi

    print_info "安装Nginx..."
    if ! command -v nginx &> /dev/null; then
        brew install nginx
    else
        print_warning "Nginx已安装，跳过"
    fi

    print_info "安装Node.js..."
    if ! command -v node &> /dev/null; then
        brew install node
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        print_warning "Node.js已安装，版本: v$NODE_VERSION"
    fi
}

setup_project() {
    print_info "创建项目目录..."
    mkdir -p "$PROJECT_DIR"

    if [ -d "$BACKEND_DIR" ]; then
        print_warning "检测到已有项目目录，将备份并重新克隆..."
        mv "$PROJECT_DIR" "${PROJECT_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$PROJECT_DIR"
    fi

    print_info "克隆项目代码..."
    git clone https://github.com/wangcai-a/points-mall.git "$PROJECT_DIR"
}

setup_python_venv() {
    print_info "设置Python虚拟环境..."

    local PYTHON_CMD="python3"
    if [ "$OS" = "Linux" ]; then
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
        fi
        PYTHON_CMD=$(which python)
    elif [ "$OS" = "Darwin" ]; then
        if [ -f "/opt/homebrew/bin/python3" ]; then
            PYTHON_CMD="/opt/homebrew/bin/python3"
        elif [ -f "/usr/local/bin/python3" ]; then
            PYTHON_CMD="/usr/local/bin/python3"
        fi
    fi

    print_info "使用Python: $PYTHON_CMD"

    $PYTHON_CMD -m venv "$BACKEND_DIR/venv"
    source "$BACKEND_DIR/venv/bin/activate"

    print_info "安装后端依赖..."
    pip install --upgrade pip
    pip install -r "$BACKEND_DIR/requirements.txt"
}

setup_frontend() {
    print_info "安装前端依赖..."
    cd "$FRONTEND_DIR"
    rm -rf node_modules package-lock.json

    if [ "$OS" = "Linux" ]; then
        npm install --platform=linux --arch=x64
    else
        npm install
    fi

    print_info "构建前端项目..."
    npm run build
}

configure_nginx_linux() {
    local NGINX_CONF="/etc/nginx/conf.d/$PROJECT_NAME.conf"
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
}

configure_nginx_macos() {
    local NGINX_CONF="/opt/homebrew/etc/nginx/servers/$PROJECT_NAME.conf"
    print_info "配置Nginx反向代理..."
    cat > "$NGINX_CONF" <<EOF
server {
    listen 8080;
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
}

configure_systemd() {
    local SYSTEMD_SERVICE="/etc/systemd/system/$PROJECT_NAME-backend.service"
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
}

configure_launchd_macos() {
    local LAUNCHD_PLIST="$HOME/Library/LaunchAgents/com.pointsmall.backend.plist"
    print_info "配置Launchd服务..."
    cat > "$LAUNCHD_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pointsmall.backend</string>
    <key>ProgramArguments</key>
    <array>
        <string>$BACKEND_DIR/venv/bin/uvicorn</string>
        <string>app.main:app</string>
        <string>--host</string>
        <string>0.0.0.0</string>
        <string>--port</string>
        <string>8000</string>
        <string>--workers</string>
        <string>4</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$BACKEND_DIR</string>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/pointsmall-backend.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/pointsmall-backend.log</string>
</dict>
</plist>
EOF
}

start_services_linux() {
    print_info "配置环境变量..."
    if [ ! -f "$ENV_FILE" ]; then
        cat > "$ENV_FILE" <<EOF
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
EOF
        print_success "已生成新的 SECRET_KEY"
    fi

    print_info "启动后端服务..."
    systemctl daemon-reload
    systemctl enable "$PROJECT_NAME-backend"
    systemctl start "$PROJECT_NAME-backend"

    print_info "启动Nginx服务..."
    systemctl enable nginx
    systemctl restart nginx

    print_info "设置防火墙规则..."
    if command -v firewall-cmd &> /dev/null; then
        if systemctl is-active --quiet firewalld; then
            firewall-cmd --zone=public --add-service=http --permanent
            firewall-cmd --zone=public --add-port=8000/tcp --permanent
            firewall-cmd --reload
            print_success "防火墙规则已配置"
        else
            print_warning "firewalld服务未运行，尝试启动..."
            systemctl start firewalld
            if [ $? -eq 0 ]; then
                firewall-cmd --zone=public --add-service=http --permanent
                firewall-cmd --zone=public --add-port=8000/tcp --permanent
                firewall-cmd --reload
                systemctl enable firewalld
                print_success "防火墙规则已配置"
            else
                print_warning "无法启动firewalld服务，请手动配置防火墙"
            fi
        fi
    elif command -v ufw &> /dev/null; then
        ufw allow 'Nginx Full'
        ufw allow 8000/tcp
        ufw reload
        print_success "防火墙规则已配置(ufw)"
    else
        print_warning "未安装防火墙管理工具，请手动配置防火墙"
    fi
}

start_services_macos() {
    print_info "配置环境变量..."
    if [ ! -f "$ENV_FILE" ]; then
        cat > "$ENV_FILE" <<EOF
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
EOF
        print_success "已生成新的 SECRET_KEY"
    fi

    print_info "启动后端服务..."
    launchctl load "$HOME/Library/LaunchAgents/com.pointsmall.backend.plist"
    sleep 3

    print_info "启动Nginx服务..."
    brew services restart nginx
}

verify_services_linux() {
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
}

verify_services_macos() {
    print_info "验证服务状态..."
    sleep 3

    if launchctl list | grep -q "com.pointsmall.backend"; then
        print_success "后端服务运行正常"
    else
        print_error "后端服务启动失败，请检查日志: /tmp/pointsmall-backend.log"
    fi

    if brew services list | grep -q "nginx.*started"; then
        print_success "Nginx服务运行正常"
    else
        print_error "Nginx服务启动失败，请检查日志"
    fi
}

print_final_info_linux() {
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
}

print_final_info_macos() {
    print_info ""
    print_success "=============================================="
    print_success "        部署完成！"
    print_success "=============================================="
    print_info ""
    print_info "访问地址:"
    print_info "  - 前端页面: http://localhost:8080"
    print_info "  - API文档: http://localhost:8000/docs"
    print_info "  - 默认管理员账号: admin / admin123"
    print_info ""
    print_info "常用命令:"
    print_info "  - 查看后端日志: cat /tmp/pointsmall-backend.log"
    print_info "  - 重启后端服务: launchctl stop com.pointsmall.backend && launchctl start com.pointsmall.backend"
    print_info "  - 重启Nginx: brew services restart nginx"
    print_info "  - 查看Nginx状态: brew services list"
}

main() {
    detect_os

    if [ "$OS" = "Linux" ]; then
        if [ "$(id -u)" != "0" ]; then
            print_error "此脚本需要以root权限运行，请使用 sudo ./deploy.sh"
        fi
        install_dependencies_linux
        setup_project
        setup_python_venv
        setup_frontend
        configure_nginx_linux
        configure_systemd
        start_services_linux
        verify_services_linux
        print_final_info_linux
    elif [ "$OS" = "Darwin" ]; then
        install_dependencies_macos
        setup_project
        setup_python_venv
        setup_frontend
        configure_nginx_macos
        configure_launchd_macos
        start_services_macos
        verify_services_macos
        print_final_info_macos
    fi
}

main
