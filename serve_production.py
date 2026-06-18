#!/usr/bin/env python3
"""
Production server for serving built frontend and proxying API requests.
适用于服务器环境部署，支持外部访问。
支持 Windows 和 Linux 系统。
"""
import os
import sys
import http.server
import socketserver
import urllib.request
import urllib.error
import argparse
from urllib.parse import urlparse

BACKEND_PORT = 8000
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "dist")
FRONTEND_PORT = 8080  # 默认使用 8080 端口（避免需要 root 权限）

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """自定义处理器：处理前端静态文件和 API 代理"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def do_GET(self):
        """处理 GET 请求"""
        parsed_path = urlparse(self.path)

        # 代理 /uploads/ 路径到后端
        if parsed_path.path.startswith('/uploads/'):
            self.proxy_request(f"http://localhost:{BACKEND_PORT}{parsed_path.path}")
            return

        # 其他请求由静态文件服务器处理
        return super().do_GET()

    def do_POST(self):
        """处理 POST 请求"""
        parsed_path = urlparse(self.path)

        # 代理 /api/ 路径到后端
        if parsed_path.path.startswith('/api/'):
            self.proxy_request(f"http://localhost:{BACKEND_PORT}{parsed_path.path}")
            return

        # 其他请求返回 404
        self.send_error(404, "Not Found")

    def do_PUT(self):
        """处理 PUT 请求"""
        parsed_path = urlparse(self.path)

        if parsed_path.path.startswith('/api/'):
            self.proxy_request(f"http://localhost:{BACKEND_PORT}{parsed_path.path}")
            return

        self.send_error(404, "Not Found")

    def do_DELETE(self):
        """处理 DELETE 请求"""
        parsed_path = urlparse(self.path)

        if parsed_path.path.startswith('/api/'):
            self.proxy_request(f"http://localhost:{BACKEND_PORT}{parsed_path.path}")
            return

        self.send_error(404, "Not Found")

    def proxy_request(self, url):
        """将请求代理到后端"""
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None

            # 构建代理请求
            req = urllib.request.Request(url, data=body, method=self.command)

            # 复制请求头（排除 Host）
            for header, value in self.headers.items():
                if header.lower() not in ('host', 'connection'):
                    req.add_header(header, value)

            # 设置转发后的 Host
            req.add_header('Host', f'localhost:{BACKEND_PORT}')

            # 发送请求
            with urllib.request.urlopen(req, timeout=30) as response:
                # 发送响应
                self.send_response(response.status)
                self.send_header('Content-Type', response.headers.get('Content-Type', 'application/json'))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

                content = response.read()
                self.send_header('Content-Length', len(content))
                self.end_headers()
                self.wfile.write(content)

        except urllib.error.HTTPError as e:
            self.send_error(e.code, str(e))
        except urllib.error.URLError as e:
            self.send_error(502, f"Backend error: {e.reason}")
        except Exception as e:
            self.send_error(500, f"Proxy error: {str(e)}")

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[Frontend] {args[0]}", flush=True)


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """支持多线程的 HTTP 服务器"""
    allow_reuse_address = True

    def server_bind(self):
        self.socket.setsockopt(socketserver.socket.SOL_SOCKET, socketserver.socket.SO_REUSEADDR, 1)
        self.socket.bind(self.server_address)


def check_backend(backend_port):
    """检查后端服务是否可用"""
    try:
        with urllib.request.urlopen(f"http://localhost:{backend_port}/", timeout=5) as response:
            return response.status == 200
    except:
        return False


def main():
    parser = argparse.ArgumentParser(description="Production Frontend Server")
    parser.add_argument("--port", type=int, default=FRONTEND_PORT, help=f"Frontend port (default: {FRONTEND_PORT})")
    parser.add_argument("--backend-port", type=int, default=BACKEND_PORT, help=f"Backend port (default: {BACKEND_PORT})")
    parser.add_argument("--frontend-dir", type=str, default=FRONTEND_DIR, help="Frontend dist directory")
    args = parser.parse_args()

    # 检查 dist 目录是否存在
    if not os.path.exists(args.frontend_dir):
        print(f"错误：前端构建目录不存在: {args.frontend_dir}")
        print("请先运行：cd frontend && npm run build")
        sys.exit(1)

    # 检查后端服务
    print(f"正在检查后端服务 (localhost:{args.backend_port})...")
    if not check_backend(args.backend_port):
        print(f"错误：后端服务未运行或无法访问")
        print(f"请先启动后端服务")
        sys.exit(1)

    print(f"后端服务检查通过")

    # 启动服务器
    handler = lambda *args, **kwargs: ProxyHTTPRequestHandler(*args, directory=args.frontend_dir, **kwargs)
    server = ThreadedHTTPServer(("0.0.0.0", args.port), handler)

    print("=" * 50)
    print("  学生积分商城 - 生产服务器")
    print("=" * 50)
    print(f"  前端静态文件目录: {args.frontend_dir}")
    print(f"  服务地址: http://0.0.0.0:{args.port}")
    print(f"  后端代理: http://localhost:{args.backend_port}")
    print("=" * 50)
    print("\n按 Ctrl+C 停止服务...\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n正在停止服务...")
        server.shutdown()


if __name__ == "__main__":
    main()
