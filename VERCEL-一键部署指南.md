# 🚀 Vercel 一键部署指南

## ✅ 准备工作已完成

- ✅ 代码已推送到 GitHub
- ✅ vercel.json 配置已就绪
- ✅ 所有文件已更新（包括错误修复）

---

## 📋 部署步骤（5 步完成，约 2 分钟）

### 步骤 1️⃣：访问 Vercel
打开浏览器，访问：
```
https://vercel.com/new
```

### 步骤 2️⃣：登录/注册
**有三种登录方式（推荐 GitHub）：**
- 🔵 **GitHub**（推荐）- 点击 "Continue with GitHub"
- 🟣 GitLab
- 🔴 Bitbucket

**如果没有账号：**
1. 点击 "Sign Up" 注册
2. 使用邮箱或 GitHub 账号
3. 完全免费，无需信用卡

---

### 步骤 3️⃣：导入项目

登录后：

1. **点击 "Import Project"**（导入项目）

2. **选择 "Import Git Repository"**（导入 Git 仓库）

3. **找到你的仓库**：
   - 在列表中找到 `Hcyztyx/geogebra-tutorial`
   - 如果没看到，点击 "Adjust GitHub App Permissions" 授权 Vercel 访问

4. **点击 "Import"** 导入仓库

---

### 步骤 4️⃣：配置项目（保持默认即可）

**Project Name**（项目名称）：
- 默认：`geogebra-tutorial`
- 可以自定义，如：`geogebra-teacher`

**Framework Preset**（框架预设）：
- 选择：`Other`（其他）

**Build Command**（构建命令）：
- 留空（不需要构建）

**Output Directory**（输出目录）：
- 留空（默认为根目录）

**Install Command**（安装命令）：
- 留空

然后点击 **"Deploy"** 按钮！

---

### 步骤 5️⃣：等待部署完成

**部署过程：**
- ⏳ 约 30-60 秒
- 📊 可以看到实时日志
- ✅ 完成后显示 "Congratulations!"

**部署成功后：**
- 🎉 获得永久网址
- 格式：`https://geogebra-tutorial-xxx.vercel.app`
- 📱 全球 CDN 加速
- 🔒 自动 HTTPS

---

## 🎯 部署后的网址

部署完成后，你会获得：

### 主网址
```
https://geogebra-tutorial-[随机字符].vercel.app
```

### 可以自定义域名（可选）
1. 点击项目 → Settings → Domains
2. 添加你的域名
3. 按提示配置 DNS

---

## ✅ 验证部署

部署完成后：

1. **访问 Vercel 提供的网址**
2. **按 Ctrl+Shift+R 强制刷新**
3. **验证以下内容：**
   - ✅ 无错误弹窗
   - ✅ 显示"本网站由田老师委托贾维斯·兴创办"
   - ✅ 7 个课程全部可见
   - ✅ 左侧显示用户等级
   - ✅ 点击课程正常加载 GeoGebra

---

## 🔄 自动更新

**部署到 Vercel 后，代码更新会自动同步！**

以后每次：
```bash
git push origin main
```

Vercel 会自动：
1. ⏳ 检测到代码更新
2. 🔨 自动构建部署
3. ✅ 约 1 分钟后生效

**无需任何手动操作！**

---

## 📊 Vercel vs 腾讯云对比

| 特性 | Vercel | 腾讯云 CloudBase |
|------|--------|-----------------|
| 自动部署 | ✅ 推送即部署 | ❌ 需手动配置 |
| 部署速度 | ⚡ 30-60 秒 | 🐢 5-10 分钟 |
| 全球 CDN | ✅ 是 | ❌ 仅国内 |
| HTTPS | ✅ 自动 | ✅ 自动 |
| 免费额度 | ✅ 充足 | ✅ 充足 |
| 自定义域名 | ✅ 免费 | ✅ 免费 |
| 部署难度 | ⭐ 简单 | ⭐⭐⭐ 复杂 |

---

## 🐛 常见问题

### Q1: 找不到我的仓库？
**A:** 点击 "Adjust GitHub App Permissions"，授权 Vercel 访问你的 GitHub 仓库。

### Q2: 部署失败？
**A:** 
1. 检查 vercel.json 是否正确（已确认正确）
2. 查看部署日志
3. 截图错误信息告诉我

### Q3: 网址太长？
**A:** 可以在 Vercel Settings → Domains 添加自定义域名。

### Q4: 访问速度慢？
**A:** Vercel 在全球有 100+ CDN 节点，国内访问也很快。如果慢，可能是首次加载。

---

## 📞 需要帮助？

如果在部署过程中遇到任何问题：
1. 截图错误信息
2. 告诉我卡在哪一步
3. 我会立即协助解决

---

## 🎉 开始部署吧！

现在打开浏览器，访问：
```
https://vercel.com/new
```

按照上述步骤操作，2 分钟后你的网站就会上线！
