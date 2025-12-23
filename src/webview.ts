import * as vscode from 'vscode';

export class CommitMessagePanel {
  public static currentPanel: CommitMessagePanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _onAccept: ((message: string) => void) | undefined;
  private _onReject: (() => void) | undefined;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;

    // Set webview options
    this._panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [extensionUri]
    };

    // Handle messages from webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'accept':
            if (this._onAccept) {
              this._onAccept(message.text);
            }
            this._panel.dispose();
            break;
          case 'reject':
            if (this._onReject) {
              this._onReject();
            }
            this._panel.dispose();
            break;
          case 'copy':
            vscode.env.clipboard.writeText(message.text);
            vscode.window.showInformationMessage('📋 Mensaje copiado al clipboard');
            break;
        }
      },
      null,
      this._disposables
    );

    // Clean up when panel is closed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public static show(
    extensionUri: vscode.Uri,
    message: string,
    files: string[],
    onAccept: (message: string) => void,
    onReject: () => void
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If panel already exists, reveal it
    if (CommitMessagePanel.currentPanel) {
      CommitMessagePanel.currentPanel._panel.reveal(column);
      CommitMessagePanel.currentPanel.update(message, files);
      return;
    }

    // Create new panel
    const panel = vscode.window.createWebviewPanel(
      'aiCommitPreview',
      '✨ AI Commit Message Preview',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    CommitMessagePanel.currentPanel = new CommitMessagePanel(panel, extensionUri);
    CommitMessagePanel.currentPanel._onAccept = onAccept;
    CommitMessagePanel.currentPanel._onReject = onReject;
    CommitMessagePanel.currentPanel.update(message, files);
  }

  private update(message: string, files: string[]) {
    this._panel.webview.html = this._getHtmlContent(message, files);
  }

  private _getHtmlContent(message: string, files: string[]): string {
    const fileCount = files.length;
    const fileList = files.slice(0, 10).map(f => `<li>${this._escapeHtml(f)}</li>`).join('');
    const moreFiles = fileCount > 10 ? `<li><em>... y ${fileCount - 10} archivos más</em></li>` : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Commit Message Preview</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: var(--vscode-font-family);
      padding: 20px;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .header h1 {
      font-size: 20px;
      font-weight: 600;
    }
    .badge {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    textarea {
      width: 100%;
      min-height: 120px;
      padding: 12px;
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      resize: vertical;
      line-height: 1.5;
    }
    textarea:focus {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }
    .file-list {
      background: var(--vscode-textBlockQuote-background);
      border-left: 3px solid var(--vscode-textBlockQuote-border);
      padding: 12px 16px;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
    }
    .file-list ul {
      list-style: none;
      font-size: 13px;
      font-family: var(--vscode-editor-font-family);
    }
    .file-list li {
      padding: 4px 0;
      color: var(--vscode-foreground);
    }
    .file-list li:not(:last-child) {
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    button {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .btn-primary:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .btn-secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .btn-cancel {
      background: transparent;
      color: var(--vscode-foreground);
      border: 1px solid var(--vscode-panel-border);
    }
    .btn-cancel:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .tip {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: var(--vscode-editorInfo-background);
      border: 1px solid var(--vscode-editorInfo-border);
      border-radius: 4px;
      font-size: 12px;
      color: var(--vscode-editorInfo-foreground);
      margin-top: 16px;
    }
    .char-count {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      text-align: right;
      margin-top: 4px;
    }
    .char-count.warning {
      color: var(--vscode-editorWarning-foreground);
    }
    .char-count.error {
      color: var(--vscode-editorError-foreground);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ AI Commit Message</h1>
      <span class="badge">Claude AI</span>
    </div>

    <div class="section">
      <div class="section-title">📝 Mensaje de Commit</div>
      <textarea id="commitMessage" spellcheck="false">${this._escapeHtml(message)}</textarea>
      <div class="char-count" id="charCount"></div>
    </div>

    <div class="section">
      <div class="section-title">📂 Archivos Modificados (${fileCount})</div>
      <div class="file-list">
        <ul>
          ${fileList}
          ${moreFiles}
        </ul>
      </div>
    </div>

    <div class="tip">
      <span>💡</span>
      <span>Puedes editar el mensaje antes de aceptarlo. Se recomienda mantener la primera línea bajo 50 caracteres.</span>
    </div>

    <div class="actions">
      <button class="btn-cancel" onclick="reject()">Cancelar</button>
      <button class="btn-secondary" onclick="copyToClipboard()">📋 Copiar</button>
      <button class="btn-primary" onclick="accept()">✅ Usar Este Mensaje</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const textarea = document.getElementById('commitMessage');
    const charCountEl = document.getElementById('charCount');

    function updateCharCount() {
      const text = textarea.value;
      const firstLine = text.split('\\n')[0];
      const firstLineLength = firstLine.length;
      
      charCountEl.textContent = \`Primera línea: \${firstLineLength} caracteres\`;
      
      if (firstLineLength > 72) {
        charCountEl.className = 'char-count error';
      } else if (firstLineLength > 50) {
        charCountEl.className = 'char-count warning';
      } else {
        charCountEl.className = 'char-count';
      }
    }

    textarea.addEventListener('input', updateCharCount);
    updateCharCount();

    // Auto-focus on textarea
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    function accept() {
      vscode.postMessage({
        command: 'accept',
        text: textarea.value
      });
    }

    function reject() {
      vscode.postMessage({
        command: 'reject'
      });
    }

    function copyToClipboard() {
      vscode.postMessage({
        command: 'copy',
        text: textarea.value
      });
    }

    // Keyboard shortcuts
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        accept();
      } else if (e.key === 'Escape') {
        reject();
      }
    });
  </script>
</body>
</html>`;
  }

  private _escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  public dispose() {
    CommitMessagePanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
