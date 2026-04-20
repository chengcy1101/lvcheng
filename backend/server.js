import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { houseTypes, communities, priceInfo, loanInfo, areaAdvantages, salesPolicy, searchHouses, searchCommunities } from './data/house-knowledge-base.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'https://your-project.vercel.app',
  'https://your-project.netlify.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// 系统提示
const systemPrompt = "你是绿城案场的AI销助顾问，专业、热情、有耐心。你的任务是：1. 热情接待到访客户 2. 回答关于户型、价格、贷款等问题 3. 推荐合适的房源 4. 当客户犹豫时，提供专业的销冠话术帮助决策 5. 引导客户与销售顾问进一步沟通。请使用自然、友好的语言，避免使用过于专业的术语，确保客户能够轻松理解。\n\n重要提示：当知识库中包含户型图信息时，请务必在回复中使用Markdown格式引用户型图，格式为：![户型图名称](图片URL)。例如：![89㎡三室一厅户型图](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20floor%20plan%2089sqm%20three%20bedrooms%20one%20living%20room&image_size=square_hd)。\n\n请基于以下知识库信息回答问题：\n";

// API端点 - 调用大模型
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, temperature = 0.7, maxTokens = 100 } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages are required and must be an array' });
        }
        
        // 获取用户最新的消息
        const latestMessage = messages[messages.length - 1].content;
        console.log('用户消息:', latestMessage);
        
        // 从知识库中检索相关信息
        const relevantHouses = searchHouses(latestMessage);
        const relevantCommunities = searchCommunities(latestMessage);
        
        console.log('相关户型:', relevantHouses.length);
        console.log('相关小区:', relevantCommunities.length);
        
        // 构建知识库信息
        let knowledgeBaseInfo = '';
        
        if (relevantHouses.length > 0) {
            knowledgeBaseInfo += '相关户型信息：\n';
            relevantHouses.forEach(house => {
                knowledgeBaseInfo += `• ${house.name}：${house.description}，价格：${house.price}，特点：${house.features.join('、')}，户型图：${house.image}\n`;
            });
        }
        
        if (relevantCommunities.length > 0) {
            knowledgeBaseInfo += '相关小区信息：\n';
            relevantCommunities.forEach(community => {
                knowledgeBaseInfo += `• ${community.name}：${community.description}，位置：${community.location}，配套：${community.facilities.join('、')}\n`;
            });
        }
        
        // 如果没有相关信息，添加通用信息
        if (knowledgeBaseInfo === '') {
            knowledgeBaseInfo += '通用房源信息：\n';
            knowledgeBaseInfo += `• 均价：${priceInfo.averagePrice}，价格区间：${priceInfo.priceRange}\n`;
            knowledgeBaseInfo += `• 在售户型：${houseTypes.map(h => h.name).join('、')}\n`;
            knowledgeBaseInfo += `• 支持贷款方式：${priceInfo.paymentMethods.join('、')}\n`;
            knowledgeBaseInfo += `• 区域优势：${areaAdvantages.join('、')}\n`;
        }
        
        // 构建完整的系统提示
        const fullSystemPrompt = systemPrompt + knowledgeBaseInfo;
        
        // 构建完整的消息列表，包含系统提示
        const fullMessages = [
            { role: 'system', content: fullSystemPrompt },
            ...messages
        ];
        
        console.log('调用火山引擎API...');
        console.log('模型:', process.env.MODEL);
        console.log('端点:', process.env.ENDPOINT);
        
        // 调用火山引擎API
        const response = await fetch(`${process.env.ENDPOINT}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_KEY}`
            },
            body: JSON.stringify({
                model: process.env.MODEL,
                messages: fullMessages,
                temperature: temperature,
                max_tokens: maxTokens
            })
        });
        
        console.log('API响应状态:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API调用失败:', errorData);
            return res.status(response.status).json({ error: 'API调用失败', details: errorData });
        }
        
        const data = await response.json();
        console.log('API响应成功');
        
        let aiResponse = data.choices[0].message.content;
        
        // 自动插入户型图到响应中
        if (relevantHouses.length > 0) {
            let imagesText = '\n\n---\n\n### 户型图展示\n';
            relevantHouses.forEach(house => {
                imagesText += `\n**${house.name}户型图**：\n`;
                imagesText += `![${house.name}户型图](${house.image})\n`;
            });
            aiResponse += imagesText;
        }
        
        res.json({
            success: true,
            response: aiResponse,
            fullResponse: data
        });
        
    } catch (error) {
        console.error('服务器错误:', error);
        res.status(500).json({ error: '服务器内部错误', details: error.message });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取房源信息API
app.get('/api/houses', (req, res) => {
    try {
        res.json({
            success: true,
            houses: houseTypes,
            communities: communities
        });
    } catch (error) {
        console.error('获取房源信息错误:', error);
        res.status(500).json({ error: '获取房源信息失败' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('API端点:');
    console.log('  POST /api/chat - 调用大模型');
    console.log('  GET /api/health - 健康检查');
});