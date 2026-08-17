#!/bin/bash

echo "========================================="
echo "六经辨证用药指导 - Vercel 部署准备"
echo "========================================="
echo ""

# 检查必要文件
echo "检查必要文件..."
files=("package.json" "next.config.ts" "vercel.json" ".env.example")
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file 存在"
  else
    echo "  ✗ $file 缺失"
  fi
done

echo ""
echo "========================================="
echo "部署步骤："
echo "========================================="
echo ""
echo "1. 注册 GitHub 账号：https://github.com/signup"
echo "2. 注册 Vercel 账号：https://vercel.com/signup"
echo "3. 在 GitHub 创建新仓库"
echo "4. 执行以下命令上传代码："
echo ""
echo "   git init"
echo "   git add ."
echo "   git commit -m \"初始提交\""
echo "   git branch -M main"
echo "   git remote add origin https://github.com/你的用户名/仓库名.git"
echo "   git push -u origin main"
echo ""
echo "5. 在 Vercel 导入 GitHub 仓库"
echo "6. 配置环境变量（参考 .env.example）"
echo "7. 点击 Deploy"
echo ""
echo "详细步骤请查看：DEPLOY.md"
echo ""
echo "========================================="
