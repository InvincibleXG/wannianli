#!/bin/bash

# 万年历应用打包脚本

echo "📅 正在打包万年历应用到桌面..."

# 设置变量
PROJECT_DIR="wannianli"
DESKTOP="/Desktop"
APP_NAME="万年历"
APP_DIR="$DESKTOP/$APP_NAME"

# 删除旧的打包（如果存在）
if [ -d "$APP_DIR" ]; then
    echo "🗑️  删除旧的打包..."
    rm -rf "$APP_DIR"
fi

# 创建应用目录
echo "📁 创建应用目录..."
mkdir -p "$APP_DIR"

# 复制项目文件
echo "📋 复制项目文件..."
cp -r "$PROJECT_DIR"/* "$APP_DIR/"

# 创建启动脚本
echo "🚀 创建启动脚本..."
cat > "$APP_DIR/启动万年历.command" << 'LAUNCHER'
#!/usr/bin/env osascript

-- 万年历应用启动器

display dialog "万年历应用" & return & return & "正在启动万年历..." & return & return & "请稍候..." buttons {"取消"} giving up after 2 with title "万年历" with icon note

-- 获取脚本所在目录
set scriptPath to POSIX path of (path to me)
set appDir to do shell script "dirname " & quoted form of scriptPath

-- 检查端口是否已被占用
set portCheck to do shell script "lsof -i :8765 | grep LISTEN || true"

if portCheck is not "" then
    -- 如果端口已被占用，使用其他端口
    do shell script "cd " & quoted form of appDir & " && python3 -m http.server 8766 > /dev/null 2>&1 &"
    delay 1
    set url to "http://localhost:8766"
else
    -- 启动服务器
    do shell script "cd " & quoted form of appDir & " && python3 -m http.server 8765 > /dev/null 2>&1 &"
    delay 1
    set url to "http://localhost:8765"
end if

-- 用默认浏览器打开
do shell script "open " & url

-- 显示成功消息
display notification "万年历应用已启动" with title "万年历" sound name "Glass"
LAUNCHER

chmod +x "$APP_DIR/启动万年历.command"

# 创建停止脚本
echo "🛑 创建停止脚本..."
cat > "$APP_DIR/停止服务器.command" << 'STOPPER'
#!/bin/bash

echo "正在停止万年历服务器..."

# 停止8765端口的服务
pkill -f "http.server 8765"
pkill -f "http.server 8766"

echo "✅ 服务器已停止"
echo ""
echo "按任意键退出..."
read -n 1
STOPPER

chmod +x "$APP_DIR/停止服务器.command"

# 创建使用说明
echo "📖 创建使用说明..."
cat > "$APP_DIR/使用说明.txt" << 'README'
════════════════════════════════════════
        📅 万年历应用 使用说明
════════════════════════════════════════

【如何使用】

方式一：启动应用
1. 双击 "启动万年历.command"
2. 等待几秒钟，浏览器会自动打开
3. 开始使用万年历！

方式二：手动启动
1. 双击 index.html 文件
2. 直接在浏览器中打开

【功能说明】

✅ 支持时间范围：1000年 - 2100年
✅ 公历/农历互转
✅ 24节气查询
✅ 干支、生肖、八字
✅ 每日宜忌、吉神方位
✅ 星宿、彭祖百忌
✅ 节日查询
✅ 月历视图

【停止应用】

双击 "停止服务器.command" 可以停止后台服务。

【注意事项】

- 首次启动需要几秒钟加载
- 如果浏览器没有自动打开，请手动访问：
  http://localhost:8765
- 完全离线可用，无需网络连接

【技术支持】

项目位置: ./wannianli
文档: README.md

════════════════════════════════════════
           享受你的万年历吧！
════════════════════════════════════════
README

# 创建版本信息
cat > "$APP_DIR/版本信息.txt" << 'VERSION'
万年历 v1.0.0
打包时间: 2026-03-28
技术栈: HTML5 + CSS3 + JavaScript + lunar-javascript
支持范围: 1000年 - 2100年
VERSION

echo ""
echo "✅ 打包完成！"
echo ""
echo "📦 应用位置: $APP_DIR"
echo ""
echo "🚀 使用方法:"
echo "   双击桌面上的【万年历】文件夹"
echo "   然后双击【启动万年历.command】"
echo ""
echo "或者，你可以："
echo "   直接打开 index.html 文件"
echo ""
