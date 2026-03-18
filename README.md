# GeoGebra 互动教学平台

一个互动式的 GeoGebra 学习网站，通过实践任务帮助用户循序渐进地掌握 GeoGebra 的使用方法。

## 🌐 访问地址

### 本地访问
```bash
cd geogebra-tutorial
python3 -m http.server 8080
```
然后访问：http://localhost:8080

### 公网访问（部署后）
部署到 Vercel 后获得永久网址：`https://your-project.vercel.app`

详见 [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md)

## 📚 课程内容

### 课程 1: 基础入门 - 点的创建
- 创建第一个点
- 创建指定坐标的点
- 创建多个点

### 课程 2: 线段与直线
- 连接两点创建线段
- 创建直线
- 创建垂直线

### 课程 3: 圆与圆弧
- 创建圆（圆心和半径）
- 创建圆（圆心和点）
- 创建圆弧

### 课程 4: 函数图像
- 绘制线性函数
- 绘制二次函数
- 使用滑块创建动态函数

### 课程 5: 几何变换
- 平移变换
- 旋转变换
- 轴对称变换

## ✨ 功能特点

### 🎯 互动学习
- 直接在 GeoGebra 画布中操作
- 实时验证答案正确性
- 即时反馈和评分

### 💡 智能提示
- 每个任务提供多个提示
- 逐步引导用户完成任务
- 使用提示会适当降低得分

### 📊 进度追踪
- 本地存储学习进度
- 显示完成百分比
- 记录总得分

### 🏆 评分系统
- 根据尝试次数计算得分
- 首次完成得分最高
- 60 分以上算通过

## 🚀 使用方法

1. **启动服务器**
   ```bash
   cd /home/admin/openclaw/workspace/geogebra-tutorial
   python3 -m http.server 8080
   ```

2. **访问网站**
   - 打开浏览器访问：http://localhost:8080

3. **开始学习**
   - 从左侧选择一个课程
   - 阅读任务说明
   - 在 GeoGebra 画布中完成任务
   - 点击「检查答案」验证
   - 完成后进入下一题

## 📁 项目结构

```
geogebra-tutorial/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式表
├── js/
│   └── app.js          # 主程序逻辑
└── data/
    └── lessons.json    # 课程数据配置
```

## 🔧 扩展课程

要添加新的课程，编辑 `data/lessons.json` 文件，按照现有格式添加新的 lesson 对象。

### 题目验证类型

- `object-exists` - 检查对象是否存在
- `point-coordinates` - 验证点的坐标
- `multiple-points` - 验证多个点
- `segment-exists` - 检查线段
- `line-exists` - 检查直线
- `circle-radius` - 验证圆的半径
- `function-exists` - 检查函数

## 💾 数据存储

学习进度保存在浏览器的 localStorage 中：
- 已完成的课程
- 每个任务的得分
- 总进度百分比

## 🎨 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **JavaScript (ES6+)** - 交互逻辑
- **GeoGebra Web API** - 数学画布集成
- **localStorage** - 本地数据存储

## 📝 注意事项

1. 需要联网才能加载 GeoGebra API
2. 建议使用现代浏览器（Chrome、Firefox、Edge）
3. 进度保存在本地，清除浏览器数据会丢失进度
4. GeoGebra 画布加载可能需要几秒钟

## 🎯 学习建议

1. 按顺序完成课程，从入门到高级
2. 尽量不使用提示独立完成，得分更高
3. 完成课程后可以重复练习提高分数
4. 善用 GeoGebra 的工具栏探索更多功能

## 🛠️ 故障排除

### GeoGebra 画布无法加载
- 检查网络连接
- 刷新页面重试
- 检查浏览器控制台是否有错误

### 进度丢失
- 进度保存在浏览器 localStorage
- 清除浏览器数据会重置进度
- 建议使用同一浏览器继续学习

### 部署后无法访问
- 检查 Vercel 部署状态
- 查看 Vercel 项目日志
- 确认文件已正确上传到 GitHub

## 📞 支持与反馈

如有问题或建议，欢迎反馈！

---

**祝你学习愉快！** 🎉
