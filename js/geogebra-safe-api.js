/**
 * GeoGebra 安全 API 包装器
 * 作用：拦截所有 GeoGebra API 调用，防止错误弹窗
 */

// 创建全局安全调用函数
window.safeGGB = {
  applet: null,
  
  // 设置 applet 实例
  setApplet: function(api) {
    this.applet = api;
  },
  
  // 安全的调用方法
  call: function(method, ...args) {
    if (!this.applet) {
      console.warn(`GeoGebra not ready: ${method}`);
      return null;
    }
    
    try {
      const result = this.applet[method](...args);
      return result;
    } catch (error) {
      console.warn(`GeoGebra ${method} error suppressed:`, error.message);
      return null;
    }
  },
  
  // 常用的安全方法
  getObject: function(name) {
    return this.call('getObject', name);
  },
  
  getXcoord: function(name) {
    return this.call('getXcoord', name);
  },
  
  getYcoord: function(name) {
    return this.call('getYcoord', name);
  },
  
  getLength: function(name) {
    return this.call('getLength', name);
  },
  
  getValue: function(name) {
    return this.call('getValue', name);
  },
  
  getCommandString: function(name) {
    return this.call('getCommandString', name);
  },
  
  getAllObjects: function() {
    return this.call('getAllObjects') || [];
  },
  
  getObjectType: function(name) {
    return this.call('getObjectType', name);
  },
  
  getName: function(name) {
    return this.call('getName', name);
  },
  
  evalCommand: function(cmd) {
    return this.call('evalCommand', cmd);
  },
  
  setCoord: function(name, x, y) {
    return this.call('setCoord', name, x, y);
  },
  
  deleteObject: function(name) {
    return this.call('deleteObject', name);
  },
  
  renameObject: function(oldName, newName) {
    return this.call('renameObject', oldName, newName);
  },
  
  setColor: function(name, r, g, b) {
    return this.call('setColor', name, r, g, b);
  },
  
  setLayer: function(name, layer) {
    return this.call('setLayer', name, layer);
  },
  
  setVisible: function(name, visible) {
    return this.call('setVisible', name, visible);
  },
  
  setLabelVisible: function(name, visible) {
    return this.call('setLabelVisible', name, visible);
  },
  
  setLabelStyle: function(name, style) {
    return this.call('setLabelStyle', name, style);
  },
  
  setPointStyle: function(name, style) {
    return this.call('setPointStyle', name, style);
  },
  
  setLineStyle: function(name, style) {
    return this.call('setLineStyle', name, style);
  },
  
  setLineThickness: function(name, thickness) {
    return this.call('setLineThickness', name, thickness);
  },
  
  setPointSize: function(name, size) {
    return this.call('setPointSize', name, size);
  },
  
  setFilling: function(name, alpha) {
    return this.call('setFilling', name, alpha);
  },
  
  getLayer: function(name) {
    return this.call('getLayer', name);
  },
  
  getWidth: function() {
    return this.call('getWidth');
  },
  
  getHeight: function() {
    return this.call('getHeight');
  },
  
  reset: function() {
    return this.call('reset');
  },
  
  clearConstruction: function() {
    return this.call('clearConstruction');
  },
  
  exportImage: function(options) {
    return this.call('exportImage', options);
  },
  
  getSVG: function() {
    return this.call('getSVG');
  },
  
  getBase64: function() {
    return this.call('getBase64');
  },
  
  isAnimationRunning: function() {
    return this.call('isAnimationRunning') || false;
  },
  
  startAnimation: function() {
    return this.call('startAnimation');
  },
  
  stopAnimation: function() {
    return this.call('stopAnimation');
  }
};

// 覆盖原始 alert，防止 GeoGebra 弹窗
(function() {
  const originalAlert = window.alert;
  window.alert = function(message) {
    if (message && (message.includes('Error') || message.includes('错误'))) {
      console.log('[GeoGebra Safe] Alert suppressed:', message);
      return;
    }
    originalAlert.call(this, message);
  };
})();

// 全局错误拦截
window.onerror = function(message, source, lineno, colno, error) {
  if (source && (source.includes('geogebra') || source.includes('GeoGebra'))) {
    console.log('[GeoGebra Safe] Global error suppressed:', message, `at ${lineno}:${colno}`);
    return true;
  }
  return false;
};

// 拦截未捕获的 Promise rejection
window.onunhandledrejection = function(event) {
  if (event.reason && (event.reason.message || '').includes('GeoGebra')) {
    console.log('[GeoGebra Safe] Promise rejection suppressed:', event.reason);
    event.preventDefault();
  }
};

console.log('[GeoGebra Safe] Safe API wrapper loaded');
