# 六经辨证用药指导 - Vercel 部署指南

## 部署前准备

### 1. 注册账号
- GitHub 账号：https://github.com/signup
- Vercel 账号：https://vercel.com/signup（用 GitHub 登录）

### 2. 获取 Supabase 配置
1. 登录 Supabase：https://supabase.com
2. 进入项目设置 → API
3. 复制以下信息：
   - Project URL（形如：https://xxxxx.supabase.co）
   - anon/public key
   - service_role key（secret）

## 部署步骤

### 第一步：上传代码到 GitHub

1. 在 GitHub 创建新仓库
   - 点击 "New repository"
   - 名称：`liujing-bianzheng`（或其他你喜欢的名字）
   - 选择 Public 或 Private
   - 点击 "Create repository"

2. 在本地项目目录执行以下命令：
```bash
cd /workspace/projects
git init
git add .
git commit -m "初始提交"
git branch -M main
git remote add origin https://github.com/你的用户名/liujing-bianzheng.git
git push -u origin main
```

### 第二步：在 Vercel 部署

1. 登录 Vercel：https://vercel.com
2. 点击 "Add New..." → "Project"
3. 点击 "Import Git Repository"
4. 选择刚才创建的 GitHub 仓库
5. 配置项目：
   - Framework Preset: Next.js
   - Build Command: `pnpm next build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

6. 添加环境变量（点击 "Environment Variables"）：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = 你的 service_role key
   - `COZE_PROJECT_ENV` = `PROD`

7. 点击 "Deploy"

### 第三步：等待部署完成

- 部署通常需要 2-5 分钟
- 完成后会获得一个永久域名：`https://liujing-bianzheng.vercel.app`

## 访问地址

- 客户端：`https://liujing-bianzheng.vercel.app`
- 后台：`https://liujing-bianzheng.vercel.app/admin`
- 密码：`123456`

## 自定义域名（可选）

1. 在阿里云/腾讯云购买域名（约 50-100 元/年）
2. 在 Vercel 项目设置 → Domains 中添加域名
3. 按提示配置 DNS 解析

## 常见问题

### Q: 部署失败怎么办？
A: 查看 Vercel 的部署日志，通常是环境变量配置问题

### Q: 数据库连接失败？
A: 检查 Supabase 配置是否正确，确保 service_role key 有足够权限

### Q: 域名变了怎么办？
A: Vercel 分配的 .vercel.app 域名是永久的，不会变化

## 技术支持

如有问题，联系微信：ZRLSGZRLS
