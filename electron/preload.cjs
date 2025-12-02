const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startScreenshot: () => ipcRenderer.invoke('start-screenshot'),
    completeScreenshot: (base64Image) => ipcRenderer.send('complete-screenshot', base64Image),
    cancelScreenshot: () => ipcRenderer.send('cancel-screenshot'),
    screenshotOverlayReady: () => ipcRenderer.send('screenshot-overlay-ready'),
    onScreenshotTaken: (callback) => {
        const subscription = (_, image) => callback(image);
        ipcRenderer.on('screenshot-taken', subscription);
        return () => ipcRenderer.removeListener('screenshot-taken', subscription);
    },
    onScreenshotCaptured: (callback) => {
        const subscription = (_, image) => callback(image);
        ipcRenderer.on('screenshot-captured', subscription);
        return () => ipcRenderer.removeListener('screenshot-captured', subscription);
    },
});
