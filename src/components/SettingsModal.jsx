import React, { useState } from 'react';
import { X, Save, Download } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

const SettingsModal = ({ onClose }) => {
    const { settings, updateSettings, exportAllSessions } = useChatStore();
    const [formData, setFormData] = useState({ ...settings });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        updateSettings(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Provider</label>
                        <select
                            name="provider"
                            value={formData.provider}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="openrouter">OpenRouter</option>
                            <option value="openai">OpenAI</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="deepseek">DeepSeek</option>
                            <option value="qwen">Qwen (Alibaba Cloud)</option>
                            <option value="local">Local AI (Ollama/LM Studio)</option>
                        </select>
                    </div>

                    {formData.provider === 'openrouter' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">OpenRouter API Key</label>
                            <input
                                type="password"
                                name="openRouterKey"
                                value={formData.openRouterKey}
                                onChange={handleChange}
                                placeholder="sk-or-..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {formData.provider === 'openai' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">OpenAI API Key</label>
                            <input
                                type="password"
                                name="openaiKey"
                                value={formData.openaiKey}
                                onChange={handleChange}
                                placeholder="sk-..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {formData.provider === 'gemini' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Gemini API Key</label>
                            <input
                                type="password"
                                name="geminiKey"
                                value={formData.geminiKey}
                                onChange={handleChange}
                                placeholder="AIza..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {formData.provider === 'deepseek' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">DeepSeek API Key</label>
                            <input
                                type="password"
                                name="deepseekKey"
                                value={formData.deepseekKey}
                                onChange={handleChange}
                                placeholder="sk-..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {formData.provider === 'qwen' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Qwen (DashScope) API Key</label>
                            <input
                                type="password"
                                name="qwenKey"
                                value={formData.qwenKey}
                                onChange={handleChange}
                                placeholder="sk-..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {formData.provider === 'local' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Local API URL</label>
                            <input
                                type="text"
                                name="localUrl"
                                value={formData.localUrl}
                                onChange={handleChange}
                                placeholder="http://localhost:11434/v1"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Model ID</label>
                            <input
                                type="text"
                                name="selectedModel"
                                value={formData.selectedModel}
                                onChange={handleChange}
                                placeholder="e.g. openai/gpt-3.5-turbo or llama2"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.provider === 'openrouter' && "Use 'provider/model-name' (e.g. anthropic/claude-3-opus)."}
                                {formData.provider === 'local' && "Use the model name (e.g. llama3)."}
                                {formData.provider === 'openai' && "Use the model name (e.g. gpt-4o)."}
                                {formData.provider === 'gemini' && "Use the model name (e.g. gemini-1.5-pro)."}
                                {formData.provider === 'deepseek' && "Use 'deepseek-chat' or 'deepseek-coder'."}
                                {formData.provider === 'qwen' && "Use the model name (e.g. qwen-turbo)."}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                            <h3 className="text-gray-400 font-medium mb-2">Data Management</h3>
                            <button
                                onClick={exportAllSessions}
                                className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 p-2 rounded-lg transition-colors text-sm mb-4"
                            >
                                <Download size={16} />
                                Export All Chats (JSON)
                            </button>

                            <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to clear all chat history and settings? This cannot be undone.')) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 p-2 rounded-lg transition-colors text-sm"
                            >
                                Reset Application Data
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-800 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Save size={18} />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
