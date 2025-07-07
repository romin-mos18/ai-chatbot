/**
 * AI Healthcare Chat Widget
 * Single JavaScript file that creates a complete chat widget
 * 
 * Usage:
 * 1. Include this script in your HTML: <script src="chat-widget.js"></script>
 * 2. Optionally configure: window.ChatWidgetConfig = { webhook: { url: 'your-url' } };
 * 3. The widget will automatically initialize when the page loads
 */

(function() {
    'use strict';

    // Default configuration - can be overridden by window.ChatWidgetConfig
    const defaultConfig = {
        webhook: {
            url: 'https://n8n.myonsitehealthcare.com/webhook/c7e03ef8-cbcf-4f0e-8168-223d43cc8bd2',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        },
        branding: {
            name: 'AI Healthcare Assistant',
            welcomeText: 'Hello! I\'m your AI healthcare assistant. How can I help you today?',
            responseTimeText: 'We typically respond right away'
        },
        style: {
            primaryColor: '#22b7f1',
            secondaryColor: '#2e9ad9',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        }
    };

    // Merge user config with default config
    const config = window.ChatWidgetConfig ? 
        Object.assign({}, defaultConfig, window.ChatWidgetConfig) : 
        defaultConfig;

    // CSS Styles
    const styles = `
        /* Chat Widget Styles */
        #ai-chat-widget * {
            box-sizing: border-box;
        }

        #ai-chat-widget {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
        }

        /* Chat Widget Button */
        #ai-chat-widget .chat-widget-button {
            width: 60px;
            height: 60px;
            background-color: ${config.style.primaryColor};
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            border: none;
            position: relative;
        }

        #ai-chat-widget .chat-widget-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        #ai-chat-widget .chat-widget-button.hidden {
            display: none;
        }

        #ai-chat-widget .chat-widget-button svg {
            width: 30px;
            height: 30px;
            fill: white;
        }

        /* Chat Widget Container */
        #ai-chat-widget .chat-widget-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            height: 600px;
            background-color: ${config.style.backgroundColor};
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s ease;
        }

        #ai-chat-widget .chat-widget-container.active {
            display: flex;
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        /* Header */
        #ai-chat-widget .chat-header {
            background: linear-gradient(135deg, ${config.style.primaryColor} 0%, ${config.style.secondaryColor} 100%);
            padding: 20px;
            position: relative;
            display: flex;
            align-items: center;
            gap: 15px;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
        }

        #ai-chat-widget .chat-mascot {
            width: 50px;
            height: 50px;
            background-color: #f9c433;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
        }

        #ai-chat-widget .chat-info {
            flex: 1;
        }

        #ai-chat-widget .chat-title {
            font-size: 18px;
            font-weight: 600;
            color: white;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        #ai-chat-widget .ai-badge {
            background-color: rgba(255, 255, 255, 0.9);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            color: ${config.style.primaryColor};
        }

        #ai-chat-widget .chat-subtitle {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 2px;
        }

        #ai-chat-widget .close-button {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 30px;
            height: 30px;
            background: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }

        #ai-chat-widget .close-button:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        #ai-chat-widget .close-button svg {
            width: 24px;
            height: 24px;
            fill: white;
        }

        /* Chat Content */
        #ai-chat-widget .chat-content {
            flex: 1;
            overflow-y: auto;
            background-color: #f8f9fa;
            display: flex;
            flex-direction: column;
        }

        /* Welcome Section */
        #ai-chat-widget .welcome-section {
            background-color: white;
            padding: 20px;
            margin: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        #ai-chat-widget .welcome-text {
            font-size: 15px;
            color: #333;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        #ai-chat-widget .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        #ai-chat-widget .action-button {
            background-color: ${config.style.primaryColor};
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        }

        #ai-chat-widget .action-button:hover {
            background-color: ${config.style.secondaryColor};
            transform: translateY(-1px);
        }

        #ai-chat-widget .action-button.secondary {
            background-color: transparent;
            color: ${config.style.primaryColor};
            border: 1px solid ${config.style.primaryColor};
        }

        #ai-chat-widget .action-button.secondary:hover {
            background-color: #f8f9fa;
        }

        #ai-chat-widget .learn-more {
            display: block;
            margin-top: 15px;
            text-align: center;
            color: #666;
            font-size: 13px;
            text-decoration: none;
        }

        #ai-chat-widget .learn-more:hover {
            color: ${config.style.primaryColor};
            text-decoration: underline;
        }

        /* Messages Area */
        #ai-chat-widget .messages-area {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: none;
            max-height: 400px;
        }

        #ai-chat-widget .message {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        #ai-chat-widget .message.user {
            flex-direction: row-reverse;
        }

        #ai-chat-widget .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: ${config.style.primaryColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
            color: white;
        }

        #ai-chat-widget .message.user .message-avatar {
            background-color: ${config.style.secondaryColor};
            color: white;
            font-size: 14px;
            font-weight: 500;
        }

        #ai-chat-widget .message-content {
            max-width: 70%;
            background-color: white;
            padding: 12px 16px;
            border-radius: 12px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        #ai-chat-widget .message.user .message-content {
            background-color: ${config.style.primaryColor};
            color: white;
        }

        #ai-chat-widget .message.error .message-content {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        /* Input Area */
        #ai-chat-widget .input-area {
            padding: 15px;
            background-color: white;
            border-top: 1px solid #e9ecef;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        #ai-chat-widget .input-field {
            flex: 1;
            border: 1px solid #e9ecef;
            border-radius: 24px;
            padding: 10px 20px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }

        #ai-chat-widget .input-field:focus {
            border-color: ${config.style.primaryColor};
        }

        #ai-chat-widget .input-field::placeholder {
            color: #adb5bd;
        }

        #ai-chat-widget .voice-button, #ai-chat-widget .send-button {
            width: 36px;
            height: 36px;
            border: none;
            background-color: ${config.style.primaryColor};
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        #ai-chat-widget .voice-button:hover, #ai-chat-widget .send-button:hover {
            background-color: ${config.style.secondaryColor};
            transform: scale(1.05);
        }

        #ai-chat-widget .voice-button svg, #ai-chat-widget .send-button svg {
            width: 20px;
            height: 20px;
            fill: white;
        }

        /* Powered By Footer */
        #ai-chat-widget .powered-by {
            padding: 10px;
            text-align: center;
            font-size: 11px;
            color: #666;
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }

        #ai-chat-widget .powered-by a {
            color: ${config.style.primaryColor};
            text-decoration: none;
            font-weight: 500;
        }

        #ai-chat-widget .powered-by a:hover {
            text-decoration: underline;
        }

        /* Typing Indicator */
        #ai-chat-widget .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 12px 16px;
        }

        #ai-chat-widget .typing-dot {
            width: 8px;
            height: 8px;
            background-color: #666;
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }

        #ai-chat-widget .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        #ai-chat-widget .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.5;
            }
            30% {
                transform: translateY(-10px);
                opacity: 1;
            }
        }

        /* Responsive Design */
        @media (max-width: 480px) {
            #ai-chat-widget .chat-widget-container {
                width: calc(100vw - 40px);
                height: calc(100vh - 40px);
                bottom: 20px;
                right: 20px;
                border-radius: 12px;
            }

            #ai-chat-widget .chat-widget-button {
                bottom: 15px;
                right: 15px;
                width: 55px;
                height: 55px;
            }

            #ai-chat-widget .message-content {
                max-width: 80%;
            }
        }

        @media (min-width: 481px) and (max-width: 768px) {
            #ai-chat-widget .chat-widget-container {
                width: 350px;
                height: 550px;
            }
        }
    `;

    // HTML Template
    const htmlTemplate = `
        <div id="ai-chat-widget">
            <!-- Chat Widget Button -->
            <button class="chat-widget-button" id="chatWidgetButton" aria-label="Open chat">
                <svg viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
            </button>

            <!-- Chat Widget Container -->
            <div class="chat-widget-container" id="chatWidgetContainer">
                <!-- Header -->
                <div class="chat-header">
                    <div class="chat-mascot">🤖</div>
                    <div class="chat-info">
                        <div class="chat-title">
                            ${config.branding.name} <span class="ai-badge">AI</span>
                        </div>
                        <div class="chat-subtitle">Healthcare Support Specialist</div>
                    </div>
                    <button class="close-button" id="closeWidget" aria-label="Close chat">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>

                <!-- Chat Content -->
                <div class="chat-content">
                    <!-- Welcome Section -->
                    <div class="welcome-section" id="welcomeSection">
                        <div class="welcome-text">
                            ${config.branding.welcomeText}
                        </div>
                        <div class="action-buttons">
                            <button class="action-button" id="startChatBtn">Start a conversation</button>
                            <button class="action-button secondary" id="askQuestionBtn">Ask a question</button>
                        </div>
                        <a href="#" class="learn-more" id="learnMoreLink">Learn more about our services</a>
                    </div>

                    <!-- Messages Area -->
                    <div class="messages-area" id="messagesArea">
                        <!-- Messages will appear here -->
                    </div>
                </div>

                <!-- Input Area -->
                <div class="input-area" id="inputArea">
                    <input type="text" class="input-field" id="messageInput" placeholder="Type your message...">
                    <button class="voice-button" id="voiceInputBtn" aria-label="Voice input">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                    </button>
                    <button class="send-button" id="sendBtn" style="display: none;" aria-label="Send message">
                        <svg viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>

                <!-- Powered By Footer -->
                <div class="powered-by">
                    Powered by <a href="https://medinovai.com" target="_blank">MedinovAI</a>
                </div>
            </div>
        </div>
    `;

    // Chat Widget Class
    class ChatWidget {
        constructor() {
            this.isOpen = false;
            this.messages = [];
            this.chatHistory = [];
            this.isTyping = false;
            this.recognition = null;
            this.elements = {};
            
            this.init();
        }

        init() {
            this.injectStyles();
            this.injectHTML();
            this.initializeElements();
            this.attachEventListeners();
            this.loadChatHistory();
            
            console.log('AI Chat Widget initialized successfully');
            console.log('Webhook URL:', config.webhook.url);
        }

        injectStyles() {
            const styleElement = document.createElement('style');
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }

        injectHTML() {
            const widgetContainer = document.createElement('div');
            widgetContainer.innerHTML = htmlTemplate;
            document.body.appendChild(widgetContainer.firstElementChild);
        }

        initializeElements() {
            this.elements = {
                chatButton: document.getElementById('chatWidgetButton'),
                chatContainer: document.getElementById('chatWidgetContainer'),
                closeButton: document.getElementById('closeWidget'),
                startChatBtn: document.getElementById('startChatBtn'),
                askQuestionBtn: document.getElementById('askQuestionBtn'),
                learnMoreLink: document.getElementById('learnMoreLink'),
                messageInput: document.getElementById('messageInput'),
                sendBtn: document.getElementById('sendBtn'),
                voiceInputBtn: document.getElementById('voiceInputBtn'),
                welcomeSection: document.getElementById('welcomeSection'),
                messagesArea: document.getElementById('messagesArea'),
                inputArea: document.getElementById('inputArea')
            };
        }

        attachEventListeners() {
            // Main toggle
            this.elements.chatButton.addEventListener('click', () => this.toggleWidget());
            this.elements.closeButton.addEventListener('click', () => this.closeWidget());
            
            // Chat actions
            this.elements.startChatBtn.addEventListener('click', () => this.startChat());
            this.elements.askQuestionBtn.addEventListener('click', () => this.askQuestion());
            this.elements.learnMoreLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://www.myonsitehealthcare.com', '_blank');
            });
            
            // Messaging
            this.elements.messageInput.addEventListener('input', () => this.updateSendButton());
            this.elements.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
            this.elements.voiceInputBtn.addEventListener('click', () => this.startVoiceInput());
            
            // Handle clicks outside widget to close
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.elements.chatContainer.contains(e.target) && !this.elements.chatButton.contains(e.target)) {
                    this.closeWidget();
                }
            });
        }

        toggleWidget() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.elements.chatContainer.classList.add('active');
                this.elements.chatButton.classList.add('hidden');
                this.loadChatHistory();
            } else {
                this.elements.chatContainer.classList.remove('active');
                this.elements.chatButton.classList.remove('hidden');
                this.saveCurrentChat();
            }
        }

        closeWidget() {
            this.isOpen = false;
            this.elements.chatContainer.classList.remove('active');
            this.elements.chatButton.classList.remove('hidden');
            this.saveCurrentChat();
        }

        startChat() {
            this.elements.welcomeSection.style.display = 'none';
            this.elements.messagesArea.style.display = 'block';
            this.addMessage('Hello! I\'m your AI healthcare assistant. How can I help you today?', 'bot');
            this.elements.messageInput.focus();
        }

        askQuestion() {
            this.elements.welcomeSection.style.display = 'none';
            this.elements.messagesArea.style.display = 'block';
            this.addMessage('I\'m here to help answer your questions. What would you like to know?', 'bot');
            this.elements.messageInput.focus();
        }

        addMessage(text, sender, isError = false) {
            const message = {
                text: text,
                sender: sender,
                timestamp: Date.now(),
                isError: isError
            };
            this.messages.push(message);
            this.displayMessages();
            
            // Auto-scroll
            setTimeout(() => {
                this.elements.messagesArea.scrollTop = this.elements.messagesArea.scrollHeight;
            }, 100);
        }

        displayMessages() {
            this.elements.messagesArea.innerHTML = '';
            
            this.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.sender}${msg.isError ? ' error' : ''}`;
                
                const avatar = document.createElement('div');
                avatar.className = 'message-avatar';
                avatar.textContent = msg.sender === 'bot' ? '🤖' : 'U';
                
                const content = document.createElement('div');
                content.className = 'message-content';
                content.textContent = msg.text;
                
                messageDiv.appendChild(avatar);
                messageDiv.appendChild(content);
                this.elements.messagesArea.appendChild(messageDiv);
            });
        }

        async sendMessage() {
            const message = this.elements.messageInput.value.trim();
            if (!message || this.isTyping) return;
            
            // Add user message
            this.addMessage(message, 'user');
            this.elements.messageInput.value = '';
            this.updateSendButton();
            
            // Show typing indicator
            this.showTypingIndicator();
            this.isTyping = true;
            
            try {
                const requestBody = {
                    message: message,
                    sessionId: this.getSessionId(),
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    source: 'web_widget'
                };
                
                const response = await fetch(config.webhook.url, {
                    method: config.webhook.method,
                    headers: config.webhook.headers,
                    body: JSON.stringify(requestBody),
                    mode: 'cors',
                    credentials: 'omit'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const responseText = await response.text();
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    data = { message: responseText || 'I received your message!' };
                }
                
                this.hideTypingIndicator();
                this.isTyping = false;
                
                // Handle different response formats
                let botResponse = data.message || data.response || data.reply || 'Thank you for your message!';
                this.addMessage(botResponse, 'bot');
                
            } catch (error) {
                console.error('Chat error:', error);
                this.hideTypingIndicator();
                this.isTyping = false;
                
                let errorMessage = 'I apologize, but I\'m having trouble connecting right now. ';
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    errorMessage += 'This might be due to CORS restrictions or network issues.';
                } else if (error.message.includes('HTTP')) {
                    errorMessage += `Server error: ${error.message}`;
                } else {
                    errorMessage += 'Please try again in a moment.';
                }
                
                this.addMessage(errorMessage, 'bot', true);
            }
        }

        showTypingIndicator() {
            this.hideTypingIndicator();
            
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot';
            typingDiv.id = 'typingIndicator';
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = '🤖';
            
            const content = document.createElement('div');
            content.className = 'message-content typing-indicator';
            content.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
            
            typingDiv.appendChild(avatar);
            typingDiv.appendChild(content);
            this.elements.messagesArea.appendChild(typingDiv);
            
            this.elements.messagesArea.scrollTop = this.elements.messagesArea.scrollHeight;
        }

        hideTypingIndicator() {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) {
                indicator.remove();
            }
        }

        updateSendButton() {
            if (this.elements.messageInput.value.trim() && !this.isTyping) {
                this.elements.voiceInputBtn.style.display = 'none';
                this.elements.sendBtn.style.display = 'flex';
            } else {
                this.elements.voiceInputBtn.style.display = 'flex';
                this.elements.sendBtn.style.display = 'none';
            }
        }

        startVoiceInput() {
            if (!('webkitSpeechRecognition' in window)) {
                alert('Voice recognition is not supported in your browser. Please try Chrome.');
                return;
            }
            
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.elements.voiceInputBtn.style.backgroundColor = '#ff4444';
                this.elements.voiceInputBtn.style.transform = 'scale(1.1)';
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.elements.messageInput.value = transcript;
                this.updateSendButton();
            };
            
            this.recognition.onend = () => {
                this.elements.voiceInputBtn.style.backgroundColor = '';
                this.elements.voiceInputBtn.style.transform = '';
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.elements.voiceInputBtn.style.backgroundColor = '';
                this.elements.voiceInputBtn.style.transform = '';
                alert('Voice recognition error. Please try again.');
            };
            
            this.recognition.start();
        }

        getSessionId() {
            let sessionId = sessionStorage.getItem('chatSessionId');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('chatSessionId', sessionId);
            }
            return sessionId;
        }

        loadChatHistory() {
            try {
                const saved = localStorage.getItem('chatHistory');
                if (saved) {
                    this.chatHistory = JSON.parse(saved);
                    // Keep only last 30 days
                    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                    this.chatHistory = this.chatHistory.filter(chat => chat.timestamp > thirtyDaysAgo);
                    this.saveChatHistory();
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
                this.chatHistory = [];
            }
        }

        saveChatHistory() {
            try {
                localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
            } catch (error) {
                console.error('Error saving chat history:', error);
            }
        }

        saveCurrentChat() {
            if (this.messages.length > 0) {
                const existingIndex = this.chatHistory.findIndex(chat => 
                    chat.messages.length === this.messages.length &&
                    chat.messages[0]?.text === this.messages[0]?.text
                );
                
                if (existingIndex === -1) {
                    this.chatHistory.unshift({
                        timestamp: Date.now(),
                        messages: [...this.messages]
                    });
                    
                    // Keep only last 50 conversations
                    if (this.chatHistory.length > 50) {
                        this.chatHistory = this.chatHistory.slice(0, 50);
                    }
                    
                    this.saveChatHistory();
                }
            }
        }
    }

    // Initialize the chat widget when DOM is ready
    function initializeChatWidget() {
        // Check if widget already exists
        if (document.getElementById('ai-chat-widget')) {
            console.log('Chat widget already exists');
            return;
        }

        // Create new chat widget instance
        window.aiChatWidget = new ChatWidget();
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChatWidget);
    } else {
        initializeChatWidget();
    }

    // Export for manual initialization if needed
    window.initAIChatWidget = initializeChatWidget;
    window.ChatWidget = ChatWidget;
})();
