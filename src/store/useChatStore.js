import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatStore = create(
    persist(
        (set) => ({
            messages: [],
            sessions: [],
            currentSessionId: null,
            input: '',
            isLoading: false,
            sidebarOpen: true,
            settings: {
                openRouterKey: '',
                localUrl: 'http://localhost:11434/v1',
                selectedModel: 'openai/gpt-3.5-turbo',
                provider: 'openrouter', // 'openrouter', 'local', 'openai', 'gemini', 'deepseek', 'qwen'
                openaiKey: '',
                geminiKey: '',
                deepseekKey: '',
                qwenKey: '',
            },

            setMessages: (messages) => set({ messages }),

            createNewChat: () => {
                const { messages, currentSessionId, sessions } = useChatStore.getState();

                // Save current session if it has messages and isn't already saved
                if (messages.length > 0) {
                    const existingSessionIndex = sessions.findIndex(s => s.id === currentSessionId);
                    const newSession = {
                        id: currentSessionId || Date.now().toString(),
                        title: messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : ''),
                        date: new Date().toISOString(),
                        messages: [...messages]
                    };

                    let updatedSessions;
                    if (existingSessionIndex >= 0) {
                        updatedSessions = [...sessions];
                        updatedSessions[existingSessionIndex] = newSession;
                    } else {
                        updatedSessions = [newSession, ...sessions];
                    }

                    set({ sessions: updatedSessions });
                }

                // Start new session
                set({
                    messages: [],
                    currentSessionId: Date.now().toString()
                });
            },

            loadSession: (sessionId) => {
                const { sessions, messages, currentSessionId } = useChatStore.getState();

                // Save current before switching
                if (messages.length > 0) {
                    // ... (logic to save current, similar to createNewChat but without clearing if just switching?
                    // Actually createNewChat logic handles "archiving" the current one.
                    // Let's extract save logic or just do it here.)
                    const existingSessionIndex = sessions.findIndex(s => s.id === currentSessionId);
                    const sessionToSave = {
                        id: currentSessionId || Date.now().toString(),
                        title: messages[0].content.slice(0, 30) + '...',
                        date: new Date().toISOString(),
                        messages: [...messages]
                    };

                    // We need to update the sessions state with this saved session BEFORE loading the new one
                    // But we can just update the sessions array locally and then set it.
                    // However, to avoid complexity, let's assume the user wants to switch.
                    // We should probably auto-save the current session whenever it changes, or at least when switching.
                }

                const session = sessions.find(s => s.id === sessionId);
                if (session) {
                    set({
                        messages: session.messages,
                        currentSessionId: sessionId
                    });
                }
            },

            deleteSession: (sessionId) => set((state) => ({
                sessions: state.sessions.filter(s => s.id !== sessionId),
                messages: state.currentSessionId === sessionId ? [] : state.messages,
                currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
            })),

            archiveSession: (sessionId) => set((state) => ({
                sessions: state.sessions.map(s => s.id === sessionId ? { ...s, archived: true } : s)
            })),

            unarchiveSession: (sessionId) => set((state) => ({
                sessions: state.sessions.map(s => s.id === sessionId ? { ...s, archived: false } : s)
            })),

            exportSession: (sessionId, format = 'md') => {
                const { sessions } = useChatStore.getState();
                const session = sessions.find(s => s.id === sessionId);
                if (!session) return;

                let content = '';
                if (format === 'md') {
                    content = `# ${session.title}\n\n`;
                    session.messages.forEach(msg => {
                        content += `### ${msg.role.toUpperCase()}\n\n${msg.content}\n\n`;
                    });
                } else {
                    content = `Chat: ${session.title}\n\n`;
                    session.messages.forEach(msg => {
                        content += `${msg.role.toUpperCase()}:\n${msg.content}\n\n----------------\n\n`;
                    });
                }

                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
                a.click();
                URL.revokeObjectURL(url);
            },

            exportAllSessions: () => {
                const { sessions } = useChatStore.getState();
                const data = JSON.stringify(sessions, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `all_chats_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            },

            addMessage: (message) => set((state) => {
                const newMessages = [...state.messages, message];
                const { sessions, currentSessionId } = state;

                let updatedSessions = [...sessions];
                let activeSessionId = currentSessionId;

                if (!activeSessionId) {
                    activeSessionId = Date.now().toString();
                }

                const existingSessionIndex = updatedSessions.findIndex(s => s.id === activeSessionId);

                if (existingSessionIndex >= 0) {
                    updatedSessions[existingSessionIndex] = {
                        ...updatedSessions[existingSessionIndex],
                        messages: newMessages,
                        title: updatedSessions[existingSessionIndex].title || message.content.slice(0, 30)
                    };
                } else {
                    updatedSessions.unshift({
                        id: activeSessionId,
                        title: message.content.slice(0, 30),
                        date: new Date().toISOString(),
                        messages: newMessages
                    });
                }

                return {
                    messages: newMessages,
                    sessions: updatedSessions,
                    currentSessionId: activeSessionId
                };
            }),

            updateMessage: (id, content) => set((state) => {
                const newMessages = state.messages.map((msg) =>
                    msg.id === id ? { ...msg, content } : msg
                );

                // Update session with new messages to ensure persistence
                const { sessions, currentSessionId } = state;
                const updatedSessions = sessions.map(s =>
                    s.id === currentSessionId
                        ? { ...s, messages: newMessages }
                        : s
                );

                return { messages: newMessages, sessions: updatedSessions };
            }),
            setInput: (input) => set({ input }),
            setIsLoading: (isLoading) => set({ isLoading }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),
            clearChat: () => {
                // Instead of just clearing, we create a new chat
                useChatStore.getState().createNewChat();
            },
            sendMessage: async (content, attachments) => {
                const { messages, settings, addMessage, updateMessage, setIsLoading } = useChatStore.getState();

                const userMessage = {
                    id: Date.now(),
                    role: 'user',
                    content,
                    attachments,
                };

                addMessage(userMessage);
                setIsLoading(true);

                try {
                    // Create a placeholder for the assistant response
                    const assistantMessageId = Date.now() + 1;
                    addMessage({
                        id: assistantMessageId,
                        role: 'assistant',
                        content: '',
                    });

                    const { createChatCompletion } = await import('../services/aiService');
                    const stream = await createChatCompletion([...messages, userMessage], settings);

                    let fullContent = '';

                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        fullContent += content;
                        updateMessage(assistantMessageId, fullContent);
                    }
                } catch (error) {
                    console.error('AI Error:', error);
                    addMessage({
                        id: Date.now() + 2,
                        role: 'assistant',
                        content: `Error: ${error.message}. Please check your settings.`,
                    });
                } finally {
                    setIsLoading(false);
                }
            },
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({
                settings: state.settings,
                sessions: state.sessions,
                // We can persist current messages too, or just rely on loading the last session
                messages: state.messages,
                currentSessionId: state.currentSessionId
            }),
        }
    )
);
