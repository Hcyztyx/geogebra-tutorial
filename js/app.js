/**
 * GeoGebra 互动教学网站 - 主程序 v2.0
 * 功能：课程管理、题目验证、提示系统、进度追踪、评分系统、成就系统
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
    this.checkAchievements();
    console.log('GeoGebra Tutorial v2.0 initialized');
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
      
      const stars = this.getLessonStars(lesson.id);
      const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
      
      li.innerHTML = `
        <div>
          <strong>${lesson.title}</strong>
          <span class="difficulty ${lesson.difficulty}">${this.getDifficultyText(lesson.difficulty)}</span>
        </div>
        <div style="font-size: 0.85em; color: #666; margin-top: 5px;">
          ${lesson.tasks.length} 个任务 | ${starsDisplay}
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
      advanced: '高级',
      expert: '专家'
    };
    return texts[level] || level;
  }

  // 获取课程星级
  getLessonStars(lessonId) {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson) return 0;
    
    const totalScore = lesson.tasks.reduce((sum, task) => {
      const progress = this.userProgress.tasks[task.id];
      return sum + (progress ? progress.score : 0);
    }, 0);
    
    const maxScore = lesson.tasks.reduce((sum, task) => sum + task.points, 0);
    const percentage = totalScore / maxScore;
    
    if (percentage >= 0.9) return 5;
    if (percentage >= 0.7) return 4;
    if (percentage >= 0.5) return 3;
    if (percentage >= 0.3) return 2;
    if (percentage > 0) return 1;
    return 0;
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
      `课程：${this.currentLesson.title} | 任务 ${taskIndex + 1}/${this.currentLesson.tasks.length} | 分值：${this.currentTask.points}`;
    
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

    const parameters = {
      id: "geogebra-applet",
      appName: "graphing",
      appletOnLoad: (api) => {
        this.applet = api;
        console.log('GeoGebra applet loaded');
        // 不执行任何清空操作，让 GeoGebra 使用默认状态
      },
      scaleContainerRatio: true,
      allowStyleBar: false,
      showToolBar: true,
      showAlgebraInput: true,
      showResetIcon: false,
      showFullscreenButton: true,
      useBrowserForJS: true,
      // 禁用所有错误提示
      showErrorDialog: false,
      errorDialogHandler: () => {},
      showLogging: false,
      onError: (e) => {
        console.log('GeoGebra error caught and suppressed:', e);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://www.geogebra.org/apps/deployggb.js';
    script.onload = () => {
      try {
        const applet = new GGBApplet(parameters, '6.0');
        applet.inject('geogebra-container');
      } catch (error) {
        console.error('Failed to inject GeoGebra:', error);
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load GeoGebra script:', error);
    };
    document.head.appendChild(script);
  }

  // 重置 GeoGebra 画布
  resetGeoGebra() {
    // 暂时不执行清空操作，避免弹窗错误
    // 让用户手动使用 GeoGebra 的重置按钮
    if (this.applet) {
      console.log('GeoGebra ready for task');
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
    
    const remaining = this.currentTask.hints.length - this.hintsShown;
    const btn = hintSection.querySelector('button');
    if (btn) {
      btn.textContent = `获取提示 (${remaining} 个可用)`;
      if (remaining <= 0) {
        btn.disabled = true;
        btn.textContent = '提示已用完';
      }
    }
    
    this.attemptCount++;
    this.updateAttemptCounter();
  }

  // 更新尝试计数器
  updateAttemptCounter() {
    const counter = document.getElementById('attempt-counter');
    counter.style.display = 'block';
    counter.innerHTML = `⚠️ 尝试次数：${this.attemptCount} | 使用提示会降低得分`;
  }

  // 检查答案
  checkAnswer() {
    if (!this.currentTask || !this.applet) {
      alert('请先加载 GeoGebra 画布');
      return;
    }

    const validation = this.currentTask.validation;
    let isCorrect = false;

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
      case 'square':
        isCorrect = this.validateSquare(validation);
        break;
      case 'five-circles':
        isCorrect = this.validateFiveCircles(validation);
        break;
      case 'multiple-functions':
        isCorrect = this.validateMultipleFunctions(validation);
        break;
      case 'free-creation':
        isCorrect = this.validateFreeCreation(validation);
        break;
      default:
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

  validateSquare(validation) {
    try {
      const points = validation.points;
      const tol = validation.tolerance || 0.2;
      const sideLength = validation.sideLength;
      
      // 检查四个点是否存在
      for (let p of points) {
        if (!this.applet.getObject(p)) return false;
      }
      
      // 检查边长
      const dist = (p1, p2) => {
        const x1 = this.applet.getXcoord(p1);
        const y1 = this.applet.getYcoord(p1);
        const x2 = this.applet.getXcoord(p2);
        const y2 = this.applet.getYcoord(p2);
        return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
      };
      
      const sides = [
        dist(points[0], points[1]),
        dist(points[1], points[2]),
        dist(points[2], points[3]),
        dist(points[3], points[0])
      ];
      
      return sides.every(s => Math.abs(s - sideLength) < tol);
    } catch (e) {
      return false;
    }
  }

  validateFiveCircles(validation) {
    try {
      const tol = validation.tolerance || 0.2;
      const radius = validation.radius;
      
      // 检查是否有 5 个圆
      let circleCount = 0;
      for (let i = 0; i < 20; i++) {
        const obj = this.applet.getObject(`c${i+1}`);
        if (obj && obj.getTypeName() === 'conic') {
          circleCount++;
        }
      }
      
      return circleCount >= 5;
    } catch (e) {
      return false;
    }
  }

  validateMultipleFunctions(validation) {
    try {
      return validation.functions.every((func, index) => {
        const obj = this.applet.getObject(`f${index+1}`);
        return obj !== null;
      });
    } catch (e) {
      return false;
    }
  }

  validateFreeCreation(validation) {
    try {
      // 检查对象数量
      let objectCount = 0;
      for (let i = 0; i < 100; i++) {
        const obj = this.applet.getObject(`a${i+1}`);
        if (obj) objectCount++;
      }
      
      return objectCount >= validation.minObjects;
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
    const attemptMultiplier = Math.max(0.5, 1 - (this.attemptCount - 1) * 0.2);
    const hintPenalty = this.hintsShown * this.settings.scoreMultipliers.hintPenalty;
    const finalScore = Math.round(basePoints * attemptMultiplier * (1 - hintPenalty));
    
    // 保存进度
    this.saveTaskProgress(this.currentTask.id, finalScore);
    
    // 检查成就
    this.checkAchievements();
    
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
    
    const maxAttempts = this.currentTask.maxAttempts || this.settings.maxAttempts;
    if (this.attemptCount >= maxAttempts) {
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
    
    const stars = this.getLessonStars(this.currentLesson.id);
    const starsDisplay = '⭐'.repeat(stars);
    
    document.getElementById('completion-title').textContent = 
      percentage >= 60 ? '🎉 课程完成！' : '💪 继续加油！';
    document.getElementById('completion-score').textContent = 
      `得分：${totalScore} / ${maxScore} (${percentage}%) ${starsDisplay}`;
    document.getElementById('completion-message').textContent = 
      percentage >= 60 ? '太棒了！你已经掌握了本课程的内容。' : '多练习几次，你一定能做得更好！';
    
    // 显示用户等级
    const rank = this.getUserRank();
    document.getElementById('completion-message').innerHTML += 
      `<br><br>🏅 当前等级：<strong>${rank.icon} ${rank.name}</strong>`;
    
    modal.classList.add('active');
    
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

  // 获取用户等级
  getUserRank() {
    const totalScore = this.userProgress.totalScore || 0;
    const ranks = this.settings.rankLevels || [];
    
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (totalScore >= ranks[i].minScore) {
        return ranks[i];
      }
    }
    
    return ranks[0] || {name: '初学者', icon: '🌱'};
  }

  // 检查成就
  checkAchievements() {
    const achievements = this.settings.achievements || [];
    const unlockedAchievements = this.userProgress.achievements || [];
    
    achievements.forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first-task':
          shouldUnlock = Object.keys(this.userProgress.tasks).length >= 1;
          break;
        case 'lesson-complete':
          shouldUnlock = Object.keys(this.userProgress.lessons).length >= 1;
          break;
        case 'perfect-score':
          // 检查是否有一次满分的任务
          shouldUnlock = Object.values(this.userProgress.tasks).some(t => {
            const task = this.lessons.flatMap(l => l.tasks).find(tk => tk.id === t.taskId);
            return task && t.score === task.points;
          });
          break;
        case 'challenge-master':
          shouldUnlock = this.userProgress.totalScore >= 1000;
          break;
        case 'artist':
          shouldUnlock = this.userProgress.totalScore >= 2000;
          break;
        case 'legend':
          shouldUnlock = this.userProgress.totalScore >= 3000;
          break;
      }
      
      if (shouldUnlock) {
        this.unlockAchievement(achievement);
      }
    });
  }

  // 解锁成就
  unlockAchievement(achievement) {
    if (!this.userProgress.achievements) {
      this.userProgress.achievements = [];
    }
    
    this.userProgress.achievements.push(achievement.id);
    this.saveProgress();
    
    // 显示成就通知
    this.showAchievementNotification(achievement);
  }

  // 显示成就通知
  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: slideIn 0.5s;">
        <div style="font-size: 2em; margin-bottom: 10px;">${achievement.icon}</div>
        <div style="font-weight: bold; font-size: 1.2em;">成就解锁！</div>
        <div>${achievement.name}</div>
        <div style="font-size: 0.9em; opacity: 0.9;">${achievement.description}</div>
      </div>
    `;
    
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.5s';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // 进度管理
  loadProgress() {
    const saved = localStorage.getItem('geogebra-tutorial-progress');
    return saved ? JSON.parse(saved) : {
      lessons: {},
      tasks: {},
      achievements: [],
      totalScore: 0
    };
  }

  saveProgress() {
    localStorage.setItem('geogebra-tutorial-progress', JSON.stringify(this.userProgress));
    this.updateStats();
  }

  saveTaskProgress(taskId, score) {
    this.userProgress.tasks[taskId] = {
      completed: true,
      score: score,
      completedAt: new Date().toISOString(),
      attempts: this.attemptCount,
      hints: this.hintsShown
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
    const totalScore = this.userProgress.totalScore;
    
    document.getElementById('stat-total-tasks').textContent = totalTasks;
    document.getElementById('stat-completed-tasks').textContent = completedTasks;
    document.getElementById('stat-completed-lessons').textContent = completedLessons;
    document.getElementById('stat-total-score').textContent = totalScore;
    
    // 显示用户等级
    const rank = this.getUserRank();
    const rankElement = document.getElementById('user-rank');
    if (rankElement) {
      rankElement.innerHTML = `🏅 ${rank.icon} ${rank.name}`;
    }
    
    // 更新进度条
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    document.getElementById('progress-fill').style.width = `${percentage}%`;
    document.getElementById('progress-fill').textContent = `${percentage}%`;
  }

  // 事件监听
  setupEventListeners() {
    document.getElementById('check-btn').onclick = () => this.checkAnswer();
    
    document.getElementById('close-modal').onclick = () => {
      document.getElementById('completion-modal').classList.remove('active');
      this.currentLesson = null;
      this.renderLessonList();
      document.getElementById('geogebra-container').innerHTML = 
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">选择一个课程开始学习</div>';
    };
    
    document.getElementById('reset-progress').onclick = () => {
      if (confirm('确定要重置所有进度吗？此操作不可恢复。')) {
        localStorage.removeItem('geogebra-tutorial-progress');
        this.userProgress = { lessons: {}, tasks: {}, achievements: [], totalScore: 0 };
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
