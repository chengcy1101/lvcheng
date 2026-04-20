// 本地开发服务器，用于代理API请求
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');

const app = express();
const PORT = 8080;

// 静态文件服务
app.use(express.static(__dirname));

// API代理到本地后端
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`本地开发服务器运行在 http://localhost:${PORT}`);
  console.log(`API请求将代理到 http://localhost:3001`);
});
