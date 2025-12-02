import OpenAI from 'openai';

export const createChatCompletion = async (messages, settings) => {
    let baseURL = 'https://openrouter.ai/api/v1';
    let apiKey = settings.openRouterKey;
    let model = settings.selectedModel;

    if (settings.provider === 'openai') {
        baseURL = 'https://api.openai.com/v1';
        apiKey = settings.openaiKey;
    } else if (settings.provider === 'local') {
        baseURL = settings.localUrl;
        apiKey = 'not-needed';
    } else if (settings.provider === 'gemini') {
        baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
        apiKey = settings.geminiKey;
    } else if (settings.provider === 'deepseek') {
        baseURL = 'https://api.deepseek.com';
        apiKey = settings.deepseekKey;
    } else if (settings.provider === 'qwen') {
        baseURL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
        apiKey = settings.qwenKey;
    }

    if (!apiKey && settings.provider !== 'local') {
        throw new Error('API Key is missing');
    }

    const openai = new OpenAI({
        baseURL,
        apiKey,
        dangerouslyAllowBrowser: true, // Needed for client-side usage
        defaultHeaders: settings.provider === 'openrouter' ? {
            'HTTP-Referer': 'http://localhost:5173', // TODO: Update for production
            'X-Title': 'Local AI Client',
        } : {},
    });

    // Filter messages to remove attachments from content if model doesn't support them
    // For now, we assume text-only or standard multimodal format
    // We need to format messages correctly for OpenAI SDK
    const formattedMessages = messages.map(msg => {
        if (msg.attachments && msg.attachments.length > 0) {
            const content = [
                { type: 'text', text: msg.content || '' },
                ...msg.attachments
                    .filter(att => att.type.startsWith('image/'))
                    .map(att => ({
                        type: 'image_url',
                        image_url: {
                            url: att.content, // Base64
                        },
                    }))
            ];
            return { role: msg.role, content };
        }
        return { role: msg.role, content: msg.content };
    });

    const stream = await openai.chat.completions.create({
        model,
        messages: formattedMessages,
        stream: true,
    });

    return stream;
};
