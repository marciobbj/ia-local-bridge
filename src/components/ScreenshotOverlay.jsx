import React, { useState, useRef, useEffect } from 'react';

const ScreenshotOverlay = () => {
    const [startPos, setStartPos] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        // Listen for the screenshot image from the main process
        window.electronAPI.onScreenshotTaken((base64Image) => {
            setImageSrc(base64Image);
        });

        // Notify main process that overlay is ready
        window.electronAPI.screenshotOverlayReady();

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                window.electronAPI.cancelScreenshot();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleMouseDown = (e) => {
        setStartPos({ x: e.clientX, y: e.clientY });
        setCurrentPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (startPos) {
            setCurrentPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = async () => {
        if (!startPos || !currentPos || !imageSrc) return;

        const x = Math.min(startPos.x, currentPos.x);
        const y = Math.min(startPos.y, currentPos.y);
        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);

        if (width < 5 || height < 5) {
            setStartPos(null);
            setCurrentPos(null);
            return; // Ignore tiny selections
        }

        // Crop the image
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Adjust for device pixel ratio if needed, but usually electron captures at 1x or handles it
            // For simplicity, assuming 1:1 mapping for now or that the captured image matches window size
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

            const croppedBase64 = canvas.toDataURL('image/png');
            window.electronAPI.completeScreenshot(croppedBase64);
        };
        img.src = imageSrc;

        setStartPos(null);
        setCurrentPos(null);
    };

    if (!imageSrc) return null;

    return (
        <div
            className="fixed inset-0 cursor-crosshair select-none z-50"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top left'
            }}
        >
            {/* Dimmed overlay */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />

            {/* Selection Box */}
            {startPos && currentPos && (
                <div
                    className="absolute border-2 border-blue-500 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                    style={{
                        left: Math.min(startPos.x, currentPos.x),
                        top: Math.min(startPos.y, currentPos.y),
                        width: Math.abs(currentPos.x - startPos.x),
                        height: Math.abs(currentPos.y - startPos.y),
                    }}
                />
            )}
        </div>
    );
};

export default ScreenshotOverlay;
