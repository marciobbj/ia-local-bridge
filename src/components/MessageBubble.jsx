import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
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
                        {message.content}
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
