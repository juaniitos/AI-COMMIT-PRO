# 📝 Changelog

All notable changes to the "AI Commit Pro" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2025-12-22

### 🎉 Initial Release

#### ✨ Added
- **AI-Powered Commit Generation**: Integration with Claude AI (Anthropic)
- **Conventional Commits Support**: Automatic formatting following industry standards
- **Interactive Preview Panel**: Beautiful WebView UI to preview and edit messages
- **Multi-Language Support**: Generate messages in English or Spanish
- **Context-Aware Analysis**: Uses recent commit history for consistent style
- **Multi-Repository Support**: Handles workspaces with multiple Git repos
- **Keyboard Shortcut**: Quick access via `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac)
- **Auto-Copy to Clipboard**: Generated messages automatically copied
- **Smart Error Handling**: Specific error messages for different scenarios
- **Git Panel Integration**: One-click button in VS Code's Git panel
- **Configurable Settings**: API Key, Model selection, Language, Preview mode, etc.

#### 🎨 UI Features
- Real-time character count with visual warnings
- File list display in preview panel
- VS Code theme integration
- Progress indicators with stage-by-stage updates
- Keyboard shortcuts in preview (Ctrl+Enter, Esc)

#### 🛡️ Error Handling
- API authentication errors (401)
- Rate limit detection (429)
- Network connectivity issues
- Git repository validation
- Permission checks
- Missing staged changes detection

#### 📚 Documentation
- Comprehensive README with examples
- Technical documentation for developers
- User guide with step-by-step instructions
- Testing checklist

#### 🧪 Testing
- Unit tests for configuration management
- GitService integration tests
- AIService error handling tests
- Command registration verification

### 🔧 Technical Details
- Built with TypeScript
- Uses Anthropic Claude API (@anthropic-ai/sdk)
- Git operations via simple-git
- Bundled with esbuild
- VS Code Extension API v1.85.0+

### 📦 Dependencies
- `@anthropic-ai/sdk`: ^0.32.1
- `simple-git`: ^3.27.0

---

**[0.0.1]**: 2025-12-22