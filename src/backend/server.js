const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const API_KEY = process.env.ROOTDATA_API_KEY;

// 简化服务器启动逻辑，更适合 Vercel 环境
app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
  console.log(`API 密钥: ${API_KEY ? '已配置' : '未配置'}`);
}).on('error', (err) => {
  console.error('服务器启动失败:', err);
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../src/frontend')));

// 基本路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../src/frontend/index.html'));
});

// RootData API 代理
const rootdataBaseUrl = 'https://api.rootdata.com';

// 代理所有 RootData API 请求
app.post('/api/rootdata/*', async (req, res) => {
  try {
    const endpoint = req.path.replace('/api/rootdata', '');
    const { headers, body } = req;
    
    // 确保 API 密钥存在
    if (!headers.apikey) {
      headers.apikey = API_KEY;
    }
    
    console.log(`请求 RootData API: ${endpoint}`);
    console.log('请求头:', headers);
    console.log('请求体:', body);
    
    const response = await axios({
      method: 'POST',
      url: `${rootdataBaseUrl}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'apikey': headers.apikey || API_KEY,
        'language': headers.language || 'cn'
      },
      data: body
    });
    
    console.log(`响应状态: ${response.status}`);
    console.log('响应数据:', response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('API 请求失败:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
      data: error.response?.data || {}
    });
  }
});

// 测试 API 端点
app.get('/api/test', (req, res) => {
  res.json({
    result: 200,
    message: 'API 测试成功',
    data: {
      timestamp: new Date().toISOString(),
      apiKey: API_KEY ? '已配置' : '未配置'
    }
  });
});

// 搜索项目/VC/人物
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    const language = req.headers.language || 'cn';
    
    const response = await axios.post(`${rootdataBaseUrl}/open/ser_inv`, 
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('搜索失败:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '搜索失败',
      data: error.response?.data || {}
    });
  }
});

// 获取项目详情
app.post('/api/get-item', async (req, res) => {
  try {
    const { id } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('获取项目详情请求:', {
      id,
      language,
      body: req.body,
      headers: req.headers
    });
    
    const response = await axios.post(`${rootdataBaseUrl}/open/get_item`, 
      { project_id: id },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    console.log('RootData API响应:', {
      status: response.status,
      data: response.data
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('获取项目详情失败:', error.response?.data || error.message);
    console.error('错误详情:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '获取项目详情失败',
      data: error.response?.data || {}
    });
  }
});

// 获取 VC 详情
app.post('/api/get-vc', async (req, res) => {
  try {
    const { vc_id } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('獲取 VC 詳情請求:', {
      vc_id,
      language,
      body: req.body
    });
    
    // 嘗試使用 get_item 端點獲取 VC 詳情
    const response = await axios.post(`${rootdataBaseUrl}/open/get_item`, 
      { project_id: vc_id, type: 2 },  // 使用 project_id 參數，並指定 type 為 2 (VC/投資者)
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('獲取 VC 詳情失敗:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '獲取 VC 詳情失敗',
      data: error.response?.data || {}
    });
  }
});

// 获取人物详情
app.post('/api/get-people', async (req, res) => {
  try {
    const { people_id } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('獲取人物詳情請求:', {
      people_id,
      language,
      body: req.body
    });
    
    // 直接調用原始 API
    const response = await axios.post(`${rootdataBaseUrl}/open/get_people`, 
      { people_id },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('獲取人物詳情失敗:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '獲取人物詳情失敗',
      data: error.response?.data || {}
    });
  }
});

// 批量获取投资者信息
app.post('/api/get-investor-batch', async (req, res) => {
  try {
    const { ids } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('批量獲取投資者信息請求:', {
      ids,
      language,
      body: req.body
    });
    
    // 使用多個單獨的請求獲取每個投資者的信息
    const idArray = ids.split(',').map(id => id.trim());
    const results = [];
    
    for (const id of idArray) {
      try {
        const response = await axios.post(`${rootdataBaseUrl}/open/get_item`, 
          { project_id: id, type: 2 },  // 使用 project_id 參數，並指定 type 為 2 (VC/投資者)
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': API_KEY,
              'language': language
            }
          }
        );
        
        if (response.data && response.data.result === 200) {
          results.push(response.data.data);
        }
      } catch (err) {
        console.error(`獲取投資者 ${id} 信息失敗:`, err.message);
      }
    }
    
    res.json({
      data: results,
      result: results.length > 0 ? 200 : 404,
      message: results.length > 0 ? 'success' : '未找到匹配的信息'
    });
  } catch (error) {
    console.error('批量獲取投資者信息失敗:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '批量獲取投資者信息失敗',
      data: error.response?.data || {}
    });
  }
});

// 批量获取融资轮次
app.post('/api/get-fundraising-batch', async (req, res) => {
  try {
    const { ids } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('批量獲取融資輪次請求:', {
      ids,
      language,
      body: req.body
    });
    
    // 使用項目詳情 API 獲取項目信息
    const idArray = ids.split(',').map(id => id.trim());
    const results = [];
    
    for (const id of idArray) {
      try {
        const response = await axios.post(`${rootdataBaseUrl}/open/get_item`, 
          { project_id: id },  // 使用 project_id 參數獲取項目詳情
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': API_KEY,
              'language': language
            }
          }
        );
        
        if (response.data && response.data.result === 200 && response.data.data) {
          // 返回完整的項目詳情
          results.push({
            id: id,
            project_data: response.data.data
          });
        }
      } catch (err) {
        console.error(`獲取項目 ${id} 信息失敗:`, err.message);
      }
    }
    
    res.json({
      data: results,
      result: results.length > 0 ? 200 : 404,
      message: results.length > 0 ? 'success' : '未找到匹配的信息'
    });
  } catch (error) {
    console.error('批量獲取融資輪次失敗:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '批量獲取融資輪次失敗',
      data: error.response?.data || {}
    });
  }
});

// 同步更新
app.post('/api/sync-update', async (req, res) => {
  try {
    const { begin_time, end_time } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('同步更新請求:', {
      begin_time,
      end_time,
      language,
      body: req.body
    });
    
    const requestData = { begin_time };
    if (end_time) {
      requestData.end_time = end_time;
    }
    
    // 確保時間格式正確
    if (typeof begin_time === 'string' && !begin_time.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log('時間格式可能不正確，嘗試轉換...');
      // 如果是時間戳，嘗試轉換為 YYYY-MM-DD 格式
      if (!isNaN(begin_time)) {
        const date = new Date(parseInt(begin_time) * 1000);
        requestData.begin_time = date.toISOString().split('T')[0];
      }
    }
    
    console.log('發送到 RootData 的請求數據:', requestData);
    
    const response = await axios.post(`${rootdataBaseUrl}/open/ser_change`, 
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    console.log('RootData API 響應:', {
      status: response.status,
      data: response.data
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('同步更新失敗:', error.response?.data || error.message);
    console.error('錯誤詳情:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers
    });
    
    // 返回更詳細的錯誤信息
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '同步更新失敗',
      error_details: {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      },
      data: error.response?.data || {}
    });
  }
});

// 批量同步更新（分批次獲取數據）
app.post('/api/batch-sync-update', async (req, res) => {
  try {
    const { start_date, end_date, batch_days = 1 } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('批量同步更新請求:', {
      start_date,
      end_date,
      batch_days,
      language,
      body: req.body
    });
    
    // 驗證日期格式
    if (!start_date || !end_date || !start_date.match(/^\d{4}-\d{2}-\d{2}$/) || !end_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({
        result: 400,
        message: '日期格式無效，請使用 YYYY-MM-DD 格式',
        data: {}
      });
    }
    
    // 解析日期
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        result: 400,
        message: '無效的日期',
        data: {}
      });
    }
    
    if (startDate > endDate) {
      return res.status(400).json({
        result: 400,
        message: '開始日期不能晚於結束日期',
        data: {}
      });
    }
    
    // 計算批次
    const batchSize = batch_days * 24 * 60 * 60 * 1000; // 轉換為毫秒
    const batches = [];
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      const batchEndDate = new Date(currentDate.getTime() + batchSize);
      const actualEndDate = batchEndDate > endDate ? endDate : batchEndDate;
      
      batches.push({
        begin_time: currentDate.toISOString().split('T')[0],
        end_time: actualEndDate.toISOString().split('T')[0]
      });
      
      currentDate = new Date(actualEndDate.getTime() + 24 * 60 * 60 * 1000); // 增加一天
    }
    
    console.log(`將請求分為 ${batches.length} 個批次進行處理`);
    
    // 處理每個批次
    const results = [];
    const errors = [];
    
    for (const [index, batch] of batches.entries()) {
      try {
        console.log(`處理批次 ${index + 1}/${batches.length}:`, batch);
        
        const response = await axios.post(`${rootdataBaseUrl}/open/ser_change`, 
          batch,
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': API_KEY,
              'language': language
            }
          }
        );
        
        if (response.data && response.data.result === 200) {
          results.push({
            batch,
            data: response.data.data,
            status: 'success'
          });
        } else {
          errors.push({
            batch,
            error: response.data,
            status: 'api_error'
          });
        }
        
        // 添加延遲，避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`批次 ${index + 1} 處理失敗:`, error.message);
        errors.push({
          batch,
          error: error.response?.data || error.message,
          status: 'request_error'
        });
      }
    }
    
    // 合併所有批次的結果
    const allData = results.flatMap(result => result.data || []);
    
    res.json({
      result: 200,
      message: '批量同步更新完成',
      data: allData,
      summary: {
        total_batches: batches.length,
        successful_batches: results.length,
        failed_batches: errors.length,
        total_items: allData.length
      },
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('批量同步更新失敗:', error.message);
    res.status(500).json({
      result: 500,
      message: '批量同步更新失敗',
      error: error.message,
      data: {}
    });
  }
});

// Top 100 热门项目
app.post('/api/top-100', async (req, res) => {
  try {
    const { days } = req.body;
    const language = req.headers.language || 'cn';
    
    const response = await axios.post(`${rootdataBaseUrl}/open/hot_index`, 
      { days },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('获取 Top 100 热门项目失败:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '获取 Top 100 热门项目失败',
      data: error.response?.data || {}
    });
  }
});

// 标签地图
app.post('/api/tag-map', async (req, res) => {
  try {
    const language = req.headers.language || 'cn';
    
    const response = await axios.post(`${rootdataBaseUrl}/open/tag_map`, 
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('获取标签地图失败:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '获取标签地图失败',
      data: error.response?.data || {}
    });
  }
});

// 基于生态系统获取项目
app.post('/api/projects-by-ecosystem', async (req, res) => {
  try {
    const { ecosystem_ids } = req.body;
    const language = req.headers.language || 'cn';
    
    const response = await axios.post(`${rootdataBaseUrl}/open/projects_by_ecosystems`, 
      { ecosystem_ids },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('基于生态系统获取项目失败:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '基于生态系统获取项目失败',
      data: error.response?.data || {}
    });
  }
});

// 基于标签获取项目
app.post('/api/projects-by-tags', async (req, res) => {
  try {
    const { tag_ids } = req.body;
    const language = req.headers.language || 'cn';
    
    const response = await axios.post(`${rootdataBaseUrl}/open/projects_by_tags`, 
      { tag_ids },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('基于标签获取项目失败:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '基于标签获取项目失败',
      data: error.response?.data || {}
    });
  }
});

// X 熱門人物
app.post('/api/x-leading-figures', async (req, res) => {
  try {
    const { page = 1, page_size = 100, rank_type = "heat" } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('獲取 X 熱門人物請求:', {
      page,
      page_size,
      rank_type,
      language,
      body: req.body
    });
    
    const response = await axios.post(`${rootdataBaseUrl}/open/leading_figures_on_crypto_x`, 
      { page, page_size, rank_type },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    console.log('RootData API 響應:', {
      status: response.status,
      data: response.data
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('獲取 X 熱門人物失敗:', error.response?.data || error.message);
    console.error('錯誤詳情:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '獲取 X 熱門人物失敗',
      data: error.response?.data || {}
    });
  }
});

// 人物職位動態
app.post('/api/job-changes', async (req, res) => {
  try {
    const { page = 1, page_size = 20 } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('獲取人物職位動態請求:', {
      page,
      page_size,
      language,
      body: req.body
    });
    
    const response = await axios.post(`${rootdataBaseUrl}/open/job_changes`, 
      { page, page_size },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    console.log('RootData API 響應:', {
      status: response.status,
      data: response.data
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('獲取人物職位動態失敗:', error.response?.data || error.message);
    console.error('錯誤詳情:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '獲取人物職位動態失敗',
      data: error.response?.data || {}
    });
  }
});

// X 熱門項目
app.post('/api/x-hot-projects', async (req, res) => {
  try {
    const { page = 1, page_size = 20 } = req.body;
    const language = req.headers.language || 'cn';
    
    console.log('獲取 X 熱門項目請求:', {
      page,
      page_size,
      language,
      body: req.body
    });
    
    const response = await axios.post(`${rootdataBaseUrl}/open/hot_projects_on_twitter`, 
      { page, page_size },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'language': language
        }
      }
    );
    
    console.log('RootData API 響應:', {
      status: response.status,
      data: response.data
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('獲取 X 熱門項目失敗:', error.response?.data || error.message);
    console.error('錯誤詳情:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    res.status(error.response?.status || 500).json({
      result: error.response?.status || 500,
      message: error.response?.data?.message || '獲取 X 熱門項目失敗',
      data: error.response?.data || {}
    });
  }
}); 