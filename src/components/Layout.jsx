import React from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { useChatStore } from '../store/useChatStore';
import { Menu } from 'lucide-react';

const Layout = () => {
    const { sidebarOpen, toggleSidebar } = useChatStore();

    return (
        <div className="flex h-full bg-gray-900 text-white">
            {/* Mobile Sidebar Overlay */}
            {!sidebarOpen && (
                <button
                    onClick={toggleSidebar}
                    className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 shadow-lg"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-800 bg-gray-950 flex-shrink-0`}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative">
                {sidebarOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="absolute top-4 left-4 z-10 p-1 text-gray-400 hover:text-white md:hidden"
                    >
                        <Menu size={20} />
                    </button>
                )}
                <ChatArea />
            </div>
        </div>
    );
};

export default Layout;
