/**
 * 千川平台表单验证工具库
 * 提供统一的表单验证、错误提示、无障碍支持
 * v2.0 - 2025-11-11
 */

// ========================================
// 验证规则
// ========================================

const RULES = {
  // 必填
  required: {
    validate: (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return value != null && value !== '';
    },
    message: '此字段为必填项'
  },

  // 邮箱
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: '请输入有效的邮箱地址'
  },

  // 手机号
  phone: {
    validate: (value) => /^1[3-9]\d{9}$/.test(value),
    message: '请输入有效的手机号'
  },

  // URL
  url: {
    validate: (value) => /^https?:\/\/.+/.test(value),
    message: '请输入有效的URL地址'
  },

  // 数字
  number: {
    validate: (value) => !isNaN(parseFloat(value)) && isFinite(value),
    message: '请输入有效的数字'
  },

  // 整数
  integer: {
    validate: (value) => /^-?\d+$/.test(value),
    message: '请输入整数'
  },

  // 正整数
  positiveInteger: {
    validate: (value) => /^\d+$/.test(value) && parseInt(value) > 0,
    message: '请输入正整数'
  },

  // 最小值
  min: (minValue) => ({
    validate: (value) => parseFloat(value) >= minValue,
    message: `最小值为 ${minValue}`
  }),

  // 最大值
  max: (maxValue) => ({
    validate: (value) => parseFloat(value) <= maxValue,
    message: `最大值为 ${maxValue}`
  }),

  // 最小长度
  minLength: (length) => ({
    validate: (value) => value.length >= length,
    message: `最少需要 ${length} 个字符`
  }),

  // 最大长度
  maxLength: (length) => ({
    validate: (value) => value.length <= length,
    message: `最多允许 ${length} 个字符`
  }),

  // 范围
  range: (min, max) => ({
    validate: (value) => {
      const num = parseFloat(value);
      return num >= min && num <= max;
    },
    message: `请输入 ${min} 到 ${max} 之间的值`
  }),

  // 自定义正则
  pattern: (regex, message) => ({
    validate: (value) => regex.test(value),
    message: message || '格式不正确'
  }),

  // 自定义函数
  custom: (fn, message) => ({
    validate: fn,
    message: message || '验证失败'
  })
};

// ========================================
// 表单验证类
// ========================================

class FormValidator {
  constructor(formElement, options = {}) {
    this.form = formElement;
    this.fields = new Map();
    this.errors = new Map();
    this.options = {
      validateOnBlur: true,
      validateOnInput: false,
      scrollToError: true,
      focusOnError: true,
      ...options
    };

    this.init();
  }

  /**
   * 初始化
   */
  init() {
    // 阻止默认提交
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validate();
    });

    // 为每个字段添加监听
    const fields = this.form.querySelectorAll('[data-validate]');
    fields.forEach(field => {
      const rules = this.parseRules(field.dataset.validate);
      this.addField(field, rules, field.dataset.label || field.name);
    });
  }

  /**
   * 添加字段
   */
  addField(element, rules, label) {
    this.fields.set(element, { rules, label });

    // 绑定事件
    if (this.options.validateOnBlur) {
      element.addEventListener('blur', () => this.validateField(element));
    }
    if (this.options.validateOnInput) {
      element.addEventListener('input', () => this.validateField(element));
    }

    // 添加 ARIA 属性
    element.setAttribute('aria-required', rules.includes('required') ? 'true' : 'false');
    element.setAttribute('aria-invalid', 'false');
  }

  /**
   * 解析验证规则字符串
   */
  parseRules(rulesStr) {
    if (!rulesStr) return [];
    return rulesStr.split('|').map(r => r.trim());
  }

  /**
   * 验证单个字段
   */
  validateField(element) {
    const config = this.fields.get(element);
    if (!config) return true;

    const value = element.value;
    const { rules, label } = config;

    // 清除之前的错误
    this.clearFieldError(element);

    // 逐个验证规则
    for (const ruleName of rules) {
      let rule;
      let ruleParams = [];

      // 解析带参数的规则，如 min:5 或 range:1,100
      if (ruleName.includes(':')) {
        const [name, paramsStr] = ruleName.split(':');
        ruleParams = paramsStr.split(',').map(p => p.trim());
        rule = typeof RULES[name] === 'function' 
          ? RULES[name](...ruleParams) 
          : RULES[name];
      } else {
        rule = RULES[ruleName];
      }

      if (!rule) {
        console.warn(`未知的验证规则: ${ruleName}`);
        continue;
      }

      // 执行验证
      if (!rule.validate(value)) {
        this.setFieldError(element, rule.message, label);
        return false;
      }
    }

    // 标记为验证成功
    this.markFieldSuccess(element);
    return true;
  }

  /**
   * 验证所有字段
   */
  validate() {
    let isValid = true;
    let firstErrorElement = null;

    this.fields.forEach((config, element) => {
      const valid = this.validateField(element);
      if (!valid && !firstErrorElement) {
        firstErrorElement = element;
      }
      isValid = isValid && valid;
    });

    // 处理第一个错误
    if (!isValid && firstErrorElement) {
      if (this.options.scrollToError) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (this.options.focusOnError) {
        setTimeout(() => firstErrorElement.focus(), 300);
      }
    }

    // 触发表单验证事件
    const event = new CustomEvent('formValidated', {
      detail: { isValid, errors: Array.from(this.errors.entries()) }
    });
    this.form.dispatchEvent(event);

    return isValid;
  }

  /**
   * 设置字段错误
   */
  setFieldError(element, message, label) {
    this.errors.set(element, message);

    // 更新 ARIA 属性
    element.setAttribute('aria-invalid', 'true');
    element.classList.add('qc-input-error');

    // 查找或创建错误提示元素
    let errorElement = element.parentElement.querySelector('.qc-error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'qc-error-message';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      element.parentElement.appendChild(errorElement);
    }

    errorElement.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>${message}</span>
    `;

    // 关联错误提示
    const errorId = `error-${element.name || Math.random().toString(36).substr(2, 9)}`;
    errorElement.id = errorId;
    element.setAttribute('aria-describedby', errorId);
  }

  /**
   * 清除字段错误
   */
  clearFieldError(element) {
    this.errors.delete(element);

    element.setAttribute('aria-invalid', 'false');
    element.classList.remove('qc-input-error', 'qc-input-success');

    const errorElement = element.parentElement.querySelector('.qc-error-message');
    if (errorElement) {
      errorElement.remove();
    }

    element.removeAttribute('aria-describedby');
  }

  /**
   * 标记字段成功
   */
  markFieldSuccess(element) {
    element.classList.add('qc-input-success');

    // 可选：显示成功提示
    let successElement = element.parentElement.querySelector('.qc-success-message');
    if (!successElement) {
      successElement = document.createElement('div');
      successElement.className = 'qc-success-message';
      element.parentElement.appendChild(successElement);
    }
    successElement.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <span>格式正确</span>
    `;

    // 2秒后移除成功提示
    setTimeout(() => {
      if (successElement && successElement.parentElement) {
        successElement.remove();
      }
    }, 2000);
  }

  /**
   * 重置表单
   */
  reset() {
    this.form.reset();
    this.errors.clear();
    this.fields.forEach((config, element) => {
      this.clearFieldError(element);
    });
  }

  /**
   * 获取表单数据
   */
  getData() {
    const data = {};
    this.fields.forEach((config, element) => {
      data[element.name] = element.value;
    });
    return data;
  }
}

// ========================================
// 便捷方法
// ========================================

/**
 * 快速验证单个值
 */
function validate(value, rules) {
  const ruleArray = typeof rules === 'string' ? rules.split('|') : rules;

  for (const ruleName of ruleArray) {
    let rule;
    let ruleParams = [];

    if (ruleName.includes(':')) {
      const [name, paramsStr] = ruleName.split(':');
      ruleParams = paramsStr.split(',').map(p => p.trim());
      rule = typeof RULES[name] === 'function' 
        ? RULES[name](...ruleParams) 
        : RULES[name];
    } else {
      rule = RULES[ruleName];
    }

    if (rule && !rule.validate(value)) {
      return { valid: false, message: rule.message };
    }
  }

  return { valid: true };
}

/**
 * 初始化页面上所有表单
 */
function initForms() {
  document.querySelectorAll('form[data-validate-form]').forEach(form => {
    new FormValidator(form);
  });
}

// ========================================
// 无障碍增强
// ========================================

/**
 * 增强键盘导航
 */
function enhanceKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Esc 键关闭模态框
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.qc-drawer.active');
      if (activeModal) {
        activeModal.classList.remove('active');
      }
    }

    // Tab 键循环焦点（在模态框内）
    if (e.key === 'Tab') {
      const activeModal = document.querySelector('.qc-drawer.active');
      if (activeModal) {
        const focusableElements = activeModal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}

/**
 * 添加跳过导航链接
 */
function addSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'qc-skip-link';
  skipLink.textContent = '跳过导航';
  document.body.insertBefore(skipLink, document.body.firstChild);

  // 确保主内容区有 ID
  const mainContent = document.querySelector('main');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }
}

// ========================================
// 初始化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initForms();
  enhanceKeyboardNavigation();
  addSkipLink();
});

// ========================================
// 导出
// ========================================

window.QC_Validate = {
  FormValidator,
  validate,
  initForms,
  RULES,
  enhanceKeyboardNavigation,
  addSkipLink
};
