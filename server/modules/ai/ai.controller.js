const axios = require('axios');

// =========================
// OLLAMA CONFIGURATION
// =========================
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// ✅ FIXED: must match installed model
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder';

// =========================
// TEST + WARMUP OLLAMA
// =========================
const testOllamaConnection = async () => {
    try {
        const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 });

        console.log(`✅ Ollama connected successfully at ${OLLAMA_BASE_URL}`);
        console.log(
            `📋 Available models:`,
            response.data.models?.map(m => m.name).join(', ') || 'None'
        );

        console.log('🔥 Warming up Ollama...');
        await axios.post(
            `${OLLAMA_BASE_URL}/api/chat`,
            {
                model: OLLAMA_MODEL,
                messages: [{ role: 'user', content: 'Hello' }],
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 10
                }
            },
            { timeout: 10000 }
        );

        console.log('✅ Ollama warmed up and ready!');
        return true;

    } catch (error) {
        console.warn('⚠️ Ollama warm-up failed');
        console.warn('Reason:', error.response?.data?.error || error.message);
        console.warn('Model tried:', OLLAMA_MODEL);
        return false;
    }
};

// Run once on server start
testOllamaConnection();

// =========================
// CHAT CONTROLLER
// =========================
exports.chatWithPet = async (req, res) => {
    try {
        const { message, history } = req.body;
        const user = req.user || {};

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Woof! You didn't say anything! 🐾"
            });
        }

        const userInterests = user.interests ? user.interests.join(', ') : 'general tech';
        const userName = user.name || 'friend';

        // =========================
        // SYSTEM PROMPT
        // =========================
        const systemPrompt = `
You are Sparky, a friendly Robot Pet Dog helping ${userName} with tech career growth on EduHackTech.

Interests: ${userInterests}

Rules:
- Answer briefly and concisely (under 300 characters)
- Be enthusiastic and supportive ("Woof!", "Paw-some!")
- Suggest platform courses or hackathons when relevant
- Be empathetic about burnout
- No fake links
- Use emojis sparingly
        `.trim();

        // =========================
        // BUILD MESSAGE ARRAY
        // =========================
        const messages = [];

        messages.push({
            role: 'system',
            content: systemPrompt
        });

        // Keep only last 5 messages for speed
        if (Array.isArray(history)) {
            history.slice(-5).forEach(msg => {
                if (msg.sender === 'user') {
                    messages.push({ role: 'user', content: msg.text });
                } else if (msg.sender === 'bot') {
                    messages.push({ role: 'assistant', content: msg.text });
                }
            });
        }

        messages.push({
            role: 'user',
            content: message
        });

        // =========================
        // SSE HEADERS (IMPORTANT)
        // =========================
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        // =========================
        // CALL OLLAMA (STREAMING)
        // =========================
        const ollamaResponse = await axios.post(
            `${OLLAMA_BASE_URL}/api/chat`,
            {
                model: OLLAMA_MODEL,
                messages,
                stream: true,
                options: {
                    temperature: 0.1,
                    num_predict: 200
                }
            },
            {
                responseType: 'stream',
                timeout: 60000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        let fullResponse = '';

        // =========================
        // STREAM TOKENS
        // =========================
        ollamaResponse.data.on('data', chunk => {
            const lines = chunk
                .toString()
                .split('\n')
                .filter(line => line.trim());

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);

                    if (parsed.message?.content) {
                        const token = parsed.message.content;
                        fullResponse += token;

                        res.write(`data: ${JSON.stringify({ token, done: false })}\n\n`);
                    }

                    if (parsed.done) {
                        res.write(
                            `data: ${JSON.stringify({
                                token: '',
                                done: true,
                                fullResponse
                            })}\n\n`
                        );
                        res.end();
                    }

                } catch {
                    // Ignore malformed chunks
                }
            }
        });

        ollamaResponse.data.on('error', error => {
            console.error('Stream error:', error);
            res.write(`data: ${JSON.stringify({ error: 'Stream error', done: true })}\n\n`);
            res.end();
        });

    } catch (error) {
        console.error('Ollama Chat Error:', error.message);

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: "Woof... I can't reach my brain! 🦴 Make sure Ollama is running.",
                error: 'Ollama server not reachable'
            });
        }

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                message: "Woof... my brain is slow today 🐕 Try again!",
                error: 'Request timeout'
            });
        }

        res.status(500).json({
            success: false,
            message: "Woof... something went wrong in my circuits! 🔧",
            error: error.message
        });
    }
};
