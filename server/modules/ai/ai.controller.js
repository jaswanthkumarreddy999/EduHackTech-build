const axios = require('axios');

// Ollama configuration - Using 3B model for faster chat responses
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b'; // Match user's running model

// Test Ollama connection and warm it up
const testOllamaConnection = async () => {
    try {
        const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 });
        console.log(`✅ Ollama connected successfully at ${OLLAMA_BASE_URL}`);
        console.log(`📋 Available models:`, response.data.models?.map(m => m.name).join(', ') || 'None');

        // Warm-up prompt to avoid cold start
        console.log('🔥 Warming up Ollama...');
        await axios.post(
            `${OLLAMA_BASE_URL}/api/chat`,
            {
                model: OLLAMA_MODEL,
                messages: [{ role: 'user', content: 'Hello' }],
                stream: false,
                options: { temperature: 0.1, num_predict: 10 }
            },
            { timeout: 10000 }
        );
        console.log('✅ Ollama warmed up and ready!');
        return true;
    } catch (error) {
        console.warn(`⚠️  Ollama not reachable at ${OLLAMA_BASE_URL}. Chat features may not work.`);
        console.warn(`   Make sure Ollama is running: ollama run ${OLLAMA_MODEL}`);
        return false;
    }
};

testOllamaConnection();

exports.chatWithPet = async (req, res) => {
    try {
        const { message, history } = req.body;
        const user = req.user; // From auth middleware

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Woof! You didn't say anything!"
            });
        }

        const userInterests = user.interests ? user.interests.join(", ") : "general tech";
        const userName = user.name || "friend";

        // Construct the system prompt with brevity instruction
        const systemPrompt = `You are Sparky, a friendly Robot Pet Dog helping ${userName} with tech career growth on EduHackTech.

Interests: ${userInterests}

Rules:
- Answer briefly and concisely (under 300 characters)
- Be enthusiastic and supportive ("Woof!", "Paw-some!")
- Suggest platform courses/hackathons when relevant
- Be empathetic about burnout
- No fake links
- Use emojis sparingly`;

        // Format chat history for Ollama - KEEP ONLY LAST 5 MESSAGES for speed
        let messages = [];

        // Add system message
        messages.push({
            role: 'system',
            content: systemPrompt
        });

        // Add conversation history (ONLY last 5 messages for performance)
        if (history && Array.isArray(history)) {
            const recentHistory = history.slice(-5); // Reduced from 10 to 5
            recentHistory.forEach(msg => {
                if (msg.sender === 'user') {
                    messages.push({ role: 'user', content: msg.text });
                } else if (msg.sender === 'bot') {
                    messages.push({ role: 'assistant', content: msg.text });
                }
            });
        }

        // Add current user message
        messages.push({
            role: 'user',
            content: message
        });

        // Set up SSE for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Call Ollama API with STREAMING enabled
        const ollamaResponse = await axios.post(
            `${OLLAMA_BASE_URL}/api/chat`,
            {
                model: OLLAMA_MODEL,
                messages: messages,
                stream: true, // STREAMING ENABLED
                options: {
                    temperature: 0.1, // Lower temperature for faster, more deterministic responses
                    num_predict: 200, // Reduced from 300 for brevity
                }
            },
            {
                timeout: 60000, // Increased timeout for streaming
                responseType: 'stream',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        let fullResponse = '';

        // Stream tokens to client
        ollamaResponse.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.message?.content) {
                        const token = parsed.message.content;
                        fullResponse += token;

                        // Send token to client
                        res.write(`data: ${JSON.stringify({ token, done: false })}\n\n`);
                    }

                    if (parsed.done) {
                        // Send completion signal
                        res.write(`data: ${JSON.stringify({ token: '', done: true, fullResponse })}\n\n`);
                        res.end();
                    }
                } catch (e) {
                    // Skip invalid JSON lines
                }
            }
        });

        ollamaResponse.data.on('error', (error) => {
            console.error('Stream error:', error);
            res.write(`data: ${JSON.stringify({ error: 'Stream error', done: true })}\n\n`);
            res.end();
        });

    } catch (error) {
        console.error("Ollama Chat Error:", error.message);

        // Handle specific error cases
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: "Woof... I can't reach my brain! 🦴 Make sure Ollama is running locally.",
                error: "Ollama server not reachable"
            });
        }

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                message: "Woof... my brain is taking too long to respond! Try again? 🐕",
                error: "Request timeout"
            });
        }

        res.status(500).json({
            success: false,
            message: "Woof... something went wrong in my circuits! 🔧",
            error: error.message
        });
    }
};
