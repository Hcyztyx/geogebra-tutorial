# 🚀 一键部署到 Vercel

本脚本帮助你快速将 GeoGebra 教学网站部署到 Vercel，获得永久公网访问地址。

## 前置要求

1. **GitHub 账号** - https://github.com/signup
2. **Vercel 账号** - https://vercel.com/signup（可用 GitHub 登录）

## 部署步骤

### 方法一：通过 Vercel 官网（最简单）

1. **访问 Vercel**
   - 打开 https://vercel.com/new
   - 点击 "Continue with GitHub" 登录

2. **导入项目**
   - 点击 "Import Git Repository"
   - 选择你的 GitHub 仓库（或创建新仓库）
   - 点击 "Import"

3. **部署**
   - 保持默认设置
   - 点击 "Deploy"
   - 等待约 30 秒

4. **完成！**
   - 获得永久网址：`https://your-project.vercel.app`
   - 可点击 "Visit" 访问网站

### 方法二：使用 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
cd /path/to/geogebra-tutorial
vercel

# 4. 发布到生产环境
vercel --prod
```

## 自定义域名（可选）

部署后，可以在 Vercel 设置中添加自定义域名：

1. 进入项目设置
2. 选择 "Domains"
3. 添加你的域名
4. 按提示配置 DNS

## 自动更新

连接 GitHub 后，每次推送到 main 分支都会自动部署：

```bash
git add .
git commit -m "更新内容"
git push origin main
```

Vercel 会自动检测并部署更新，无需手动操作！

## 验证部署

部署完成后，检查以下功能：

- ✅ 网站首页正常加载
- ✅ 课程列表显示正常
- ✅ GeoGebra 画布可以加载
- ✅ 题目验证功能正常
- ✅ 提示系统可用
- ✅ 进度保存正常
- ✅ 移动端适配良好

## 遇到问题？

访问 Vercel 文档：https://vercel.com/docs

或查看项目 README.md 获取帮助。
