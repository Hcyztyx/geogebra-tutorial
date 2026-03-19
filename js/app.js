/**
 * GeoGebra 闯关学习网站 - 主程序 v3.0
 * 游戏化学习系统 - 闯关模式
 */

class GeoGebraGame {
  constructor() {
    // 游戏状态
    this.currentChapter = 1;
    this.currentLevel = 1;
    this.currentTask = 1;
    this.userScore = 0;
    this.userLevel = '初学者';
    this.completedLevels = [];
    this.levelStars = {};
    
    // 当前关卡数据
    this.chapters = [];
    this.currentLevelData = null;
    this.currentTaskData = null;
    
    // GeoGebra
    this.applet = null;
    this.ggbReady = false;
    
    // 任务状态
    this.attemptCount = 0;
    this.hintsUsed = 0;
    this.taskStartTime = null;
    
    // 连击系统
    this.comboCount = 0;
    this.lastCompleteTime = null;
    
    // 初始化
    this.init();
  }

  async init() {
    await this.loadChapters();
    this.loadProgress();
    this.renderLevelList();
    this.updateUserStats();
    this.setupEventListeners();
    console.log('🎮 GeoGebra 闯关学习 v3.0 已启动');
  }

  // ========== 数据加载 ==========

  async loadChapters() {
    try {
      const response = await fetch('data/lessons.json');
      const data = await response.json();
      this.chapters = data.chapters || data.lessons || [];
      console.log(`📚 加载了 ${this.chapters.length} 个章节`);
    } catch (error) {
      console.error('加载章节失败:', error);
      alert('加载课程数据失败，请刷新页面重试');
    }
  }

  loadProgress() {
    const saved = localStorage.getItem('geogebra-progress');
    if (saved) {
      const progress = JSON.parse(saved);
      this.userScore = progress.score || 0;
      this.completedLevels = progress.completedLevels || [];
      this.levelStars = progress.levelStars || {};
      this.comboCount = progress.comboCount || 0;
    }
  }

  saveProgress() {
    const progress = {
      score: this.userScore,
      completedLevels: this.completedLevels,
      levelStars: this.levelStars,
      comboCount: this.comboCount,
      lastSave: Date.now()
    };
    localStorage.setItem('geogebra-progress', JSON.stringify(progress));
  }

  // ========== 用户等级系统 ==========

  getUserLevel(score) {
    if (score >= 1000) return { name: '大师', icon: '👑' };
    if (score >= 600) return { name: '专家', icon: '🏆' };
    if (score >= 300) return { name: '熟练者', icon: '🥇' };
    if (score >= 100) return { name: '练习者', icon: '🥈' };
    return { name: '初学者', icon: '🥉' };
  }

  updateUserStats() {
    const levelInfo = this.getUserLevel(this.userScore);
    this.userLevel = levelInfo.name;
    
    document.getElementById('user-score').textContent = this.userScore;
    document.getElementById('user-level').innerHTML = `
      <span class="icon">${levelInfo.icon}</span>
      <span class="level-name">${levelInfo.name}</span>
    `;
    
    const totalLevels = this.chapters.reduce((sum, ch) => sum + (ch.levels?.length || 0), 0);
    document.getElementById('user-progress').textContent = `${this.completedLevels.length}/${totalLevels}`;
  }

  addScore(points, isCombo = false) {
    const comboMultiplier = isCombo && this.comboCount > 1 ? 1 + (this.comboCount * 0.1) : 1;
    const finalPoints = Math.round(points * comboMultiplier);
    this.userScore += finalPoints;
    
    if (isCombo && this.comboCount > 1) {
      this.showComboEffect(this.comboCount);
    }
    
    this.showScoreIncrease(finalPoints);
    this.updateUserStats();
    this.saveProgress();
    this.checkLevelUp();
  }

  checkLevelUp() {
    const oldLevel = this.userLevel;
    const newLevelInfo = this.getUserLevel(this.userScore);
    
    if (newLevelInfo.name !== oldLevel) {
      this.userLevel = newLevelInfo.name;
      this.showLevelUpAnimation();
    }
  }

  // ========== 渲染 ==========

  renderLevelList() {
    const container = document.getElementById('level-list');
    if (!container) return;
    
    let html = '';
    
    this.chapters.forEach((chapter, chIndex) => {
      const levels = chapter.levels || chapter.tasks || [];
      if (!levels.length) return;
      
      html += `
        <div class="chapter-section">
          <div class="chapter-title">
            <span>${chapter.icon || '📖'}</span>
            <span>${chapter.title || `第${chIndex + 1}章`}</span>
          </div>
          <ul class="level-list">
      `;
      
      levels.forEach((level, levelIndex) => {
        const globalLevelIndex = this.getGlobalLevelIndex(chIndex, levelIndex);
        const isCompleted = this.completedLevels.includes(globalLevelIndex);
        const isLocked = !this.isLevelUnlocked(chIndex, levelIndex);
        const stars = this.levelStars[globalLevelIndex] || 0;
        
        html += `
          <li class="level-item ${this.currentLevel === globalLevelIndex ? 'active' : ''} ${isLocked ? 'locked' : ''}" 
              data-chapter="${chIndex}" 
              data-level="${levelIndex}"
              onclick="${isLocked ? '' : `app.loadLevel(${chIndex}, ${levelIndex})`}">
            ${isLocked 
              ? `<span class="lock-icon">🔒</span>` 
              : `<span class="level-number">${levelIndex + 1}</span>`
            }
            <div class="level-info">
              <div class="level-name">${level.title || `关卡 ${levelIndex + 1}`}</div>
              ${isCompleted 
                ? `<div class="level-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>` 
                : ''
              }
            </div>
          </li>
        `;
      });
      
      html += `</ul></div>`;
    });
    
    container.innerHTML = html;
  }

  getGlobalLevelIndex(chIndex, levelIndex) {
    let offset = 0;
    for (let i = 0; i < chIndex; i++) {
      offset += this.chapters[i].levels?.length || this.chapters[i].tasks?.length || 0;
    }
    return offset + levelIndex;
  }

  isLevelUnlocked(chIndex, levelIndex) {
    if (chIndex === 0 && levelIndex === 0) return true;
    
    const prevLevelIndex = this.getGlobalLevelIndex(chIndex, levelIndex - 1);
    if (levelIndex > 0) {
      return this.completedLevels.includes(prevLevelIndex);
    }
    
    if (chIndex > 0) {
      const prevChapter = this.chapters[chIndex - 1];
      const prevChapterLevels = prevChapter.levels?.length || prevChapter.tasks?.length || 0;
      const lastLevelOfPrevChapter = this.getGlobalLevelIndex(chIndex - 1, prevChapterLevels - 1);
      return this.completedLevels.includes(lastLevelOfPrevChapter);
    }
    
    return false;
  }

  // ========== 关卡加载 ==========

  async loadLevel(chapterIndex, levelIndex) {
    const chapter = this.chapters[chapterIndex];
    const level = (chapter.levels || chapter.tasks || [])[levelIndex];
    
    if (!level) return;
    
    this.currentChapter = chapterIndex;
    this.currentLevel = this.getGlobalLevelIndex(chapterIndex, levelIndex);
    this.currentLevelData = level;
    this.currentTask = 1;
    
    // 更新 UI
    document.getElementById('current-level-title').textContent = level.title || `关卡 ${levelIndex + 1}`;
    
    // 高亮当前关卡
    document.querySelectorAll('.level-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.chapter == chapterIndex && item.dataset.level == levelIndex) {
        item.classList.add('active');
      }
    });
    
    // 加载 GeoGebra
    this.initializeGeoGebra(level);
    
    // 加载第一个任务
    this.loadTask(0);
  }

  loadTask(taskIndex) {
    const tasks = this.currentLevelData.tasks || [];
    if (taskIndex >= tasks.length) {
      this.completeLevel();
      return;
    }
    
    this.currentTask = taskIndex + 1;
    this.currentTaskData = tasks[taskIndex];
    this.attemptCount = 0;
    this.hintsUsed = 0;
    this.taskStartTime = Date.now();
    
    // 更新 UI
    this.renderTaskUI(taskIndex, tasks);
    this.renderHints(tasks[taskIndex]);
    
    // 重置反馈
    document.getElementById('feedback-section').innerHTML = '';
    
    // 重置按钮状态
    document.getElementById('check-btn').disabled = false;
    document.getElementById('check-btn').style.display = 'flex';
    document.getElementById('next-btn').style.display = 'none';
  }

  renderTaskUI(taskIndex, tasks) {
    const task = tasks[taskIndex];
    
    document.getElementById('task-header').style.display = 'block';
    document.getElementById('task-chapter').textContent = this.chapters[this.currentChapter].title;
    document.getElementById('task-title').textContent = task.title || `任务 ${taskIndex + 1}`;
    document.getElementById('task-instruction').style.display = 'block';
    document.getElementById('task-instruction').innerHTML = `<strong>任务目标：</strong>${task.instruction || '完成 GeoGebra 操作'}`;
    document.getElementById('hint-section').style.display = 'block';
    
    // 进度点
    const dotsHtml = tasks.map((_, i) => 
      `<span class="progress-dot ${i < taskIndex ? 'completed' : ''} ${i === taskIndex ? 'active' : ''}"></span>`
    ).join('');
    document.getElementById('progress-dots').innerHTML = dotsHtml;
    document.getElementById('task-progress-text').textContent = `${taskIndex + 1}/${tasks.length}`;
  }

  renderHints(task) {
    const hints = task.hints || [];
    const container = document.getElementById('hint-buttons');
    
    if (!hints.length) {
      document.getElementById('hint-section').style.display = 'none';
      return;
    }
    
    let html = '';
    hints.forEach((hint, index) => {
      const cost = Math.round(task.points * 0.2 * (index + 1));
      html += `
        <button class="hint-btn" id="hint-btn-${index}" onclick="app.showHint(${index}, ${cost})">
          <span>💬 提示 ${index + 1}</span>
          <span class="hint-cost">-${cost}分</span>
        </button>
      `;
    });
    
    container.innerHTML = html;
  }

  // ========== GeoGebra 初始化 ==========

  initializeGeoGebra(level) {
    const container = document.getElementById('geogebra-container');
    container.innerHTML = `
      <div class="ggb-loading">
        <div class="spinner"></div>
        <div class="loading-text">正在加载 GeoGebra 画布...</div>
      </div>
    `;

    const parameters = {
      id: "geogebra-applet",
      appName: level?.ggbApp || "graphing",
      appletOnLoad: (api) => {
        this.applet = api;
        this.ggbReady = true;
        
        if (window.safeGGB) {
          window.safeGGB.setApplet(api);
        }
        
        console.log('GeoGebra 已加载');
        
        // 加载关卡预设内容
        if (level?.ggbInitialCommands) {
          level.ggbInitialCommands.forEach(cmd => {
            try {
              api.evalCommand(cmd);
            } catch (e) {
              console.warn('执行初始命令失败:', e);
            }
          });
        }
      },
      scaleContainerRatio: true,
      allowStyleBar: false,
      showToolBar: true,
      showAlgebraInput: true,
      showResetIcon: true,
      showFullscreenButton: true,
      useBrowserForJS: true,
      showErrorDialog: false,
      errorDialogHandler: () => {},
      showLogging: false,
      onError: (e) => console.log('[GeoGebra] Error:', e)
    };

    const script = document.createElement('script');
    script.src = 'https://www.geogebra.org/apps/deployggb.js';
    script.onload = () => {
      try {
        const applet = new GGBApplet(parameters, '6.0');
        applet.inject('geogebra-container');
      } catch (error) {
        console.error('GeoGebra 注入失败:', error);
      }
    };
    script.onerror = (error) => {
      console.error('GeoGebra 脚本加载失败:', error);
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">⚠️</div>
          <div class="title">GeoGebra 加载失败</div>
          <div class="desc">请检查网络连接后刷新页面</div>
        </div>
      `;
    };
    document.head.appendChild(script);
  }

  resetGeoGebra() {
    if (!this.applet) return;
    
    try {
      this.applet.reset();
      
      // 重新执行初始命令
      const level = this.currentLevelData;
      if (level?.ggbInitialCommands) {
        level.ggbInitialCommands.forEach(cmd => {
          try {
            this.applet.evalCommand(cmd);
          } catch (e) {}
        });
      }
      
      this.showToast('画布已重置', 'info');
    } catch (e) {
      console.warn('重置 GeoGebra 失败:', e);
    }
  }

  toggleFullscreen() {
    const container = document.getElementById('geogebra-container');
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.log('全屏失败:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // ========== 提示系统 ==========

  showHint(hintIndex, cost) {
    const task = this.currentTaskData;
    const hints = task.hints || [];
    
    if (hintIndex >= hints.length) return;
    
    const btn = document.getElementById(`hint-btn-${hintIndex}`);
    if (btn.classList.contains('used')) return;
    
    // 扣除分数
    this.userScore = Math.max(0, this.userScore - cost);
    this.hintsUsed++;
    this.updateUserStats();
    this.saveProgress();
    
    // 标记为已使用
    btn.classList.add('used');
    btn.innerHTML = `<span>✓ 提示 ${hintIndex + 1} 已显示</span>`;
    btn.disabled = true;
    
    // 显示提示
    this.showFeedback(hints[hintIndex], 'hint');
  }

  // ========== 答案验证 ==========

  checkAnswer() {
    if (!this.currentTaskData || !this.ggbReady) return;
    
    this.attemptCount++;
    const validation = this.currentTaskData.validation;
    
    if (!validation) {
      this.taskSuccess();
      return;
    }
    
    const isValid = this.validateTask(validation);
    
    if (isValid) {
      this.taskSuccess();
    } else {
      this.taskFailure();
    }
  }

  validateTask(validation) {
    try {
      const safeGGB = window.safeGGB || this;
      
      switch (validation.type) {
        case 'object-exists':
          const obj = safeGGB.getObject(validation.objectName);
          return obj !== null && obj !== undefined;
        
        case 'point-coordinates':
          const x = safeGGB.getXcoord(validation.objectName);
          const y = safeGGB.getYcoord(validation.objectName);
          if (x === null || y === null) return false;
          const tol = validation.tolerance || 0.1;
          return Math.abs(x - validation.expectedX) < tol && 
                 Math.abs(y - validation.expectedY) < tol;
        
        case 'multiple-points':
          const tol2 = validation.tolerance || 0.1;
          return validation.points.every(p => {
            const px = safeGGB.getXcoord(p.name);
            const py = safeGGB.getYcoord(p.name);
            if (px === null || py === null) return false;
            return Math.abs(px - p.x) < tol2 && Math.abs(py - p.y) < tol2;
          });
        
        case 'segment-exists':
        case 'line-exists':
        case 'circle-exists':
          return safeGGB.getObject(validation.objectName) !== null;
        
        case 'circle-radius':
          const radius = safeGGB.getLength(validation.centerName);
          if (radius === null) return false;
          const tol3 = validation.tolerance || 0.1;
          return Math.abs(radius - validation.expectedRadius) < tol3;
        
        case 'function-exists':
          return safeGGB.getObject(validation.functionName) !== null;
        
        default:
          return true;
      }
    } catch (e) {
      console.warn('验证失败:', e);
      return false;
    }
  }

  // ========== 任务完成/失败 ==========

  taskSuccess() {
    const task = this.currentTaskData;
    const basePoints = task.points || 10;
    
    // 计算得分
    let finalPoints = basePoints;
    
    // 尝试惩罚
    if (this.attemptCount > 1) {
      finalPoints *= Math.max(0.5, 1 - (this.attemptCount - 1) * 0.15);
    }
    
    // 提示惩罚
    if (this.hintsUsed > 0) {
      finalPoints *= (1 - this.hintsUsed * 0.1);
    }
    
    // 时间奖励（30 秒内完成）
    const timeTaken = (Date.now() - this.taskStartTime) / 1000;
    if (timeTaken < 30) {
      finalPoints *= 1.2;
    }
    
    finalPoints = Math.round(finalPoints);
    
    // 连击
    this.comboCount++;
    this.lastCompleteTime = Date.now();
    
    // 加分
    this.addScore(finalPoints, true);
    
    // 显示反馈
    this.showFeedback(`✓ 正确！+${finalPoints}分`, 'success');
    
    // 更新按钮
    document.getElementById('check-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'flex';
    
    // 播放音效（可选）
    this.playSound('success');
  }

  taskFailure() {
    const task = this.currentTaskData;
    const feedback = document.getElementById('feedback-section');
    
    let message = '✗ 不对哦，再试试看';
    
    if (this.attemptCount >= 3) {
      message = '✗ 已经尝试 3 次了，要不要看看提示？';
    }
    
    this.showFeedback(message, 'error');
    
    // 重置连击
    this.comboCount = 0;
    
    this.playSound('error');
  }

  nextTask() {
    const tasks = this.currentLevelData.tasks || [];
    const nextTaskIndex = this.currentTask;
    
    if (nextTaskIndex >= tasks.length) {
      this.completeLevel();
    } else {
      this.loadTask(nextTaskIndex);
    }
  }

  // ========== 关卡完成 ==========

  completeLevel() {
    const level = this.currentLevelData;
    const tasks = level.tasks || [];
    
    // 计算星级
    const totalPoints = tasks.reduce((sum, t) => sum + (t.points || 10), 0);
    const percentage = this.userScore / (totalPoints * this.chapters.length * 5) * 100;
    
    let stars = 1;
    if (percentage > 30) stars = 2;
    if (percentage > 60) stars = 3;
    
    // 保存进度
    if (!this.completedLevels.includes(this.currentLevel)) {
      this.completedLevels.push(this.currentLevel);
    }
    this.levelStars[this.currentLevel] = Math.max(
      this.levelStars[this.currentLevel] || 0,
      stars
    );
    
    this.saveProgress();
    this.renderLevelList();
    this.updateUserStats();
    
    // 显示完成模态框
    this.showCompletionModal(stars, totalPoints);
  }

  showCompletionModal(stars, score) {
    const modal = document.getElementById('completion-modal');
    document.getElementById('modal-stars').textContent = '⭐'.repeat(stars);
    document.getElementById('modal-score').textContent = `本关得分：${score}`;
    document.getElementById('modal-message').textContent = this.getRandomEncouragement();
    
    modal.classList.add('show');
    this.playSound('complete');
  }

  closeModal() {
    document.getElementById('completion-modal').classList.remove('show');
  }

  getRandomEncouragement() {
    const messages = [
      '太棒了！继续加油！',
      '干得漂亮！下一关在等你！',
      '优秀的表现！保持这个节奏！',
      '越来越厉害了！',
      '完美！你就是 GeoGebra 大师！'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // ========== UI 辅助方法 ==========

  showFeedback(message, type) {
    const container = document.getElementById('feedback-section');
    container.innerHTML = `<div class="feedback ${type}">${message}</div>`;
  }

  showScoreIncrease(points) {
    const container = document.getElementById('user-score');
    const increase = document.createElement('span');
    increase.className = 'score-increase';
    increase.textContent = `+${points}`;
    increase.style.position = 'absolute';
    increase.style.left = '50%';
    increase.style.top = '-20px';
    container.style.position = 'relative';
    container.appendChild(increase);
    
    setTimeout(() => increase.remove(), 1000);
  }

  showComboEffect(count) {
    const combo = document.createElement('div');
    combo.className = 'combo-effect';
    combo.textContent = `🔥 ${count}连击！`;
    document.body.appendChild(combo);
    
    setTimeout(() => combo.remove(), 2500);
  }

  showLevelUpAnimation() {
    const anim = document.getElementById('level-up-animation');
    anim.style.display = 'block';
    
    setTimeout(() => {
      anim.style.display = 'none';
    }, 2000);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'toastSlide 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  playSound(type) {
    // 可选：添加音效
    // const audio = new Audio(`sounds/${type}.mp3`);
    // audio.play().catch(() => {});
  }

  setupEventListeners() {
    // 可以在这里添加全局事件监听
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !document.getElementById('check-btn').disabled) {
        this.checkAnswer();
      }
    });
  }
}

// 启动应用
const app = new GeoGebraGame();
