#!/bin/bash
#
# 学生积分商城 - Linux 生产环境启动脚本
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 路径设置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
FRONTEND_PORT=${1:-8080}  # 默认 8080，可通过参数指定

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以 root 运行
if [ "$EUID" -eq 0 ] && [ "$1" != "8080" ]; then
    print_warning "建议使用非 root 用户运行此脚本"
fi

# 检查 Python 环境
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        print_error "未找到 Python，请先安装 Python"
        exit 1
    fi
    print_info "使用 Python: $($PYTHON_CMD --version)"
}

# 检查前端构建
check_frontend() {
    if [ ! -d "$FRONTEND_DIR/dist" ]; then
        print_warning "前端未构建，正在构建..."
        cd "$FRONTEND_DIR"
        npm install
        npm run build
        if [ $? -ne 0 ]; then
            print_error "前端构建失败！"
            exit 1
        fi
        print_info "前端构建完成"
    else
        print_info "前端已构建"
    fi
}

# 检查后端依赖
check_backend() {
    if [ ! -d "$BACKEND_DIR/venv" ]; then
        print_warning "未检测到虚拟环境，创建中..."
        cd "$BACKEND_DIR"
        python3 -m venv venv
        source venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        print_info "后端依赖安装完成"
    fi
}

# 启动后端
start_backend() {
    print_info "启动后端服务..."

    cd "$BACKEND_DIR"

    # 激活虚拟环境（如果存在）
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi

    # 后台启动后端
    $PYTHON_CMD -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!

    # 等待后端启动
    sleep 3

    # 检查后端是否启动成功
    if curl -s http://localhost:8000/ > /dev/null 2>&1; then
        print_info "后端服务启动成功 (PID: $BACKEND_PID)"
    else
        print_error "后端服务启动失败，请检查日志: /tmp/backend.log"
        exit 1
    fi

    # 取消激活虚拟环境
    if [ -d "venv" ]; then
        deactivate 2>/dev/null || true
    fi
}

# 启动前端
start_frontend() {
    print_info "启动前端服务..."

    cd "$SCRIPT_DIR"

    # 后台启动前端
    $PYTHON_CMD serve_production.py --port $FRONTEND_PORT > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!

    # 等待前端启动
    sleep 2

    # 检查前端是否启动成功
    if curl -s http://localhost:$FRONTEND_PORT/ > /dev/null 2>&1; then
        print_info "前端服务启动成功 (PID: $FRONTEND_PID)"
    else
        print_error "前端服务启动失败，请检查日志: /tmp/frontend.log"
        exit 1
    fi
}

# 获取服务器 IP
get_server_ip() {
    SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || curl -s ifconfig.me 2>/dev/null || echo "localhost")
    echo $SERVER_IP
}

# 主函数
main() {
    echo "=========================================="
    echo "  学生积分商城 - Linux 生产环境"
    echo "=========================================="
    echo ""

    check_python
    check_frontend
    check_backend

    # 杀掉旧进程
    pkill -f "uvicorn app.main:app" 2>/dev/null || true
    pkill -f "serve_production.py" 2>/dev/null || true

    sleep 1

    start_backend
    start_frontend

    SERVER_IP=$(get_server_ip)

    echo ""
    echo "=========================================="
    echo "  服务已成功启动！"
    echo "=========================================="
    echo ""
    echo "访问地址："
    echo "  - 前端页面: http://$SERVER_IP:$FRONTEND_PORT"
    echo "  - API 文档: http://$SERVER_IP:8000/docs"
    echo ""
    echo "默认管理员账号: admin / admin123"
    echo ""
    echo "日志文件："
    echo "  - 后端日志: /tmp/backend.log"
    echo "  - 前端日志: /tmp/frontend.log"
    echo ""
    echo "停止服务: pkill -f 'uvicorn\|serve_production.py'"
    echo ""
}

main
