import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check, ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);
    const [isThinkingOpen, setIsThinkingOpen] = useState(true);
    const [thinkingDuration, setThinkingDuration] = useState(null);

    const { content, thought, hasThought } = useMemo(() => {
        if (!message.content) return { content: '', thought: '', hasThought: false };

        const THOUGHT_PATTERNS = [
            { start: '<think>', end: '</think>', regex: /<think>([\s\S]*?)<\/think>/i, openRegex: /<think>([\s\S]*)$/i },
            { start: '[THINK]', end: '[/THINK]', regex:  /\[THINK\]([\s\S]*?)\[\/THINK\]/i, openRegex: /\[THINK\]([\s\S]*)$/i },
            { start: '<thought>', end: '</thought>', regex: /<thought>([\s\S]*?)<\/thought>/i, openRegex: /<thought>([\s\S]*)$/i },
            { start: '[THOUGHT]', end: '[/THOUGHT]', regex: /\[THOUGHT\]([\s\S]*?)\[\/THOUGHT\]/i, openRegex: /\[THOUGHT\]([\s\S]*)$/i }
        ];

        for (const pattern of THOUGHT_PATTERNS) {
            // Check for complete thought
            const match = message.content.match(pattern.regex);
            if (match) {
                return {
                    content: message.content.replace(pattern.regex, '').trim(),
                    thought: match[1].trim(),
                    hasThought: true
                };
            }

            // Check for unclosed thought (streaming)
            const openMatch = message.content.match(pattern.openRegex);
            if (openMatch) {
                return {
                    content: message.content.replace(pattern.openRegex, '').trim(),
                    thought: openMatch[1].trim(),
                    hasThought: true
                };
            }
        }

        return { content: message.content, thought: '', hasThought: false };
    }, [message.content]);

    // Calculate thinking duration (approximate based on message timestamp if available, or just length)
    // Since we don't have exact start/end times for the thought block from the API, 
    // we can't easily show "Thinking for X seconds" accurately without store changes.
    // However, the user asked for it. 
    // For now, let's just show "Thinking Process" and if we can, the duration.
    // If the message is done (not streaming), we could estimate. 
    // But let's stick to just showing the content first as per plan.
    // Wait, the user explicitly asked for "how long the model thought".
    // I'll add a simple timer that runs while the thought is streaming.

    useEffect(() => {
        if (message.thinkingDuration) {
            setThinkingDuration(message.thinkingDuration);
        } else if (message.thinkingStartTime && !message.thinkingDuration) {
            // Live timer
            const interval = setInterval(() => {
                setThinkingDuration((Date.now() - message.thinkingStartTime) / 1000);
            }, 100);
            return () => clearInterval(interval);
        }
    }, [message.thinkingDuration, message.thinkingStartTime]);

    const formatDuration = (seconds) => {
        if (!seconds) return '';
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        return `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(0)}s`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content); // Copy only the final answer
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={clsx(
            "flex gap-4 max-w-3xl mx-auto w-full",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isUser ? "bg-blue-600" : "bg-purple-600"
            )}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={clsx(
                "group relative px-4 py-3 rounded-2xl max-w-[85%]",
                isUser ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-800 text-gray-100 rounded-tl-none"
            )}>
                {!isUser && (
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                )}

                {hasThought && (
                    <div className="mb-4 border-b border-gray-700 pb-2">
                        <button
                            onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors w-full"
                        >
                            <Brain size={14} />
                            <span className="font-medium">Thinking Process {thinkingDuration && `(${formatDuration(thinkingDuration)})`}</span>
                            {isThinkingOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {isThinkingOpen && (
                            <div className="mt-2 pl-2 border-l-2 border-gray-700 text-gray-400 text-sm italic whitespace-pre-wrap">
                                {thought}
                            </div>
                        )}
                    </div>
                )}

                <div className="prose prose-invert prose-sm max-w-none break-words">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                    <div className="rounded-md overflow-hidden my-2 border border-gray-700">
                                        <div className="bg-gray-900 px-3 py-1 text-xs text-gray-400 border-b border-gray-700 flex justify-between items-center">
                                            <span>{match[1]}</span>
                                        </div>
                                        <SyntaxHighlighter
                                            {...props}
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{ margin: 0, borderRadius: 0, background: '#1e1e1e' }}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code {...props} className={clsx(className, "bg-gray-700/50 px-1 py-0.5 rounded text-sm")}>
                                        {children}
                                    </code>
                                )
                            },
                            table({ children }) {
                                return (
                                    <div className="overflow-x-auto my-4 border border-gray-700 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-700">
                                            {children}
                                        </table>
                                    </div>
                                )
                            },
                            thead({ children }) {
                                return <thead className="bg-gray-900">{children}</thead>
                            },
                            th({ children }) {
                                return <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{children}</th>
                            },
                            tbody({ children }) {
                                return <tbody className="bg-gray-800 divide-y divide-gray-700">{children}</tbody>
                            },
                            tr({ children }) {
                                return <tr className="hover:bg-gray-700/50 transition-colors">{children}</tr>
                            },
                            td({ children }) {
                                return <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">{children}</td>
                            }
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>

                {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {message.attachments.map((att, idx) => (
                            <div key={idx} className="bg-black/20 rounded p-2 text-xs flex items-center gap-2">
                                {att.type.startsWith('image/') ? (
                                    <img src={att.content} alt="attachment" className="w-16 h-16 object-cover rounded" />
                                ) : (
                                    <span>{att.name}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
