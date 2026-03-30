#!/bin/bash

# 停止万年历服务器
if [ -f /tmp/wannianli_server.pid ]; then
    PID=$(cat /tmp/wannianli_server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ 服务器已停止"
    else
        echo "⚠️ 服务器未运行"
    fi
    rm /tmp/wannianli_server.pid
else
    # 尝试直接杀死端口
    pkill -f "http.server 8765" && echo "✅ 服务器已停止" || echo "⚠️ 服务器未运行"
fi

echo ""
echo "按任意键退出..."
read -n 1
