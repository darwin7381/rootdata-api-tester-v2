#!/bin/bash

# 确保 Vercel CLI 已安装
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 确保 .env 文件存在
if [ ! -f .env ]; then
    echo "错误: .env 文件不存在，请先创建 .env 文件并设置 ROOTDATA_API_KEY"
    exit 1
fi

# 检查 API 密钥是否已设置
if ! grep -q "ROOTDATA_API_KEY" .env; then
    echo "错误: .env 文件中未设置 ROOTDATA_API_KEY"
    exit 1
fi

# 部署到 Vercel
echo "正在部署到 Vercel..."
vercel --prod

echo "部署完成！请检查上面的 URL 以访问您的应用。"
echo "如果您的应用无法正常工作，请确保在 Vercel 项目设置中添加了环境变量 ROOTDATA_API_KEY。" 