/**
 * GeoGebra 互动教学网站 - 主程序
 * 功能：课程管理、题目验证、提示系统、进度追踪
 */

class GeoGebraTutorial {
  constructor() {
    this.currentLesson = null;
    this.currentTask = null;
    this.lessons = [];
    this.userProgress = this.loadProgress();
    this.applet = null;
    this.init();
  }

  async init() {
    await this.loadLessons();
    this.renderLessonList();
    this.setupEventListeners();
    this.updateStats();
    console.log('GeoGebra Tutorial initialized');
  }

  // 加载课程数据
  async loadLessons() {
    try {
      const response = await fetch('data/lessons.json');
      const data = await response.json();
      this.lessons = data.lessons;
      this.settings = data.settings;
      console.log(`Loaded ${this.lessons.length} lessons`);
    } catch (error) {
      console.error('Failed to load lessons:', error);
      alert('加载课程数据失败，请刷新页面重试');
    }
  }

  // 渲染课程列表
  renderLessonList() {
    const lessonList = document.getElementById('lesson-list');
    lessonList.innerHTML = '';

    this.lessons.forEach((lesson, index) => {
      const isCompleted = this.isLessonCompleted(lesson.id);
      const li = document.createElement('li');
      li.className = `lesson-item ${this.currentLesson?.id === lesson.id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
      li.onclick = () => this.loadLesson(index);
      
      li.innerHTML = `
        <div>
          <strong>${lesson.title}</strong>
          <span class="difficulty ${lesson.difficulty}">${this.getDifficultyText(lesson.difficulty)}</span>
        </div>
        <div style="font-size: 0.85em; color: #666; margin-top: 5px;">
          ${lesson.tasks.length} 个任务
          ${isCompleted ? ' ✓' : ''}
        </div>
      `;
      
      lessonList.appendChild(li);
    });
  }

  getDifficultyText(level) {
    const texts = {
      beginner: '入门',
      intermediate: '进阶',
      advanced: '高级'
    };
    return texts[level] || level;
  }

  // 加载课程
  loadLesson(lessonIndex) {
    this.currentLesson = this.lessons[lessonIndex];
    this.currentTaskIndex = 0;
    
    // 找到第一个未完成的任务
    for (let i = 0; i < this.currentLesson.tasks.length; i++) {
      const task = this.currentLesson.tasks[i];
      if (!this.isTaskCompleted(task.id)) {
        this.currentTaskIndex = i;
        break;
      }
    }
    
    this.renderLessonList();
    this.loadTask(this.currentTaskIndex);
    this.initializeGeoGebra();
  }

  // 加载任务
  loadTask(taskIndex) {
    if (!this.currentLesson || taskIndex >= this.currentLesson.tasks.length) {
      this.showLessonComplete();
      return;
    }

    this.currentTask = this.currentLesson.tasks[taskIndex];
    this.attemptCount = 0;
    this.hintsShown = 0;

    // 更新 UI
    document.getElementById('task-title').textContent = this.currentTask.title;
    document.getElementById('task-instruction').innerHTML = `
      <strong>任务 ${taskIndex + 1}/${this.currentLesson.tasks.length}:</strong><br>
      ${this.currentTask.instruction}
    `;
    
    document.getElementById('task-number').textContent = 
      `课程：${this.currentLesson.title} | 任务 ${taskIndex + 1}/${this.currentLesson.tasks.length}`;
    
    // 重置提示和反馈
    document.getElementById('hint-section').innerHTML = `
      <h3>💡 需要提示吗？</h3>
      <button class="btn btn-warning" onclick="tutorial.showHint()">
        获取提示 (${this.currentTask.hints.length - this.hintsShown} 个可用)
      </button>
    `;
    
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('attempt-counter').style.display = 'none';
    
    // 更新验证按钮
    document.getElementById('check-btn').disabled = false;
    document.getElementById('check-btn').textContent = '✓ 检查答案';
    
    // 滚动到顶部
    document.querySelector('.task-panel').scrollIntoView({ behavior: 'smooth' });
  }

  // 初始化 GeoGebra
  initializeGeoGebra() {
    const container = document.getElementById('geogebra-container');
    container.innerHTML = '<div class="spinner"></div><p style="text-align:center;">正在加载 GeoGebra...</p>';

    // 使用 GeoGebra Web API
    const parameters = {
      id: "geogebra-applet",
      appName: "graphing",
      appletOnLoad: function(api) {
        tutorial.applet = api;
        console.log('GeoGebra applet loaded');
        tutorial.resetGeoGebra();
      },
      scaleContainerRatio: true,
      allowStyleBar: true,
      showToolBar: true,
      showAlgebraInput: true,
      showResetIcon: true,
      showFullscreenButton: true,
      useBrowserForJS: true
    };

    // 注入 GeoGebra API
    const script = document.createElement('script');
    script.src = 'https://www.geogebra.org/apps/deployggb.js';
    script.onload = () => {
      const applet = new GGBApplet(parameters, '6.0');
      applet.inject('geogebra-container');
    };
    document.head.appendChild(script);
  }

  // 重置 GeoGebra 画布
  resetGeoGebra() {
    if (this.applet) {
      try {
        // 使用英文命令避免兼容性问题
        this.applet.evalCommand('DeleteAll()');
        
        // 设置坐标轴范围
        this.applet.setCoordSystem(-10, -10, 10, 10);
      } catch (err) {
        console.log('GeoGebra reset:', err.message);
      }
    }
  }

  // 显示提示
  showHint() {
    if (!this.currentTask || this.hintsShown >= this.currentTask.hints.length) {
      return;
    }

    const hint = this.currentTask.hints[this.hintsShown];
    const hintSection = document.getElementById('hint-section');
    
    const hintDiv = document.createElement('div');
    hintDiv.className = 'hint';
    hintDiv.innerHTML = `<strong>提示 ${this.hintsShown + 1}:</strong> ${hint}`;
    
    hintSection.appendChild(hintDiv);
    this.hintsShown++;
    
    // 更新按钮
    const remaining = this.currentTask.hints.length - this.hintsShown;
    const btn = hintSection.querySelector('button');
    if (btn) {
      btn.textContent = `获取提示 (${remaining} 个可用)`;
      if (remaining <= 0) {
        btn.disabled = true;
        btn.textContent = '提示已用完';
      }
    }
    
    // 记录尝试次数（显示提示会减少分数）
    this.attemptCount++;
    this.updateAttemptCounter();
  }

  // 更新尝试计数器
  updateAttemptCounter() {
    const counter = document.getElementById('attempt-counter');
    counter.style.display = 'block';
    counter.innerHTML = `⚠️ 当前尝试次数：${this.attemptCount} | 使用提示会降低得分`;
  }

  // 检查答案
  checkAnswer() {
    if (!this.currentTask || !this.applet) {
      alert('请先加载 GeoGebra 画布');
      return;
    }

    const validation = this.currentTask.validation;
    let isCorrect = false;
    let message = '';

    switch (validation.type) {
      case 'object-exists':
        isCorrect = this.validateObjectExists(validation);
        break;
      case 'point-coordinates':
        isCorrect = this.validatePointCoordinates(validation);
        break;
      case 'multiple-points':
        isCorrect = this.validateMultiplePoints(validation);
        break;
      case 'segment-exists':
        isCorrect = this.validateSegmentExists(validation);
        break;
      case 'line-exists':
        isCorrect = this.validateLineExists(validation);
        break;
      case 'circle-radius':
        isCorrect = this.validateCircleRadius(validation);
        break;
      case 'function-exists':
        isCorrect = this.validateFunctionExists(validation);
        break;
      default:
        // 默认验证：检查对象是否存在
        isCorrect = this.validateObjectExists({objectName: 'A'});
    }

    this.attemptCount++;
    
    if (isCorrect) {
      this.handleSuccess(validation.message);
    } else {
      this.handleFailure();
    }
  }

  // 验证方法
  validateObjectExists(validation) {
    try {
      const obj = this.applet.getObject(validation.objectName);
      return obj !== null && obj !== undefined;
    } catch (e) {
      return false;
    }
  }

  validatePointCoordinates(validation) {
    try {
      const x = this.applet.getXcoord(validation.objectName);
      const y = this.applet.getYcoord(validation.objectName);
      const tol = validation.tolerance || 0.1;
      return Math.abs(x - validation.expectedX) < tol && 
             Math.abs(y - validation.expectedY) < tol;
    } catch (e) {
      return false;
    }
  }

  validateMultiplePoints(validation) {
    const tol = validation.tolerance || 0.1;
    return validation.points.every(p => {
      try {
        const x = this.applet.getXcoord(p.name);
        const y = this.applet.getYcoord(p.name);
        return Math.abs(x - p.x) < tol && Math.abs(y - p.y) < tol;
      } catch (e) {
        return false;
      }
    });
  }

  validateSegmentExists(validation) {
    return this.validateObjectExists(validation);
  }

  validateLineExists(validation) {
    return this.validateObjectExists(validation);
  }

  validateCircleRadius(validation) {
    try {
      const circle = this.applet.getObject(validation.centerName);
      if (!circle) return false;
      
      // 获取圆的半径（通过计算圆上一点到圆心的距离）
      const radius = this.applet.getLength(validation.centerName);
      const tol = validation.tolerance || 0.1;
      return Math.abs(radius - validation.expectedRadius) < tol;
    } catch (e) {
      return false;
    }
  }

  validateFunctionExists(validation) {
    try {
      const func = this.applet.getObject(validation.functionName);
      return func !== null && func !== undefined;
    } catch (e) {
      return false;
    }
  }

  // 处理成功
  handleSuccess(message) {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = `<div class="feedback success">${message}</div>`;
    
    // 计算得分
    const basePoints = this.currentTask.points;
    const penalty = this.attemptCount > 1 ? (this.attemptCount - 1) * 5 : 0;
    const hintPenalty = this.hintsShown * 5;
    const finalScore = Math.max(basePoints - penalty - hintPenalty, basePoints * 0.5);
    
    // 保存进度
    this.saveTaskProgress(this.currentTask.id, finalScore);
    
    // 禁用检查按钮
    document.getElementById('check-btn').disabled = true;
    document.getElementById('check-btn').textContent = '✓ 已完成';
    
    // 显示下一题按钮
    setTimeout(() => {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.innerHTML = '→ 下一题';
      nextBtn.onclick = () => {
        this.currentTaskIndex++;
        this.loadTask(this.currentTaskIndex);
        this.resetGeoGebra();
      };
      
      const nav = document.querySelector('.task-navigation');
      nav.innerHTML = '';
      nav.appendChild(nextBtn);
    }, 1000);
    
    this.updateStats();
  }

  // 处理失败
  handleFailure() {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = `
      <div class="feedback error">
        还未正确完成，请再试一次。<br>
        <small>如果遇到困难，可以使用提示功能</small>
      </div>
    `;
    
    if (this.attemptCount >= this.settings.maxAttempts) {
      feedback.innerHTML += `
        <div class="feedback warning" style="background: #fff3cd; color: #856404; margin-top: 10px;">
          已达到最大尝试次数，是否查看答案并继续下一题？
          <br>
          <button class="btn btn-warning" style="margin-top: 10px;" onclick="tutorial.skipTask()">
            跳过此题
          </button>
        </div>
      `;
    }
  }

  // 跳过任务
  skipTask() {
    this.currentTaskIndex++;
    this.loadTask(this.currentTaskIndex);
    this.resetGeoGebra();
  }

  // 显示课程完成
  showLessonComplete() {
    const modal = document.getElementById('completion-modal');
    const totalScore = this.calculateLessonScore();
    const maxScore = this.calculateMaxScore();
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    document.getElementById('completion-title').textContent = 
      percentage >= 60 ? '🎉 课程完成！' : '💪 继续加油！';
    document.getElementById('completion-score').textContent = 
      `得分：${totalScore} / ${maxScore} (${percentage}%)`;
    document.getElementById('completion-message').textContent = 
      percentage >= 60 ? '太棒了！你已经掌握了本课程的内容。' : '多练习几次，你一定能做得更好！';
    
    modal.classList.add('active');
    
    // 标记课程完成
    if (percentage >= 60) {
      this.saveLessonCompletion(this.currentLesson.id);
    }
  }

  // 计算分数
  calculateLessonScore() {
    if (!this.currentLesson) return 0;
    return this.currentLesson.tasks.reduce((sum, task) => {
      const progress = this.userProgress.tasks[task.id];
      return sum + (progress ? progress.score : 0);
    }, 0);
  }

  calculateMaxScore() {
    if (!this.currentLesson) return 0;
    return this.currentLesson.tasks.reduce((sum, task) => sum + task.points, 0);
  }

  // 进度管理
  loadProgress() {
    const saved = localStorage.getItem('geogebra-tutorial-progress');
    return saved ? JSON.parse(saved) : {
      lessons: {},
      tasks: {},
      totalScore: 0
    };
  }

  saveProgress() {
    localStorage.setItem('geogebra-progress', JSON.stringify(this.userProgress));
    this.updateStats();
  }

  saveTaskProgress(taskId, score) {
    this.userProgress.tasks[taskId] = {
      completed: true,
      score: score,
      completedAt: new Date().toISOString()
    };
    this.userProgress.totalScore += score;
    this.saveProgress();
  }

  saveLessonCompletion(lessonId) {
    this.userProgress.lessons[lessonId] = {
      completed: true,
      completedAt: new Date().toISOString()
    };
    this.saveProgress();
  }

  isTaskCompleted(taskId) {
    return this.userProgress.tasks[taskId]?.completed || false;
  }

  isLessonCompleted(lessonId) {
    return this.userProgress.lessons[lessonId]?.completed || false;
  }

  // 更新统计
  updateStats() {
    const totalTasks = this.lessons.reduce((sum, lesson) => sum + lesson.tasks.length, 0);
    const completedTasks = Object.keys(this.userProgress.tasks).length;
    const completedLessons = Object.keys(this.userProgress.lessons).length;
    
    document.getElementById('stat-total-tasks').textContent = totalTasks;
    document.getElementById('stat-completed-tasks').textContent = completedTasks;
    document.getElementById('stat-completed-lessons').textContent = completedLessons;
    document.getElementById('stat-total-score').textContent = this.userProgress.totalScore;
    
    // 更新进度条
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    document.getElementById('progress-fill').style.width = `${percentage}%`;
    document.getElementById('progress-fill').textContent = `${percentage}%`;
  }

  // 事件监听
  setupEventListeners() {
    // 检查答案按钮
    document.getElementById('check-btn').onclick = () => this.checkAnswer();
    
    // 关闭完成模态框
    document.getElementById('close-modal').onclick = () => {
      document.getElementById('completion-modal').classList.remove('active');
      // 返回课程列表
      this.currentLesson = null;
      this.renderLessonList();
      document.getElementById('geogebra-container').innerHTML = 
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">选择一个课程开始学习</div>';
    };
    
    // 重置进度
    document.getElementById('reset-progress').onclick = () => {
      if (confirm('确定要重置所有进度吗？此操作不可恢复。')) {
        localStorage.removeItem('geogebra-tutorial-progress');
        this.userProgress = { lessons: {}, tasks: {}, totalScore: 0 };
        this.updateStats();
        this.renderLessonList();
        alert('进度已重置');
      }
    };
  }
}

// 初始化应用
let tutorial;
document.addEventListener('DOMContentLoaded', () => {
  tutorial = new GeoGebraTutorial();
});
