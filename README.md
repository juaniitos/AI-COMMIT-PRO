# 🚀 AI Commit Pro

**Generate perfect Git commit messages with AI in one click!**

AI Commit Pro uses Claude AI (Anthropic) to analyze your staged changes and automatically generate clear, professional commit messages following the Conventional Commits format.

![AI Commit Pro](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)
![Claude AI](https://img.shields.io/badge/Powered%20by-Claude%20AI-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🤖 AI-Powered Commit Messages
- **Claude AI Integration**: Uses Claude 3.5 Haiku/Sonnet for intelligent analysis
- **Conventional Commits**: Follows industry-standard format (`feat:`, `fix:`, `docs:`, etc.)
- **Context-Aware**: Analyzes your recent commits to maintain consistent style
- **Multi-Language**: Supports English and Spanish commit messages

### 🎨 Beautiful UI
- **Preview Panel**: Edit generated messages before committing
- **Real-time Character Count**: Visual feedback for message length
- **File List Display**: See all modified files at a glance
- **VS Code Theme Integration**: Seamlessly matches your editor theme

### ⚡ Productivity Boosters
- **Keyboard Shortcut**: `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac)
- **Auto-Copy to Clipboard**: Generated message copied automatically
- **One-Click Integration**: Button in Git panel for quick access
- **Multi-Repo Support**: Works with workspaces containing multiple repositories

### 🛡️ Smart Error Handling
- Specific error messages for API issues (rate limits, auth, network)
- Git validation (repository detection, permissions)
- Retry functionality built-in

---

## 📦 Installation

### From VS Code Marketplace (Coming Soon)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "AI Commit Pro"
4. Click **Install**

### From Source
1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press `F5` to open Extension Development Host

---

## 🔧 Setup

### 1. Get Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key

### 2. Configure the Extension

1. Open VS Code Settings (`Ctrl+,`)
2. Search for "AI Commit Pro"
3. Paste your API key in **`aiCommitPro.apiKey`**

**Or use Command Palette:**
- Press `Ctrl+Shift+P`
- Type "Preferences: Open Settings (UI)"
- Search "AI Commit Pro"

---

## 🎯 Usage

### Method 1: Keyboard Shortcut (Recommended)
1. Stage your changes (`git add`)
2. Press **`Ctrl+Shift+C`** (Windows/Linux) or **`Cmd+Shift+C`** (Mac)
3. Wait for AI to generate the message
4. Edit if needed in the preview panel
5. Click **"Use This Message"**
6. Commit! 🎉

### Method 2: Command Palette
1. Stage your changes
2. Press `Ctrl+Shift+P`
3. Type "AI Commit: Generate Commit Message"
4. Press Enter

### Method 3: Git Panel Button
1. Stage your changes
2. Look for the ✨ sparkle icon in the Git panel toolbar
3. Click it

---

## ⚙️ Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `apiKey` | Your Anthropic API key | `""` |
| `model` | Claude model to use | `claude-3-5-haiku-20241022` |
| `language` | Language for messages | `spanish` |
| `showPreview` | Show preview panel before inserting | `true` |
| `maxRecentCommits` | Number of recent commits for context | `5` |
| `autoCopyToClipboard` | Auto-copy message to clipboard | `true` |

### Model Comparison

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| **Haiku** ⚡ | Fastest | $1/1M tokens | Daily use (recommended) |
| **Sonnet** 🎯 | Fast | $3/1M tokens | Complex commits |
| **Opus** 🧠 | Slower | $15/1M tokens | Critical commits |

---

## 💡 Examples

### Before (Your Diff)
```diff
+ function calculateTotal(items: Item[]): number {
+   return items.reduce((sum, item) => sum + item.price, 0);
+ }
```

### After (Generated Commit)
```
feat(utils): add calculateTotal function for item pricing

Implement reduce-based total calculation for shopping cart items
```

---

## 🎨 Preview Panel

The interactive preview panel allows you to:
- ✏️ **Edit** the generated message
- 📋 **Copy** to clipboard
- ✅ **Accept** or ❌ **Cancel**
- 📊 **See character count** with visual warnings
- 📂 **View all modified files**

**Keyboard Shortcuts in Preview:**
- `Ctrl/Cmd+Enter`: Accept message
- `Escape`: Cancel

---

## 🔍 How It Works

```
1. You stage changes (git add)
         ↓
2. Press Ctrl+Shift+C
         ↓
3. Extension reads git diff
         ↓
4. Sends to Claude AI with context
         ↓
5. AI generates commit message
         ↓
6. Preview panel opens (optional)
         ↓
7. Message inserted into Git
```

---

## 🚨 Troubleshooting

### "No staged changes"
**Solution**: Stage your files first with `git add .` or use the Git panel

### "API key not configured"
**Solution**: Add your Anthropic API key in Settings → AI Commit Pro → API Key

### "Rate limit exceeded"
**Solution**: Wait a few minutes. Free tier has limits. Consider upgrading your Anthropic plan.

### "No repository detected"
**Solution**: Make sure you're in a Git repository. Run `git init` if needed.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Anthropic** for the amazing Claude AI API
- **VS Code Team** for the excellent extension API
- **Conventional Commits** for the commit message standard

---

## 📞 Support

- 🐛 [Report Bug](https://github.com/yourusername/ai-commit-pro/issues)
- 💡 [Request Feature](https://github.com/yourusername/ai-commit-pro/issues)
- 📧 Email: juan@jdsolutionsinc.com

---

## 🌟 Show Your Support

If you find this extension helpful, please:
- ⭐ Star the repository
- 📢 Share with your team
- 🎉 Leave a review on the VS Code Marketplace

---

**Made with ❤️ by Juan Solórzano | JD Solutions Inc.**

*Powered by Claude AI 🤖*

