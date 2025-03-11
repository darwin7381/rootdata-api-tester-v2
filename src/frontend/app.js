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
  
  // 发送请求
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
    
    // 获取语言设置
    const languageSelect = document.getElementById('param-language');
    const language = languageSelect ? languageSelect.value : 'cn';
    
    console.log('发送请求:', {
      endpoint: currentEndpoint,
      url: `/api/${currentEndpoint}`,
      params: requestParams,
      language: language
    });
    
    // 显示加载状态
    responseContainer.textContent = '加载中...';
    renderedResponse.innerHTML = '';
    
    try {
      const response = await fetch(`/api/${currentEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'language': language
        },
        body: JSON.stringify(requestParams)
      });
      
      console.log('响应状态:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('响应数据:', data);
      
      // 显示响应
      lastResponseData = data;
      responseContainer.textContent = JSON.stringify(data, null, 2);
      
      // 如果有结果数据，渲染为 HTML
      if (data.result === 200 && data.data) {
        renderJsonToHtml(data.data);
        viewRenderedBtn.disabled = false;
      } else {
        renderedResponse.innerHTML = `<div class="alert alert-warning">
          ${data.message || '请求未返回有效数据'}
        </div>`;
        viewRenderedBtn.disabled = true;
      }
      
    } catch (error) {
      console.error('请求错误:', error);
      responseContainer.textContent = `请求错误: ${error.message}`;
      renderedResponse.innerHTML = `<div class="alert alert-danger">
        ${error.message}
      </div>`;
      viewRenderedBtn.disabled = true;
    }
  });
  
  // 渲染 JSON 到 HTML
  function renderJsonToHtml(data) {
    if (!data) {
      renderedResponse.innerHTML = '<div class="alert alert-warning">无数据可显示</div>';
      return;
    }
    
    let html = '';
    
    if (data.result) {
      const resultClass = data.result === 200 ? 'success' : 'danger';
      html += `<div class="alert alert-${resultClass} mb-3">
        <strong>状态码:</strong> ${data.result}
        ${data.message ? `<br><strong>消息:</strong> ${data.message}` : ''}
      </div>`;
    }
    
    if (data.data) {
      if (Array.isArray(data.data)) {
        if (data.data.length === 0) {
          html += '<div class="alert alert-info">返回数据为空数组</div>';
        } else {
          html += '<h5>数据列表</h5>';
          html += '<div class="table-responsive"><table class="table table-dark table-striped">';
          
          // 表头
          html += '<thead><tr>';
          Object.keys(data.data[0]).forEach(key => {
            html += `<th>${key}</th>`;
          });
          html += '</tr></thead>';
          
          // 表内容
          html += '<tbody>';
          data.data.forEach(item => {
            html += '<tr>';
            Object.values(item).forEach(value => {
              if (typeof value === 'object' && value !== null) {
                html += `<td><pre>${JSON.stringify(value, null, 2)}</pre></td>`;
              } else if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
                if (value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                  html += `<td><img src="${value}" alt="图片" style="max-width: 100px; max-height: 100px;"></td>`;
                } else {
                  html += `<td><a href="${value}" target="_blank">${value}</a></td>`;
                }
              } else {
                html += `<td>${value}</td>`;
              }
            });
            html += '</tr>';
          });
          
          html += '</tbody></table></div>';
        }
      } else if (typeof data.data === 'object' && data.data !== null) {
        html += '<h5>数据详情</h5>';
        html += '<div class="table-responsive"><table class="table table-dark">';
        
        Object.entries(data.data).forEach(([key, value]) => {
          html += '<tr>';
          html += `<th style="width: 30%;">${key}</th>`;
          
          if (typeof value === 'object' && value !== null) {
            html += `<td><pre>${JSON.stringify(value, null, 2)}</pre></td>`;
          } else if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
            if (value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              html += `<td><img src="${value}" alt="图片" style="max-width: 200px; max-height: 200px;"></td>`;
            } else {
              html += `<td><a href="${value}" target="_blank">${value}</a></td>`;
            }
          } else {
            html += `<td>${value}</td>`;
          }
          
          html += '</tr>';
        });
        
        html += '</table></div>';
      } else {
        html += `<div class="alert alert-info">数据: ${JSON.stringify(data.data)}</div>`;
      }
    }
    
    renderedResponse.innerHTML = html;
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