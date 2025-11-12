/**
 * 千川平台公共 JS 库
 * 提供统一的组件模板、导航管理、工具函数
 * v2.0 - 2025-11-11
 */

// ========================================
// 导航配置 - 按新 IA 架构组织
// ========================================
const NAV_CONFIG = [
  {
    id: 'dashboard',
    title: '数据中心',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
    url: './dashboard.html'
  },
  {
    id: 'ad-management',
    title: '投放管理',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    children: [
      { title: '推广计划', url: './promotions.html' },
      { title: '广告组', url: './campaigns.html' },
      { title: '创意管理', url: './creatives.html' },
      { title: '素材库', url: './media-library.html' }
    ]
  },
  {
    id: 'uni-promotion',
    title: '全域推广',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    children: [
      { title: '推广列表', url: './uni-promotions.html' },
      { title: '创建推广', url: './uni-promotion-create.html' },
      { title: '授权管理', url: './uni-promotion-auth-init.html' },
      { title: '可投抖音号', url: './uni-promotion-authors.html' }
    ]
  },
  {
    id: 'suixintui',
    title: '随心推',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
    children: [
      { title: '随心推列表', url: './suixintui.html' },
      { title: '创建订单', url: './suixintui-create.html' },
      { title: '兴趣标签', url: './suixintui-interest-tags.html' },
      { title: '视频列表', url: './suixintui-video-list.html' },
      { title: '配额信息', url: './suixintui-quota.html' }
    ]
  },
  {
    id: 'live',
    title: '直播管理',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    children: [
      { title: '直播间列表', url: './live-rooms.html' },
      { title: '今日直播', url: './live-data.html' },
      { title: '直播回放', url: './live-replay.html' },
      { title: '直播商品', url: './live-room-products.html' }
    ]
  },
  {
    id: 'product',
    title: '商品管理',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
    children: [
      { title: '商品库', url: './products.html' },
      { title: '可投商品', url: './products-available.html' },
      { title: '竞争分析', url: './product-competition.html' },
      { title: '品牌管理', url: './brand-authorized-list.html' },
      { title: '店铺列表', url: './shop-list.html' }
    ]
  },
  {
    id: 'audience',
    title: '人群管理',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
    children: [
      { title: '人群包管理', url: './audiences.html' },
      { title: '上传人群', url: './audience-upload.html' },
      { title: '推送人群', url: './audience-push.html' },
      { title: '人群分组', url: './audience-group.html' },
      { title: '定向包', url: './orientation-package.html' },
      { title: 'DMP管理', url: './dmp-audiences.html' }
    ]
  },
  {
    id: 'keyword',
    title: '关键词',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>',
    children: [
      { title: '关键词列表', url: './keywords.html' },
      { title: '添加关键词', url: './keyword-create.html' },
      { title: '关键词推荐', url: './keyword-suggest.html' },
      { title: '词包管理', url: './keyword-packages.html' },
      { title: '否定词', url: './negative-words.html' },
      { title: '兴趣行为', url: './interest-action.html' }
    ]
  },
  {
    id: 'tools',
    title: '工具中心',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    children: [
      { title: '工具中心', url: './tools-center.html' },
      { title: '行业列表', url: './industry-list.html' },
      { title: '日志查询', url: './log-query.html' },
      { title: '受众预估', url: './tools-estimate-audience.html' },
      { title: '配额信息', url: './tools-quota.html' },
      { title: '达人搜索', url: './author-search.html' },
      { title: '达人推荐', url: './author-recommend.html' }
    ]
  },
  {
    id: 'finance',
    title: '财务管理',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
    children: [
      { title: '钱包管理', url: './finance-wallet.html' },
      { title: '余额查询', url: './finance-balance.html' },
      { title: '财务流水', url: './finance-transactions.html' },
      { title: '转账管理', url: './finance-transfer.html' },
      { title: '退款管理', url: './finance-refund.html' },
      { title: '充值记录', url: './finance-recharge.html' }
    ]
  },
  {
    id: 'reports',
    title: '数据报表',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    children: [
      { title: '报表中心', url: './reports.html' },
      { title: '账户数据', url: './report-advertiser.html' },
      { title: '计划数据', url: './report-ad.html' },
      { title: '创意数据', url: './report-creative.html' },
      { title: '素材数据', url: './report-material.html' },
      { title: '全域推广', url: './report-uni-promotion.html' },
      { title: '自定义报表', url: './report-custom.html' },
      { title: '定时报表', url: './report-schedule.html' }
    ]
  },
  {
    id: 'system',
    title: '系统设置',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    children: [
      { title: '账户列表', url: './accounts.html' },
      { title: '账户设置', url: './account-settings.html' },
      { title: '抖音号管理', url: './aweme-accounts.html' },
      { title: '店铺授权', url: './account-shop-auth.html' },
      { title: 'Token管理', url: './token-refresh.html' }
    ]
  }
];

// ========================================
// Header 模板
// ========================================
function renderHeader() {
  return `
    <header class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div class="flex items-center justify-between px-6 h-16">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
            <span class="text-white font-bold text-sm">千川</span>
          </div>
          <span class="text-xl font-semibold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            巨量千川
          </span>
        </div>

        <!-- 搜索框 -->
        <div class="flex-1 max-w-xl mx-8">
          <div class="relative">
            <input 
              type="text" 
              placeholder="搜索推广计划、创意、商品..." 
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              aria-label="全局搜索"
            >
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-4">
          <!-- 主题切换 -->
          <button 
            id="theme-toggle" 
            class="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="切换主题"
            title="切换主题"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          </button>

          <!-- 通知 -->
          <button class="p-2 hover:bg-gray-100 rounded-lg relative transition" aria-label="通知中心">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- 用户菜单 -->
          <div class="relative">
            <button class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition" aria-label="用户菜单">
              <div class="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                <span class="text-white text-sm font-medium">U</span>
              </div>
              <span class="text-sm font-medium text-gray-700">用户名</span>
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}

// ========================================
// Sidebar 模板
// ========================================
function renderSidebar(activeId = '') {
  let html = `
    <aside class="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav class="p-4" role="navigation" aria-label="主导航">
  `;

  NAV_CONFIG.forEach(item => {
    const isActive = activeId === item.id;
    const hasChildren = item.children && item.children.length > 0;

    html += `
      <div class="mb-2">
        <a href="${item.url || '#'}" 
           class="flex items-center gap-3 px-4 py-3 rounded-lg transition ${
             isActive 
               ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600' 
               : 'text-gray-700 hover:bg-gray-50'
           }"
           ${!item.url ? 'role="button" aria-expanded="true"' : ''}>
          ${item.icon}
          <span class="font-medium">${item.title}</span>
          ${hasChildren ? `
            <svg class="w-4 h-4 ml-auto transform transition ${isActive ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          ` : ''}
        </a>
    `;

    if (hasChildren && isActive) {
      html += `<div class="mt-1 ml-11 space-y-1">`;
      item.children.forEach(child => {
        html += `
          <a href="${child.url}" 
             class="block px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition">
            ${child.title}
          </a>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;
  });

  html += `
      </nav>
    </aside>
  `;

  return html;
}

// ========================================
// PageHeader 模板
// ========================================
function renderPageHeader({ title, description, breadcrumbs = [], actions = [] }) {
  let html = `
    <div class="bg-white border-b border-gray-200 px-8 py-6">
      <!-- 面包屑 -->
      ${breadcrumbs.length > 0 ? `
        <nav class="flex mb-4" aria-label="面包屑导航">
          <ol class="flex items-center space-x-2 text-sm">
            ${breadcrumbs.map((crumb, idx) => `
              <li class="flex items-center">
                ${idx > 0 ? '<svg class="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' : ''}
                ${crumb.url 
                  ? `<a href="${crumb.url}" class="text-gray-500 hover:text-red-600">${crumb.label}</a>`
                  : `<span class="text-gray-900 font-medium">${crumb.label}</span>`
                }
              </li>
            `).join('')}
          </ol>
        </nav>
      ` : ''}

      <!-- 标题与操作 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">${title}</h1>
          ${description ? `<p class="mt-1 text-sm text-gray-500">${description}</p>` : ''}
        </div>

        ${actions.length > 0 ? `
          <div class="flex items-center gap-3">
            ${actions.map(action => {
              if (action.type === 'primary') {
                return `<button onclick="${action.onClick || ''}" class="qc-btn qc-btn-primary">${action.label}</button>`;
              } else if (action.type === 'secondary') {
                return `<button onclick="${action.onClick || ''}" class="qc-btn qc-btn-secondary">${action.label}</button>`;
              } else {
                return `<button onclick="${action.onClick || ''}" class="qc-btn qc-btn-ghost">${action.label}</button>`;
              }
            }).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  return html;
}

// ========================================
// 工具函数
// ========================================

// 主题切换
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);

  toggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// 渲染 KPI 指标卡
function renderKPICards(kpis) {
  const container = document.createElement('div');
  container.className = 'qc-kpi-container';

  kpis.forEach(kpi => {
    const card = document.createElement('div');
    card.className = 'qc-kpi-card';
    card.innerHTML = `
      <div class="qc-kpi-label">
        ${kpi.icon || ''}
        <span>${kpi.label}</span>
      </div>
      <div class="qc-kpi-value">
        <span>${kpi.value}</span>
        ${kpi.unit ? `<span class="qc-kpi-unit">${kpi.unit}</span>` : ''}
      </div>
      ${kpi.change ? `
        <div class="qc-kpi-change ${kpi.change > 0 ? 'qc-trend-up' : 'qc-trend-down'}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${kpi.change > 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}"/>
          </svg>
          <span>${Math.abs(kpi.change)}%</span>
        </div>
      ` : ''}
    `;
    container.appendChild(card);
  });

  return container;
}

// 显示加载状态
function showLoading(text = '加载中...') {
  const overlay = document.createElement('div');
  overlay.id = 'qc-loading';
  overlay.className = 'qc-loading-overlay';
  overlay.innerHTML = `
    <div class="flex flex-col items-center">
      <div class="qc-loading-spinner"></div>
      <div class="qc-loading-text">${text}</div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('qc-loading');
  if (overlay) overlay.remove();
}

// 显示空状态
function showEmptyState(container, { title, description, actionLabel, actionCallback }) {
  container.innerHTML = `
    <div class="qc-empty-state">
      <svg class="qc-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
      </svg>
      <div class="qc-empty-title">${title}</div>
      <div class="qc-empty-description">${description}</div>
      ${actionLabel ? `<button class="qc-btn qc-btn-primary" onclick="(${actionCallback})()">${actionLabel}</button>` : ''}
    </div>
  `;
}

// 批量操作条
function showBatchBar(count, actions) {
  let existingBar = document.getElementById('qc-batch-bar');
  if (existingBar) existingBar.remove();

  const bar = document.createElement('div');
  bar.id = 'qc-batch-bar';
  bar.className = 'qc-batch-bar';
  bar.innerHTML = `
    <div class="qc-batch-info">
      <span>已选择</span>
      <span class="qc-batch-count">${count}</span>
      <span>项</span>
    </div>
    <div class="qc-batch-actions">
      ${actions.map(action => `
        <button class="qc-btn ${action.danger ? 'qc-btn-danger' : 'qc-btn-secondary'}" onclick="${action.onClick}">
          ${action.label}
        </button>
      `).join('')}
      <button class="qc-btn qc-btn-ghost" onclick="hideBatchBar()">取消</button>
    </div>
  `;
  document.body.appendChild(bar);
}

function hideBatchBar() {
  const bar = document.getElementById('qc-batch-bar');
  if (bar) bar.remove();
}

// ========================================
// 初始化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否需要渲染通用组件
  const headerContainer = document.getElementById('qc-header');
  const sidebarContainer = document.getElementById('qc-sidebar');

  if (headerContainer) {
    headerContainer.innerHTML = renderHeader();
    initThemeToggle();
  }

  if (sidebarContainer) {
    const activeNav = sidebarContainer.getAttribute('data-active');
    sidebarContainer.innerHTML = renderSidebar(activeNav);
  }
});

// 导出全局函数
window.QC = {
  renderHeader,
  renderSidebar,
  renderPageHeader,
  renderKPICards,
  showLoading,
  hideLoading,
  showEmptyState,
  showBatchBar,
  hideBatchBar,
  NAV_CONFIG
};
