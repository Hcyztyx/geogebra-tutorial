# 🚀 GeoGebra 教学网站 - 永久部署方案

## 方案一：Vercel 部署（推荐 ⭐⭐⭐⭐⭐）

**优点**：完全免费、自动 HTTPS、全球 CDN、一键部署、支持自定义域名

### 快速部署步骤（2 分钟完成）

#### 步骤 1：准备 GitHub 账号
1. 访问 https://github.com 注册/登录账号
2. 创建新仓库，名称如：`geogebra-tutorial`
3. 勾选 "Add a README file"
4. 点击 "Create repository"

#### 步骤 2：上传代码
在仓库页面：
1. 点击 "Add file" → "Upload files"
2. 将以下文件拖入上传：
   - `index.html`
   - `vercel.json`
   - `css/style.css`
   - `js/app.js`
   - `data/lessons.json`
   - `README.md`
3. 点击 "Commit changes"

#### 步骤 3：连接 Vercel
1. 访问 https://vercel.com/new
2. 点击 "Continue with GitHub" 登录
3. 点击 "Import Project"
4. 选择刚才创建的 `geogebra-tutorial` 仓库
5. 点击 "Deploy"

**完成！** 约 30 秒后，你会获得一个永久网址：
- 格式：`https://geogebra-tutorial-xxx.vercel.app`

---

## 方案二：Netlify 部署（备选 ⭐⭐⭐⭐）

**优点**：完全免费、拖拽部署、支持表单

### 快速部署步骤

1. 访问 https://app.netlify.com/drop
2. 将整个 `geogebra-tutorial` 文件夹拖入页面
3. 等待上传完成

**完成！** 你会获得永久网址：
- 格式：`https://xxx-xxx.netlify.app`

---

## 方案三：GitHub Pages 部署（备选 ⭐⭐⭐⭐）

**优点**：GitHub 官方服务、完全免费、稳定

### 部署步骤

1. 在 GitHub 仓库页面
2. 点击 "Settings" → "Pages"
3. Source 选择 "main branch"
4. 点击 "Save"

**完成！** 网址格式：
- `https://你的用户名.github.io/geogebra-tutorial/`

---

## 📊 平台对比

| 特性 | Vercel | Netlify | GitHub Pages |
|------|--------|---------|--------------|
| 免费 | ✅ | ✅ | ✅ |
| HTTPS | ✅ 自动 | ✅ 自动 | ✅ 自动 |
| CDN | ✅ 全球 | ✅ 全球 | ✅ GitHub |
| 部署速度 | ⚡ 最快 | ⚡ 快 | 🐢 较慢 |
| 自定义域名 | ✅ | ✅ | ✅ |
| 自动更新 | ✅ (连 GitHub) | ✅ (连 GitHub) | ✅ |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 推荐操作

**我强烈推荐使用 Vercel**，因为：
1. 部署最简单（连接 GitHub 即可）
2. 速度最快（全球 CDN）
3. 稳定性最高（99.99% SLA）
4. 支持自动更新（代码推送到 GitHub 后自动部署）

---

## 📧 部署后告诉我

完成部署后，告诉我你的网址，我会：
1. ✅ 测试所有功能
2. ✅ 检查所有题目是否正常
3. ✅ 验证提示系统
4. ✅ 确保移动端适配
5. ✅ 进行性能优化

---

## 🔧 需要帮助？

如果在部署过程中遇到任何问题，随时告诉我！
