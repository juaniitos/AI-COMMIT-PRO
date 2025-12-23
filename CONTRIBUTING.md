# 🚀 Contributing to AI Commit Pro

First off, thank you for considering contributing to AI Commit Pro! It's people like you that make it a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to juan@jdsolutionsinc.com.

### Our Standards

- ✅ Be respectful and inclusive
- ✅ Welcome newcomers
- ✅ Focus on what is best for the community
- ✅ Show empathy towards others
- ❌ No trolling, insulting, or derogatory comments
- ❌ No harassment or discriminatory language

---

## 🤝 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check existing issues. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce**
- **Provide specific examples**
- **Describe the behavior you observed and expected**
- **Include screenshots if relevant**
- **Include your environment details:**
  - OS (Windows/Mac/Linux)
  - VS Code version
  - Extension version
  - Node.js version

**Bug Report Template:**
```markdown
**Description**
A clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- VS Code: [e.g., 1.85.0]
- Extension: [e.g., 0.0.1]
```

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other tools**

### Pull Requests 🎯

- Fill in the required template
- Follow the coding standards
- Include appropriate tests
- Update documentation as needed
- End all files with a newline

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- VS Code 1.85.0 or higher
- Git

### Setup Steps

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR-USERNAME/ai-commit-pro.git
   cd ai-commit-pro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Open in VS Code**
   ```bash
   code .
   ```

4. **Get Anthropic API Key**
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Create an API key
   - Add to VS Code settings: `aiCommitPro.apiKey`

5. **Run Extension**
   - Press `F5` to open Extension Development Host
   - Test your changes

### Project Structure

```
ai-commit-pro/
├── src/
│   ├── extension.ts      # Main entry point
│   ├── anthropic.ts      # AI service
│   ├── git.ts           # Git operations
│   ├── config.ts        # Configuration
│   ├── types.ts         # TypeScript types
│   ├── webview.ts       # Preview panel
│   └── test/
│       └── extension.test.ts
├── documentation/
│   ├── technical_documentation.md
│   └── USER_GUIDE.md
├── package.json         # Extension manifest
├── tsconfig.json       # TypeScript config
└── esbuild.js         # Build configuration
```

### Available Scripts

```bash
npm run compile        # Compile TypeScript
npm run watch         # Watch mode for development
npm run test          # Run tests
npm run lint          # Run ESLint
npm run package       # Package for production
```

---

## 🔄 Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update tests

3. **Commit Your Changes**
   ```bash
   git add .
   # Use the extension itself to generate the commit message! 😉
   # Or follow Conventional Commits manually:
   git commit -m "feat: add amazing feature"
   ```

4. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Fill in the template
   - Link any related issues

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Commits follow Conventional Commits

---

## 📐 Coding Standards

### TypeScript Style

```typescript
// ✅ Good
export async function generateCommit(diff: GitDiff): Promise<string> {
  const result = await aiService.generate(diff);
  return result.message;
}

// ❌ Bad
export async function generateCommit(diff: any): Promise<any> {
  let result = await aiService.generate(diff);
  return result.message;
}
```

### Naming Conventions

- **Classes**: PascalCase (`GitService`, `AIService`)
- **Functions**: camelCase (`generateCommit`, `getStagedDiff`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TOKENS`, `API_VERSION`)
- **Private members**: prefix with underscore (`_panel`, `_disposables`)

### Code Organization

- One class/interface per file when possible
- Group related functions together
- Export public API at the top
- Keep functions small and focused (max 50 lines)
- Use async/await instead of promises

### Comments

```typescript
// ✅ Good - Explains WHY
// Truncate diff to prevent token limit exceeded errors
const truncatedDiff = diff.substring(0, MAX_LENGTH);

// ❌ Bad - Explains WHAT (obvious from code)
// Substring the diff
const truncatedDiff = diff.substring(0, MAX_LENGTH);
```

### Error Handling

```typescript
// ✅ Good - Specific error messages
try {
  await apiCall();
} catch (error: any) {
  if (error.status === 401) {
    throw new Error('❌ Invalid API key. Check settings.');
  } else if (error.status === 429) {
    throw new Error('⏱️ Rate limit exceeded. Wait a moment.');
  }
  throw error;
}

// ❌ Bad - Generic errors
try {
  await apiCall();
} catch (error) {
  throw new Error('Error');
}
```

---

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Configuration"

# Run with coverage
npm test -- --coverage
```

### Writing Tests

```typescript
suite('MyFeature Tests', () => {
  test('should do something specific', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await myFunction(input);
    
    // Assert
    assert.strictEqual(result, 'expected');
  });
});
```

### Test Coverage Goals

- Aim for >80% code coverage
- All public APIs must have tests
- Edge cases must be tested
- Error paths must be tested

---

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(webview): add character count indicator
fix(git): handle repositories without commits
docs(readme): update installation instructions
test(config): add tests for getConfig function
```

---

## 🎨 UI/UX Guidelines

- Follow VS Code's design language
- Use VS Code theme colors (variables)
- Provide keyboard shortcuts for common actions
- Show progress for long operations
- Use emojis sparingly and consistently
- Error messages should be actionable

---

## 📚 Documentation

- Update README.md for user-facing changes
- Update technical_documentation.md for architecture changes
- Add JSDoc comments for public APIs
- Include code examples in documentation

---

## 🔒 Security

- Never commit API keys or secrets
- Sanitize user input in webviews
- Use Content Security Policy for webviews
- Report security vulnerabilities privately to juan@jdsolutionsinc.com

---

## 📞 Questions?

- Open a [Discussion](https://github.com/yourusername/ai-commit-pro/discussions)
- Email: juan@jdsolutionsinc.com
- Join our community chat (coming soon)

---

## 🎉 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in commits

Thank you for contributing! 🙏
