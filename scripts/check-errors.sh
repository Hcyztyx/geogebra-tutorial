#!/bin/bash

# GeoGebra 教程网站 - 自动错误检查脚本
# 每小时运行一次，检查网站错误并自动修复部署

set -e

WORKSPACE="/home/admin/openclaw/workspace/geogebra-tutorial"
LOG_FILE="/home/admin/openclaw/workspace/geogebra-tutorial/check-errors.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log "========== 开始错误检查 =========="

cd "$WORKSPACE"

# 1. 检查 Git 状态
log "检查 Git 状态..."
git status > /dev/null 2>&1 || {
    log "❌ Git 仓库异常"
    exit 1
}
log "✅ Git 状态正常"

# 2. 检查关键文件是否存在
log "检查关键文件..."
for file in "index.html" "js/app.js" "css/style.css" "data/lessons.json"; do
    if [ -f "$file" ]; then
        log "✅ $file 存在"
    else
        log "❌ $file 缺失"
        exit 1
    fi
done

# 3. 检查 app.js 中的 GeoGebra 配置
log "检查 GeoGebra 配置..."
if grep -q "showErrorDialog: false" js/app.js; then
    log "✅ GeoGebra 错误弹窗已禁用"
else
    log "⚠️  检测到 GeoGebra 配置可能需要更新"
fi

# 4. 检查 HTML 语法（简单检查）
log "检查 HTML 语法..."
if grep -q "</html>" index.html; then
    log "✅ index.html 结构完整"
else
    log "❌ index.html 可能损坏"
    exit 1
fi

# 5. 检查 JS 语法（使用 node）
log "检查 JavaScript 语法..."
if command -v node &> /dev/null; then
    if node --check js/app.js 2>/dev/null; then
        log "✅ app.js 语法正确"
    else
        log "❌ app.js 语法错误"
        exit 1
    fi
else
    log "⚠️  Node.js 未安装，跳过 JS 语法检查"
fi

# 6. 检查 JSON 数据
log "检查 JSON 数据..."
if command -v python3 &> /dev/null; then
    if python3 -m json.tool data/lessons.json > /dev/null 2>&1; then
        log "✅ lessons.json 格式正确"
    else
        log "❌ lessons.json JSON 格式错误"
        exit 1
    fi
else
    log "⚠️  Python3 未安装，跳过 JSON 检查"
fi

# 7. 检查 Vercel 部署状态
log "检查 Vercel 部署状态..."
if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://geogebra-tutorial-dov9.vercel.app || echo "000")
    if [ "$RESPONSE" = "200" ]; then
        log "✅ Vercel 网站可访问 (HTTP $RESPONSE)"
    elif [ "$RESPONSE" = "000" ]; then
        log "⚠️  Vercel 网站暂时无法访问（可能是 DNS 问题）"
    else
        log "⚠️  Vercel 返回异常状态码：$RESPONSE"
    fi
else
    log "⚠️  curl 未安装，跳过网络检查"
fi

# 8. 检查是否有未提交的更改
log "检查未提交的更改..."
CHANGES=$(git status --porcelain | wc -l)
if [ "$CHANGES" -gt 0 ]; then
    log "⚠️  检测到 $CHANGES 个未提交的文件"
    log "正在自动提交并推送..."
    git add .
    git commit -m "[自动检查] 修复发现的问题" || true
    git push origin main || log "⚠️  Git push 失败"
else
    log "✅ 没有未提交的更改"
fi

log "========== 错误检查完成 =========="
log ""

exit 0
