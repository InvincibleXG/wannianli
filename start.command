#!/usr/bin/env osascript

-- 万年历应用启动器
-- 使用方法：双击此脚本打开万年历应用

-- 获取脚本所在目录
set scriptPath to POSIX path of (path to me)
set appDir to do shell script "dirname " & quoted form of scriptPath

-- 启动本地服务器
do shell script "cd " & quoted form of appDir & " && python3 -m http.server 8765 > /dev/null 2>&1 &"

-- 等待服务器启动
delay 1

-- 用默认浏览器打开
tell application "Safari"
    activate
    open location "http://localhost:8765"
end tell
