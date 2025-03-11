# RootData API 测试工具

这是一个简单的 Web 应用程序，用于测试 RootData API 的各种端点。

## 功能特点

- 简洁的用户界面，方便测试各种 API 端点
- 支持所有 RootData API 端点
- 自动处理 API 认证
- 格式化 JSON 响应结果
- 复制响应结果到剪贴板

## 支持的 API 端点

- 项目列表和详情
- 融资轮次列表和详情
- 投资者列表和详情
- 新闻列表和详情
- 搜索功能

## 安装和运行

1. 克隆此仓库
2. 安装依赖
   ```
   npm install
   ```
3. 创建 `.env` 文件并添加你的 RootData API 密钥
   ```
   ROOTDATA_API_KEY=你的API密钥
   PORT=3000
   ```
4. 启动服务器
   ```
   npm start
   ```
5. 在浏览器中访问 `http://localhost:3000`

## 开发

使用以下命令启动开发服务器（支持热重载）：

```
npm run dev
```

## 项目结构

```
rootdata-api-tester/
├── src/
│   ├── backend/
│   │   └── server.js       # Express 服务器
│   └── frontend/
│       ├── index.html      # 前端 HTML
│       ├── styles.css      # CSS 样式
│       └── app.js          # 前端 JavaScript
├── .env                    # 环境变量
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 注意事项

- 请确保你的 API 密钥保密，不要将其提交到版本控制系统
- 此工具仅用于测试和开发目的 