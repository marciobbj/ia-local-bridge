import React, { useState } from 'react';
import { Plus, Settings, MessageSquare, PanelLeftClose, X, Archive, Download, Trash2, FileText } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import SettingsModal from './SettingsModal';
import ContextMenu from './ContextMenu';

const Sidebar = () => {
    const { clearChat, toggleSidebar, sessions, loadSession, deleteSession, archiveSession, exportSession, currentSessionId, createNewChat } = useChatStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);

    const handleContextMenu = (e, sessionId) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            sessionId
        });
    };

    const closeContextMenu = () => setContextMenu(null);

    return (
        <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-400">
                    IA Local Bridge
                </h1>
                <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
                    <PanelLeftClose size={20} />
                </button>
            </div>

            <button
                onClick={createNewChat}
                className="flex items-center gap-2 w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors mb-4 text-sm font-medium"
            >
                <Plus size={18} />
                New Chat
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Recent
                </div>
                {sessions.length === 0 ? (
                    <div className="text-sm text-gray-500 italic px-2">No recent chats</div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`group flex items-center justify-between w-full p-2 rounded-md transition-colors ${currentSessionId === session.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                }`}
                            onContextMenu={(e) => handleContextMenu(e, session.id)}
                        >
                            <button
                                onClick={() => loadSession(session.id)}
                                className="flex items-center gap-3 flex-1 text-left text-sm truncate"
                            >
                                <MessageSquare size={16} />
                                <span className="truncate">{session.title || 'Untitled Chat'}</span>
                                {session.archived && <span className="text-xs bg-gray-700 px-1 rounded text-gray-400">Archived</span>}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSession(session.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-800">
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-gray-800 text-left text-sm text-gray-300 transition-colors"
                >
                    <Settings size={18} />
                    Settings
                </button>
            </div>

            {isSettingsOpen && (
                <SettingsModal onClose={() => setIsSettingsOpen(false)} />
            )}

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    options={[
                        {
                            label: 'Export to Markdown',
                            icon: <Download size={14} />,
                            onClick: () => exportSession(contextMenu.sessionId, 'md')
                        },
                        {
                            label: 'Export to Text',
                            icon: <FileText size={14} />,
                            onClick: () => exportSession(contextMenu.sessionId, 'txt')
                        },
                        {
                            label: 'Archive Chat',
                            icon: <Archive size={14} />,
                            onClick: () => archiveSession(contextMenu.sessionId)
                        },
                        {
                            label: 'Delete Chat',
                            icon: <Trash2 size={14} />,
                            danger: true,
                            onClick: () => deleteSession(contextMenu.sessionId)
                        }
                    ]}
                />
            )}
        </div>
    );
};

export default Sidebar;
