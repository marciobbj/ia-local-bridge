import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image as ImageIcon, X } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

const InputArea = () => {
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState([]);
    const { sendMessage, isLoading } = useChatStore();
    const fileInputRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [audioPreview, setAudioPreview] = useState(null);

    useEffect(() => {
        if (window.electronAPI) {
            const cleanup = window.electronAPI.onScreenshotCaptured((base64Image) => {
                setAttachments(prev => [...prev, {
                    name: `screenshot-${Date.now()}.png`,
                    type: 'image/png',
                    content: base64Image
                }]);
            });
            return cleanup;
        }
    }, []);

    const handleScreenshot = async () => {
        if (window.electronAPI) {
            await window.electronAPI.startScreenshot();
        } else {
            console.warn("Electron API not available");
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    setAudioPreview(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Audio recording failed", err);
            }
        }
    };

    const confirmRecording = () => {
        if (!audioPreview) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachments(prev => [...prev, {
                name: `recording-${Date.now()}.webm`,
                type: 'audio/webm',
                content: reader.result
            }]);
            setAudioPreview(null);
        };
        reader.readAsDataURL(audioPreview);
    };

    const cancelRecording = () => {
        setAudioPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!text.trim() && attachments.length === 0) || isLoading) return;

        await sendMessage(text, attachments);
        setText('');
        setAttachments([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        // Process files (convert to base64 for images, etc.)
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAttachments(prev => [...prev, {
                    name: file.name,
                    type: file.type,
                    content: e.target.result // Base64
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            {attachments.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto p-2">
                    {attachments.map((att, idx) => (
                        <div key={idx} className="relative group">
                            <div className="w-16 h-16 bg-gray-800 rounded border border-gray-700 flex items-center justify-center overflow-hidden">
                                {att.type.startsWith('image/') ? (
                                    <img src={att.content} alt={att.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-400 p-1 truncate">{att.name}</span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeAttachment(idx)}
                                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="relative flex items-end gap-2 bg-gray-800 p-2 rounded-xl border border-gray-700 focus-within:border-blue-500 transition-colors">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Paperclip size={20} />
                </button>
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none py-2 max-h-32 min-h-[40px]"
                    rows={1}
                    style={{ height: 'auto', minHeight: '24px' }}
                />

                <button
                    type="button"
                    onClick={handleScreenshot}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Take Screenshot"
                >
                    <ImageIcon size={20} />
                </button>

                <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                    title="Record Audio"
                >
                    <Mic size={20} />
                </button>

                {audioPreview && (
                    <div className="absolute bottom-full left-0 mb-2 bg-gray-800 p-2 rounded-lg border border-gray-700 flex items-center gap-2 shadow-lg z-10">
                        <audio controls src={URL.createObjectURL(audioPreview)} className="h-8 w-48" />
                        <button
                            type="button"
                            onClick={confirmRecording}
                            className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                            title="Confirm Recording"
                        >
                            <Send size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={cancelRecording}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                            title="Discard Recording"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!text.trim() && attachments.length === 0}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={18} />
                </button>
            </div>
        </form>
    );
};

export default InputArea;
