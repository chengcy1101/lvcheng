// 全局变量
let chatRecords = [];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 导航切换
    initNavigation();
    
    // 初始化AI对话
    initChat();
    
    // 初始化贷款计算器
    initCalculator();
    
    // 初始化房源推荐
    initHouses();
    
    // 初始化咨询记录
    initRecords();
});

// 导航切换
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            // 移除所有激活状态
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // 添加当前激活状态
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// 初始化AI对话
function initChat() {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    
    // 发送按钮点击事件
    sendBtn.addEventListener('click', sendMessage);
    
    // 回车键发送
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 核心能力卡片点击事件
    const abilityCards = document.querySelectorAll('.ability-card');
    abilityCards.forEach(card => {
        card.addEventListener('click', function() {
            const intent = this.dataset.intent;
            let message = '';
            
            switch(intent) {
                case 'house':
                    message = '我想了解一下户型信息';
                    break;
                case 'price':
                    message = '请问现在的房价是多少？';
                    break;
                case 'loan':
                    message = '我想咨询贷款相关的问题';
                    break;
            }
            
            userInput.value = message;
            sendMessage();
        });
    });
    
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            // 添加用户消息
            addMessage('user', message);
            userInput.value = '';
            
            // 调用AI回复
            try {
                const aiResponse = await getAIResponse(message);
                addMessage('ai', aiResponse);
                
                // 保存记录
                saveChatRecord(message, aiResponse);
            } catch (error) {
                console.error('发送消息错误:', error);
                addMessage('ai', '抱歉，我暂时无法回复您的问题，请稍后再试。');
            }
        }
    }
    
    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // 解析Markdown内容
        if (type === 'ai') {
            // 对于AI回复，使用marked.js解析Markdown
            messageContent.innerHTML = marked.parse(content);
            
            // 为所有图片添加点击放大功能
            const images = messageContent.querySelectorAll('img');
            images.forEach(img => {
                img.addEventListener('click', function() {
                    openImageModal(this.src, this.alt);
                });
                img.title = '点击放大查看';
            });
        } else {
            // 对于用户消息，保持原格式
            messageContent.innerHTML = `<p>${content}</p>`;
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 前端对话历史（不包含系统提示，系统提示在后端）
    let conversationHistory = [];

    async function getAIResponse(message) {
        // 添加用户消息到对话历史
        conversationHistory.push({
            role: "user",
            content: message
        });

        try {
            // 调用本地后端API
            console.log('开始调用本地后端API...');
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: conversationHistory,
                    temperature: 0.7,
                    maxTokens: 500
                })
            });

            console.log('API响应状态:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API响应数据:', data);
                
                const aiResponse = data.response;
                
                // 添加AI回复到对话历史
                conversationHistory.push({
                    role: "assistant",
                    content: aiResponse
                });

                // 限制对话历史长度，避免超过API限制
                if (conversationHistory.length > 10) {
                    // 保留最近的10条消息
                    conversationHistory = conversationHistory.slice(-10);
                }

                return aiResponse;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('API调用失败:', errorData);
                // 降级到模拟回复
                return generateSimulatedResponse(message);
            }
        } catch (error) {
            console.error('API调用错误:', error);
            // 降级到模拟回复
            return generateSimulatedResponse(message);
        }
    }

    function generateSimulatedResponse(message) {
        // 基于系统提示和对话历史生成更智能的模拟回复
        message = message.toLowerCase();
        
        // 检查对话历史，获取更多上下文
        const recentMessages = conversationHistory.slice(-5); // 获取最近5条消息
        const hasAskedAboutHouse = recentMessages.some(msg => 
            msg.content.toLowerCase().includes('户型') || msg.content.toLowerCase().includes('房子')
        );
        const hasAskedAboutPrice = recentMessages.some(msg => 
            msg.content.toLowerCase().includes('价格') || msg.content.toLowerCase().includes('多少钱')
        );
        const hasAskedAboutLoan = recentMessages.some(msg => 
            msg.content.toLowerCase().includes('贷款') || msg.content.toLowerCase().includes('月供')
        );
        
        // 基于上下文和当前消息生成回复
        if (message.includes('户型') || message.includes('房子')) {
            if (hasAskedAboutPrice) {
                return '我们的户型主要有89㎡三室一厅、110㎡三室两厅和130㎡四室两厅，价格区间在2.5万-3.5万/㎡。您可以根据预算选择合适的户型，需要我为您详细介绍某个户型吗？';
            } else {
                return '我们有多种户型可供选择，包括89㎡三室一厅、110㎡三室两厅和130㎡四室两厅。所有户型都采用南北通透设计，采光良好。您更感兴趣哪种户型呢？';
            }
        } else if (message.includes('价格') || message.includes('多少钱')) {
            return '我们的房价区间在2.5万-3.5万/㎡，具体价格根据楼层、朝向和户型有所不同。现在购买还有98折优惠，并且可以参与砸金蛋活动赢取家电。您对哪个户型感兴趣呢？';
        } else if (message.includes('贷款') || message.includes('月供')) {
            return '我们支持商业贷款、公积金贷款和组合贷款。以300万的房子为例，首付30%的话，商业贷款30年的月供大约在11000元左右。您可以使用我们的贷款计算器详细计算，需要我为您打开吗？';
        } else if (message.includes('犹豫') || message.includes('纠结')) {
            return '很多客户在购房时都会有犹豫，这是很正常的。我们的项目位于核心地段，周边配套完善，交通便利，升值空间大。最近已经有很多客户预订了，您可以先锁定意向房源，避免错过心仪的房子。需要我为您安排销售顾问详细介绍吗？';
        } else if (message.includes('你好') || message.includes('您好') || message.includes('hi') || message.includes('hello')) {
            return '您好！欢迎来到绿城案场，我是您的AI销助顾问。请问您是想了解户型、价格、贷款还是其他方面的信息呢？';
        } else if (message.includes('再见') || message.includes('谢谢')) {
            return '不客气！如果您还有其他问题，随时可以咨询我。祝您生活愉快！';
        } else {
            return '感谢您的咨询。请问您是想了解户型、价格、贷款还是其他方面的信息呢？';
        }
    }

    function getDefaultResponse(message) {
        // 简单的意图识别和回复（降级方案）
        message = message.toLowerCase();
        
        if (message.includes('户型') || message.includes('房子')) {
            return '我们有多种户型可供选择，包括89㎡三室一厅、110㎡三室两厅和130㎡四室两厅。您可以在房源推荐页面查看详细信息。';
        } else if (message.includes('价格') || message.includes('多少钱')) {
            return '我们的房价区间在2.5万-3.5万/㎡，具体价格根据楼层、朝向和户型有所不同。现在购买还有优惠活动，欢迎咨询。';
        } else if (message.includes('贷款') || message.includes('月供')) {
            return '您可以使用我们的贷款计算器计算月供，支持商业贷款、公积金贷款和组合贷款。需要我为您打开贷款计算器吗？';
        } else if (message.includes('犹豫') || message.includes('纠结')) {
            return '很多客户在购房时都会有犹豫，这是很正常的。我们的房子位于核心地段，配套完善，升值空间大。最近有很多客户都在考虑，您可以先了解一下具体房源信息，再做决定。';
        } else if (message.includes('你好') || message.includes('您好') || message.includes('hi') || message.includes('hello')) {
            return '您好！欢迎来到绿城案场，我是您的AI销助顾问。请问有什么可以帮到您的？';
        } else if (message.includes('再见') || message.includes('谢谢')) {
            return '不客气！如果您还有其他问题，随时可以咨询我。祝您生活愉快！';
        } else {
            return '感谢您的咨询。请问您是想了解户型、价格、贷款还是其他方面的信息呢？';
        }
    }
}

// 初始化贷款计算器
function initCalculator() {
    const calculateBtn = document.getElementById('calculateBtn');
    const housePrice = document.getElementById('housePrice');
    const downPayment = document.getElementById('downPayment');
    const loanTerm = document.getElementById('loanTerm');
    const loanType = document.getElementById('loanType');
    
    calculateBtn.addEventListener('click', calculateLoan);
    
    // 初始计算
    calculateLoan();
    
    function calculateLoan() {
        const price = parseFloat(housePrice.value); // 房价，单位：万元
        const downRatio = parseFloat(downPayment.value) / 100;
        const term = parseFloat(loanTerm.value);
        const type = loanType.value;
        
        // 计算贷款金额（转换为元）
        const loanAmountYuan = price * 10000 * (1 - downRatio);
        const loanAmountWan = loanAmountYuan / 10000;
        
        // 利率设置（模拟）
        let rate = 0;
        switch(type) {
            case 'commercial':
                rate = 4.9 / 100 / 12; // 商业贷款
                break;
            case 'fund':
                rate = 3.25 / 100 / 12; // 公积金贷款
                break;
            case 'combination':
                rate = 4.0 / 100 / 12; // 组合贷款
                break;
        }
        
        // 计算月供（元）
        const months = term * 12;
        const monthlyPayment = loanAmountYuan * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
        
        // 计算总利息（万元）
        const totalInterestYuan = monthlyPayment * months - loanAmountYuan;
        const totalInterestWan = totalInterestYuan / 10000;
        
        // 更新结果
        document.getElementById('loanAmount').textContent = `${loanAmountWan.toFixed(0)}万元`;
        document.getElementById('monthlyPayment').textContent = `${monthlyPayment.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}元`;
        document.getElementById('totalInterest').textContent = `${totalInterestWan.toFixed(2)}万元`;
    }
}

// 初始化房源推荐
async function initHouses() {
    const housesGrid = document.getElementById('housesGrid');
    
    try {
        // 从后端API获取房源信息
        const response = await fetch('/api/houses');
        
        if (!response.ok) {
            throw new Error('获取房源信息失败');
        }
        
        const data = await response.json();
        const houses = data.houses;
        
        console.log('获取到房源信息:', houses);
        
        // 生成房源卡片
        housesGrid.innerHTML = '';
        houses.forEach(house => {
            const houseCard = document.createElement('div');
            houseCard.className = 'house-card';
            houseCard.innerHTML = `
                <div class="house-image">
                    <img src="${house.image}" alt="${house.name}户型图" style="width: 100%; height: 200px; object-fit: cover;">
                </div>
                <div class="house-info">
                    <div class="house-title">${house.name}</div>
                    <div class="house-details">${house.description}</div>
                    <div class="house-details">特点：${house.features.join('、')}</div>
                    <div class="house-price">${house.price}</div>
                    <button class="house-btn" data-house-id="${house.id}"><i class="fas fa-info-circle"></i> 查看详情</button>
                </div>
            `;
            housesGrid.appendChild(houseCard);
        });
        
        // 添加查看详情按钮的点击事件
        document.querySelectorAll('.house-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const houseId = parseInt(this.getAttribute('data-house-id'));
                const house = houses.find(h => h.id === houseId);
                if (house) {
                    showHouseDetail(house);
                }
            });
        });
    } catch (error) {
        console.error('加载房源信息错误:', error);
        housesGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">加载房源信息失败</p>';
    }
}

// 初始化咨询记录
function initRecords() {
    const recordsList = document.getElementById('recordsList');
    
    // 加载记录
    loadChatRecords();
    
    function loadChatRecords() {
        // 从本地存储加载记录
        const savedRecords = localStorage.getItem('chatRecords');
        if (savedRecords) {
            chatRecords = JSON.parse(savedRecords);
            renderRecords();
        }
    }
    
    function renderRecords() {
        recordsList.innerHTML = '';
        
        if (chatRecords.length === 0) {
            recordsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">暂无咨询记录</p>';
            return;
        }
        
        chatRecords.forEach(record => {
            const recordItem = document.createElement('div');
            recordItem.className = 'record-item';
            recordItem.innerHTML = `
                <div class="record-time">${record.time}</div>
                <div class="record-content">${record.userMessage}</div>
                <div class="record-ai-response">${record.aiResponse}</div>
            `;
            recordsList.appendChild(recordItem);
        });
    }
}

// 保存聊天记录
function saveChatRecord(userMessage, aiResponse) {
    const record = {
        time: new Date().toLocaleString(),
        userMessage: userMessage,
        aiResponse: aiResponse
    };
    
    chatRecords.unshift(record);
    
    // 限制记录数量
    if (chatRecords.length > 10) {
        chatRecords = chatRecords.slice(0, 10);
    }
    
    // 保存到本地存储
    localStorage.setItem('chatRecords', JSON.stringify(chatRecords));
    
    // 更新记录列表
    const recordsList = document.getElementById('recordsList');
    if (recordsList && document.getElementById('records').classList.contains('active')) {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        recordItem.innerHTML = `
            <div class="record-time">${record.time}</div>
            <div class="record-content">${record.userMessage}</div>
            <div class="record-ai-response">${record.aiResponse}</div>
        `;
        recordsList.insertBefore(recordItem, recordsList.firstChild);
        
        // 限制显示数量
        if (recordsList.children.length > 10) {
            recordsList.removeChild(recordsList.lastChild);
        }
    }
}

// 显示房源详情
function showHouseDetail(house) {
    const modal = document.getElementById('houseDetailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // 设置模态框标题
    modalTitle.textContent = house.name;
    
    // 构建模态框内容
    modalBody.innerHTML = `
        <div class="house-detail">
            <img src="${house.image}" alt="${house.name}户型图">
            <div class="price-info">${house.price}</div>
            <h3>户型描述</h3>
            <p>${house.description}</p>
            <h3>户型特点</h3>
            <ul class="feature-list">
                ${house.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <h3>推荐理由</h3>
            <ul class="feature-list">
                <li>绿城品质，值得信赖</li>
                <li>滨江区核心位置，交通便利</li>
                <li>周边配套完善，生活便捷</li>
                <li>南北通透，采光良好</li>
                <li>空间布局合理，利用率高</li>
            </ul>
            <div class="btn-group">
                <button class="btn btn-primary" onclick="contactSales()"><i class="fas fa-phone"></i> 联系销售</button>
                <button class="btn btn-secondary" onclick="closeModal()"><i class="fas fa-times"></i> 关闭</button>
            </div>
        </div>
    `;
    
    // 显示模态框
    modal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    document.getElementById('houseDetailModal').style.display = 'none';
}

// 联系销售
function contactSales() {
    alert('销售顾问将尽快与您联系！\n电话：400-888-8888');
    closeModal();
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('houseDetailModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// 关闭按钮点击事件
document.getElementById('closeModal').addEventListener('click', closeModal);

// 打开图片放大模态框
function openImageModal(imageSrc, imageCaption) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('enlargedImage');
    const captionText = document.getElementById('imageCaption');
    
    modal.style.display = 'block';
    modalImg.src = imageSrc;
    captionText.textContent = imageCaption;
}

// 关闭图片放大模态框
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

// 图片放大模态框关闭按钮事件
document.querySelector('.image-modal-close').addEventListener('click', closeImageModal);

// 点击图片放大模态框外部关闭
window.onclick = function(event) {
    const houseModal = document.getElementById('houseDetailModal');
    const imageModal = document.getElementById('imageModal');
    
    if (event.target == houseModal) {
        houseModal.style.display = 'none';
    }
    if (event.target == imageModal) {
        imageModal.style.display = 'none';
    }
};

// ESC键关闭图片放大模态框
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeImageModal();
    }
});