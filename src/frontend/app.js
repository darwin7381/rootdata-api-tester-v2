document.addEventListener('DOMContentLoaded', () => {
  // 元素引用
  const apiEndpointsList = document.getElementById('api-endpoints');
  const paramsContainer = document.getElementById('params-container');
  const sendRequestBtn = document.getElementById('send-request');
  const responseContainer = document.getElementById('response-container');
  const renderedResponse = document.getElementById('rendered-response');
  const viewRawBtn = document.getElementById('view-raw');
  const viewRenderedBtn = document.getElementById('view-rendered');
  const copyResponseBtn = document.getElementById('copy-response');
  const clearResponseBtn = document.getElementById('clear-response');
  const recommendedTestBtns = document.querySelectorAll('.recommended-test');
  
  // 当前选中的端点
  let currentEndpoint = null;
  let lastResponseData = null;
  
  // 获取 API 基础 URL
  // 在本地开发环境和 Vercel 环境中都能正常工作
  const getApiBaseUrl = () => {
    return window.location.origin;
  };
  
  // API 端点配置
  const endpointConfigs = {
    'search': {
      url: '/api/search',
      method: 'POST',
      params: [
        { name: 'query', type: 'text', required: true, label: '搜索关键词', placeholder: '例如: Bitcoin, Ethereum, Fetch.ai' }
      ],
      description: '根据关键词搜索项目/VC/人物简要信息'
    },
    'get-item': {
      url: '/api/get-item',
      method: 'POST',
      params: [
        { name: 'id', type: 'text', required: true, label: '项目 ID', placeholder: '例如: 150 (Fetch.ai)' }
      ],
      description: '根据项目 ID 获取项目详情'
    },
    'get-vc': {
      url: '/api/get-vc',
      method: 'POST',
      params: [
        { name: 'vc_id', type: 'text', required: true, label: 'VC ID', placeholder: '例如: 1001' }
      ],
      description: '根据 VC ID 获取 VC 详情'
    },
    'get-people': {
      url: '/api/get-people',
      method: 'POST',
      params: [
        { name: 'people_id', type: 'text', required: true, label: '人物 ID', placeholder: '例如: 2001' }
      ],
      description: '根据人物 ID 获取人物详情'
    },
    'get-investor-batch': {
      url: '/api/get-investor-batch',
      method: 'POST',
      params: [
        { name: 'ids', type: 'text', required: true, label: '投资者 ID 列表 (逗号分隔)', placeholder: '例如: 1001,1002,1003' }
      ],
      description: '批量获取投资者信息'
    },
    'get-fundraising-batch': {
      url: '/api/get-fundraising-batch',
      method: 'POST',
      params: [
        { name: 'ids', type: 'text', required: true, label: '融资轮次 ID 列表 (逗号分隔)', placeholder: '例如: 5001,5002,5003' }
      ],
      description: '批量获取融资轮次'
    },
    'sync-update': {
      url: '/api/sync-update',
      method: 'POST',
      params: [
        { name: 'begin_time', type: 'text', required: true, label: '开始时间 (时间戳)', placeholder: '例如: 1609459200 (2021-01-01)' },
        { name: 'end_time', type: 'text', required: false, label: '结束时间 (时间戳)', placeholder: '例如: 1640995200 (2022-01-01)' }
      ],
      description: '同步更新'
    },
    'top-100': {
      url: '/api/top-100',
      method: 'POST',
      params: [
        { 
          name: 'days', 
          type: 'select', 
          required: true, 
          label: '天数',
          options: [
            { value: '1', label: '1 天' },
            { value: '7', label: '7 天' }
          ]
        }
      ],
      description: '获取 Top100 热门项目列表及其基本信息'
    },
    'tag-map': {
      url: '/api/tag-map',
      method: 'POST',
      params: [],
      description: '获取标签地图列表'
    },
    'projects-by-ecosystem': {
      url: '/api/projects-by-ecosystem',
      method: 'POST',
      params: [
        { name: 'ecosystem_ids', type: 'text', required: true, label: '生态系统 ID (逗号分隔)', placeholder: '例如: 1,2,3' }
      ],
      description: '根据生态系统批量获取项目信息'
    },
    'projects-by-tags': {
      url: '/api/projects-by-tags',
      method: 'POST',
      params: [
        { name: 'tag_ids', type: 'text', required: true, label: '标签 ID (逗号分隔)', placeholder: '例如: 10,20,30' }
      ],
      description: '根据标签批量获取项目信息'
    },
    'x-hot-projects': {
      url: '/api/x-hot-projects',
      method: 'POST',
      params: [
        { name: 'page', type: 'number', required: false, label: '頁碼', placeholder: '例如: 1', default: '1' },
        { name: 'page_size', type: 'number', required: false, label: '每頁數量', placeholder: '例如: 10', default: '10' }
      ],
      description: '獲取 X 平台上的熱門項目列表'
    },
    'x-leading-figures': {
      url: '/api/x-leading-figures',
      method: 'POST',
      params: [
        { name: 'page', type: 'number', required: false, label: '頁碼', placeholder: '例如: 1', default: '1' },
        { name: 'page_size', type: 'number', required: false, label: '每頁數量', placeholder: '例如: 10', default: '10' },
        { 
          name: 'rank_type', 
          type: 'select', 
          required: false, 
          label: '排名類型',
          options: [
            { value: 'heat', label: '熱度' },
            { value: 'followers', label: '粉絲數' }
          ],
          default: 'heat'
        }
      ],
      description: '獲取 X 平台上的熱門人物列表'
    },
    'job-changes': {
      url: '/api/job-changes',
      method: 'POST',
      params: [
        { name: 'page', type: 'number', required: false, label: '頁碼', placeholder: '例如: 1', default: '1' },
        { name: 'page_size', type: 'number', required: false, label: '每頁數量', placeholder: '例如: 20', default: '20' }
      ],
      description: '獲取人物職位變動的列表'
    },
    'batch-sync-update': {
      url: '/api/batch-sync-update',
      method: 'POST',
      params: [
        { name: 'start_date', type: 'text', required: true, label: '開始日期 (YYYY-MM-DD)', placeholder: '例如: 2023-01-01' },
        { name: 'end_date', type: 'text', required: true, label: '結束日期 (YYYY-MM-DD)', placeholder: '例如: 2023-01-03' },
        { name: 'batch_days', type: 'number', required: false, label: '批次天數', placeholder: '例如: 1', default: '1' }
      ],
      description: '批量同步更新，自動分批處理時間範圍'
    }
  };
  
  // 初始化 API 端点列表点击事件
  apiEndpointsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('list-group-item')) {
      // 移除之前的活动状态
      const activeItems = apiEndpointsList.querySelectorAll('.active');
      activeItems.forEach(item => item.classList.remove('active'));
      
      // 设置当前活动状态
      e.target.classList.add('active');
      
      // 获取端点名称
      const endpoint = e.target.dataset.endpoint;
      currentEndpoint = endpoint;
      
      // 渲染参数表单
      renderParamsForm(endpoint);
    }
  });
  
  // 初始化推荐测试按钮点击事件
  recommendedTestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const endpoint = btn.dataset.endpoint;
      const params = JSON.parse(btn.dataset.params || '{}');
      
      // 选择对应的端点
      const endpointBtn = apiEndpointsList.querySelector(`[data-endpoint="${endpoint}"]`);
      if (endpointBtn) {
        // 移除之前的活动状态
        const activeItems = apiEndpointsList.querySelectorAll('.active');
        activeItems.forEach(item => item.classList.remove('active'));
        
        // 设置当前活动状态
        endpointBtn.classList.add('active');
        
        // 设置当前端点
        currentEndpoint = endpoint;
        
        // 渲染参数表单
        renderParamsForm(endpoint);
        
        // 填充参数值
        setTimeout(() => {
          Object.keys(params).forEach(key => {
            const input = document.getElementById(`param-${key}`);
            if (input) {
              input.value = params[key];
            }
          });
        }, 100);
      }
    });
  });
  
  // 渲染参数表单
  function renderParamsForm(endpoint) {
    const config = endpointConfigs[endpoint];
    
    if (!config) {
      paramsContainer.innerHTML = '<div class="alert alert-danger">未找到端点配置</div>';
      return;
    }
    
    let formHtml = `
      <div class="alert alert-info mb-3">
        <strong>端点:</strong> ${config.url}<br>
        <strong>方法:</strong> ${config.method}<br>
        <strong>描述:</strong> ${config.description}
      </div>
    `;
    
    if (config.params.length === 0) {
      formHtml += `
        <div class="alert alert-info">
          <strong>参数:</strong> 无需参数
        </div>
      `;
    } else {
      config.params.forEach(param => {
        if (param.type === 'select') {
          let optionsHtml = '';
          param.options.forEach(option => {
            optionsHtml += `<option value="${option.value}">${option.label}</option>`;
          });
          
          formHtml += `
            <div class="form-group">
              <label for="param-${param.name}">${param.label}${param.required ? ' *' : ''}</label>
              <select class="form-control" id="param-${param.name}" name="${param.name}" ${param.required ? 'required' : ''}>
                ${optionsHtml}
              </select>
              ${param.placeholder ? `<small class="form-text text-muted">${param.placeholder}</small>` : ''}
            </div>
          `;
        } else {
          formHtml += `
            <div class="form-group">
              <label for="param-${param.name}">${param.label}${param.required ? ' *' : ''}</label>
              <input type="${param.type}" class="form-control" id="param-${param.name}" name="${param.name}" ${param.required ? 'required' : ''} ${param.placeholder ? `placeholder="${param.placeholder}"` : ''}>
              ${param.placeholder ? `<small class="form-text text-muted">${param.placeholder}</small>` : ''}
            </div>
          `;
        }
      });
    }
    
    // 添加语言选择
    formHtml += `
      <div class="form-group mt-3">
        <label for="param-language">语言</label>
        <select class="form-control" id="param-language" name="language">
          <option value="en">英文 (en)</option>
          <option value="cn" selected>中文 (cn)</option>
        </select>
      </div>
    `;
    
    paramsContainer.innerHTML = formHtml;
  }
  
  // 发送 API 请求
  async function sendApiRequest(endpoint, params) {
    try {
      const config = endpointConfigs[endpoint];
      if (!config) {
        throw new Error(`未知的端点: ${endpoint}`);
      }
      
      // 使用动态基础 URL
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}${config.url}`;
      
      // 获取语言选择
      const languageSelect = document.getElementById('language-select');
      const language = languageSelect ? languageSelect.value : 'cn';
      
      // 显示加载状态
      responseContainer.textContent = '加载中...';
      renderedResponse.innerHTML = '';
      
      const response = await fetch(url, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          'Language': language
        },
        body: JSON.stringify(params)
      });
      
      const data = await response.json();
      lastResponseData = data;
      
      // 显示响应
      responseContainer.textContent = JSON.stringify(data, null, 2);
      renderJsonToHtml(data);
      
      // 启用响应操作按钮
      viewRawBtn.disabled = false;
      viewRenderedBtn.disabled = false;
      copyResponseBtn.disabled = false;
      clearResponseBtn.disabled = false;
      
      return data;
    } catch (error) {
      console.error('API 请求失败:', error);
      responseContainer.textContent = `错误: ${error.message}`;
      renderedResponse.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
      
      // 禁用渲染视图按钮
      viewRawBtn.disabled = false;
      viewRenderedBtn.disabled = true;
      
      throw error;
    }
  }
  
  // 发送请求按钮事件监听器
  sendRequestBtn.addEventListener('click', async () => {
    if (!currentEndpoint) {
      alert('请先选择一个 API 端点');
      return;
    }
    
    const config = endpointConfigs[currentEndpoint];
    
    // 验证必填参数
    const missingParams = [];
    const requestParams = {};
    
    config.params.forEach(param => {
      const inputElement = document.getElementById(`param-${param.name}`);
      if (param.required && (!inputElement || !inputElement.value)) {
        missingParams.push(param.label || param.name);
      } else if (inputElement && inputElement.value) {
        requestParams[param.name] = inputElement.value;
      }
    });
    
    if (missingParams.length > 0) {
      alert(`请填写以下必填参数: ${missingParams.join(', ')}`);
      return;
    }
    
    try {
      await sendApiRequest(currentEndpoint, requestParams);
    } catch (error) {
      console.error('请求处理失败:', error);
    }
  });
  
  // 渲染 JSON 到 HTML
  function renderJsonToHtml(data) {
    // 清空之前的内容
    renderedResponse.innerHTML = '';
    
    // 如果没有数据或数据格式不正确，显示错误信息
    if (!data) {
      renderedResponse.innerHTML = '<div class="alert alert-warning">没有数据可显示</div>';
      return;
    }
    
    // 检查是否有有效的数据
    const responseData = data.data || data;
    
    // 如果响应中包含错误信息
    if (data.result >= 400 || data.message && data.message.includes('错误')) {
      renderedResponse.innerHTML = `
        <div class="alert alert-danger">
          <h5>请求失败</h5>
          <p>${data.message || '未知错误'}</p>
          <p>错误代码: ${data.result || data.status || '未知'}</p>
        </div>
      `;
      return;
    }
    
    // 创建一个格式化的视图
    const container = document.createElement('div');
    container.className = 'json-rendered';
    
    // 如果有项目数据，显示项目信息
    if (responseData.project_name || responseData.name) {
      const projectInfo = document.createElement('div');
      projectInfo.className = 'project-info card mb-4';
      
      const projectName = responseData.project_name || responseData.name;
      const projectLogo = responseData.logo;
      const projectDesc = responseData.description || responseData.one_liner;
      
      let projectHtml = `
        <div class="card-header d-flex align-items-center">
          ${projectLogo ? `<img src="${projectLogo}" alt="${projectName}" class="project-logo me-2">` : ''}
          <h4 class="mb-0">${projectName || '未命名项目'}</h4>
        </div>
        <div class="card-body">
      `;
      
      if (projectDesc) {
        projectHtml += `<p class="project-desc">${projectDesc}</p>`;
      }
      
      // 添加基本信息
      projectHtml += '<div class="project-details">';
      
      if (responseData.token_symbol) {
        projectHtml += `<div class="detail-item"><span class="label">代币符号:</span> ${responseData.token_symbol}</div>`;
      }
      
      if (responseData.market_cap) {
        projectHtml += `<div class="detail-item"><span class="label">市值:</span> $${formatNumber(responseData.market_cap)}</div>`;
      }
      
      if (responseData.price) {
        projectHtml += `<div class="detail-item"><span class="label">价格:</span> $${formatNumber(responseData.price)}</div>`;
      }
      
      if (responseData.total_funding) {
        projectHtml += `<div class="detail-item"><span class="label">总融资:</span> $${formatNumber(responseData.total_funding)}</div>`;
      }
      
      projectHtml += '</div>';
      
      // 关闭卡片
      projectHtml += '</div>';
      
      projectInfo.innerHTML = projectHtml;
      container.appendChild(projectInfo);
    }
    
    // 如果有标签数据，显示标签
    if (responseData.tags && responseData.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'tags-container mb-4';
      tagsContainer.innerHTML = '<h5>标签</h5><div class="tags">';
      
      responseData.tags.forEach(tag => {
        const tagName = typeof tag === 'string' ? tag : (tag.name || tag.tag_name);
        if (tagName) {
          tagsContainer.innerHTML += `<span class="badge bg-secondary me-1 mb-1">${tagName}</span>`;
        }
      });
      
      tagsContainer.innerHTML += '</div>';
      container.appendChild(tagsContainer);
    }
    
    // 如果有社交媒体数据，显示社交媒体链接
    if (responseData.social_media) {
      const socialContainer = document.createElement('div');
      socialContainer.className = 'social-container mb-4';
      socialContainer.innerHTML = '<h5>社交媒体</h5><div class="social-links">';
      
      const socialMedia = responseData.social_media;
      
      if (socialMedia.website) {
        socialContainer.innerHTML += `<a href="${socialMedia.website}" target="_blank" class="btn btn-sm btn-outline-primary me-1 mb-1">网站</a>`;
      }
      
      if (socialMedia.twitter) {
        socialContainer.innerHTML += `<a href="${socialMedia.twitter}" target="_blank" class="btn btn-sm btn-outline-info me-1 mb-1">Twitter</a>`;
      }
      
      if (socialMedia.telegram) {
        socialContainer.innerHTML += `<a href="${socialMedia.telegram}" target="_blank" class="btn btn-sm btn-outline-info me-1 mb-1">Telegram</a>`;
      }
      
      if (socialMedia.github) {
        socialContainer.innerHTML += `<a href="${socialMedia.github}" target="_blank" class="btn btn-sm btn-outline-dark me-1 mb-1">GitHub</a>`;
      }
      
      socialContainer.innerHTML += '</div>';
      container.appendChild(socialContainer);
    }
    
    // 如果是搜索结果，显示列表
    if (Array.isArray(responseData) || (responseData.items && Array.isArray(responseData.items))) {
      const items = responseData.items || responseData;
      
      if (items.length > 0) {
        const listContainer = document.createElement('div');
        listContainer.className = 'list-container';
        listContainer.innerHTML = `<h5>结果列表 (${items.length})</h5>`;
        
        const list = document.createElement('div');
        list.className = 'list-group';
        
        items.forEach(item => {
          const name = item.name || item.project_name || item.title || '未命名项目';
          const desc = item.description || item.one_liner || '';
          const id = item.id || item.project_id || '';
          
          list.innerHTML += `
            <div class="list-group-item">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-1">${name}</h6>
                ${id ? `<span class="badge bg-secondary">ID: ${id}</span>` : ''}
              </div>
              ${desc ? `<p class="mb-1 small text-muted">${desc}</p>` : ''}
            </div>
          `;
        });
        
        listContainer.appendChild(list);
        container.appendChild(listContainer);
      } else {
        container.innerHTML += '<div class="alert alert-info">没有找到结果</div>';
      }
    }
    
    // 如果没有特定的数据结构，显示原始 JSON
    if (container.children.length === 0) {
      container.innerHTML = '<div class="alert alert-info">无法渲染此响应的结构化视图，请查看原始 JSON</div>';
    }
    
    renderedResponse.appendChild(container);
  }
  
  // 格式化数字
  function formatNumber(num) {
    if (!num) return '0';
    
    // 如果是科学计数法，转换为普通数字
    if (String(num).includes('E')) {
      num = parseFloat(num);
    }
    
    // 如果是字符串，尝试转换为数字
    if (typeof num === 'string') {
      num = parseFloat(num.replace(/,/g, ''));
    }
    
    // 如果是 NaN，返回 0
    if (isNaN(num)) return '0';
    
    // 如果数字很大，使用 K, M, B 等单位
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    } else if (num < 0.01) {
      return num.toExponential(2);
    } else {
      return num.toFixed(2);
    }
  }
  
  // 切换视图 - 原始 JSON
  viewRawBtn.addEventListener('click', () => {
    viewRawBtn.classList.add('active');
    viewRenderedBtn.classList.remove('active');
    responseContainer.style.display = 'block';
    renderedResponse.style.display = 'none';
  });
  
  // 切换视图 - 渲染 HTML
  viewRenderedBtn.addEventListener('click', () => {
    viewRawBtn.classList.remove('active');
    viewRenderedBtn.classList.add('active');
    responseContainer.style.display = 'none';
    renderedResponse.style.display = 'block';
    
    // 如果有数据但还没渲染，则渲染
    if (lastResponseData && renderedResponse.innerHTML === '') {
      renderJsonToHtml(lastResponseData);
    }
  });
  
  // 复制响应
  copyResponseBtn.addEventListener('click', () => {
    const text = responseContainer.textContent;
    
    if (!text || text === '// 响应结果将显示在这里') {
      alert('没有可复制的内容');
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        const notification = document.createElement('div');
        notification.className = 'copy-success';
        notification.textContent = '已复制到剪贴板';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      })
      .catch(err => {
        alert('复制失败: ' + err.message);
      });
  });
  
  // 清除响应
  clearResponseBtn.addEventListener('click', () => {
    responseContainer.textContent = '// 响应结果将显示在这里';
    renderedResponse.innerHTML = '';
    lastResponseData = null;
  });
}); 