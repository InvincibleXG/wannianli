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
