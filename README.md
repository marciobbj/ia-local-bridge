# IA Local Bridge 🌉

A powerful, privacy-focused desktop AI client built with Electron and React. Connect to your favorite AI models—whether cloud-based or running locally—in a beautiful, minimalist interface.

![IA Local Bridge Screenshot](https://placehold.co/800x500/1f2937/ffffff?text=IA+Local+Bridge+Preview)

## ✨ Features

- **🤖 Multi-Provider Support**: Seamlessly switch between:
  - **OpenAI**: Access GPT-4, GPT-3.5, etc.
  - **OpenRouter**: Access Claude, Llama 3, Mistral, and more.
  - **Google Gemini**: Access Gemini 1.5 Pro/Flash.
  - **DeepSeek**: Access DeepSeek Coder and Chat models.
  - **Qwen**: Access Alibaba's Qwen models via DashScope.
  - **Local AI**: Connect to Ollama, LM Studio, or LocalAI running on your machine.
- **🔒 Privacy First**: Your API keys and chat history are stored **locally** on your device using `localStorage`. No data is sent to our servers.
- **💬 Rich Chat Experience**:
  - Full Markdown support with **Syntax Highlighting** for code blocks.
  - GitHub Flavored Markdown (tables, task lists, strikethrough).
  - Streaming responses for real-time interaction.
- **📁 Media & Attachments**:
  - **File Uploads**: Analyze documents and images (with compatible models).
  - **Screenshots**: Capture and attach screenshots directly within the app.
  - **Audio Recording**: Record voice notes or prompts.
- **🗄️ Chat Management**:
  - Organize conversations with a history sidebar.
  - **Archive** old chats to keep your workspace clean.
  - **Export** chats to Markdown (`.md`), Text (`.txt`), or JSON.
  - **Bulk Export** all your data for backup.

## 🛠️ Tech Stack

- **Electron**: For cross-platform desktop integration.
- **React**: For a dynamic and responsive UI.
- **Vite**: For lightning-fast development and building.
- **Tailwind CSS**: For modern, minimalist styling.
- **Zustand**: For simple and effective state management.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/ia-local-bridge.git
    cd ia-local-bridge
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

Run the app in development mode (with hot-reload):

```bash
npm run dev
```

> **Note**: This launches both the React dev server and the Electron main process.

### Build

Create a production-ready executable for your OS:

```bash
npm run build
```

The output will be in the `dist` directory.

## ⚙️ Configuration

1.  Click the **Settings** icon in the sidebar.
2.  Choose your **Provider** (OpenRouter, OpenAI, Gemini, DeepSeek, Qwen, or Local).
3.  Enter your **API Key** (stored locally).
4.  Set the **Model ID** (e.g., `gemini-1.5-pro`, `deepseek-chat`, `qwen-turbo`).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
