#!/bin/bash

echo "正在停止万年历服务器..."

# 停止8765端口的服务
pkill -f "http.server 8765"
pkill -f "http.server 8766"

echo "✅ 服务器已停止"
echo ""
echo "按任意键退出..."
read -n 1
