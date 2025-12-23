import * as vscode from 'vscode';
import { GitWorkflowState, GitFile } from './gitWorkflow';

export class GitWorkflowPanel {
  public static currentPanel: GitWorkflowPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  
  private _onStageFiles: ((files: string[]) => void) | undefined;
  private _onUnstageFiles: ((files: string[]) => void) | undefined;
  private _onGenerateCommit: (() => void) | undefined;
  private _onCommit: ((message: string) => void) | undefined;
  private _onPush: (() => void) | undefined;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;

    this._panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [extensionUri]
    };

    this._panel.webview.onDidReceiveMessage(
      (message: any) => {
        switch (message.command) {
          case 'stageFiles':
            if (this._onStageFiles) {
              this._onStageFiles(message.files);
            }
            break;
          case 'unstageFiles':
            if (this._onUnstageFiles) {
              this._onUnstageFiles(message.files);
            }
            break;
          case 'generateCommit':
            if (this._onGenerateCommit) {
              this._onGenerateCommit();
            }
            break;
          case 'commit':
            if (this._onCommit) {
              this._onCommit(message.message);
            }
            break;
          case 'push':
            if (this._onPush) {
              this._onPush();
            }
            break;
        }
      },
      null,
      this._disposables
    );

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public static show(
    extensionUri: vscode.Uri,
    state: GitWorkflowState,
    generatedMessage?: string,
    onStageFiles?: (files: string[]) => void,
    onUnstageFiles?: (files: string[]) => void,
    onGenerateCommit?: () => void,
    onCommit?: (message: string) => void,
    onPush?: () => void
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (GitWorkflowPanel.currentPanel) {
      GitWorkflowPanel.currentPanel._panel.reveal(column);
      GitWorkflowPanel.currentPanel.update(state, generatedMessage);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'gitWorkflow',
      '🚀 Git Workflow',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    GitWorkflowPanel.currentPanel = new GitWorkflowPanel(panel, extensionUri);
    GitWorkflowPanel.currentPanel._onStageFiles = onStageFiles;
    GitWorkflowPanel.currentPanel._onUnstageFiles = onUnstageFiles;
    GitWorkflowPanel.currentPanel._onGenerateCommit = onGenerateCommit;
    GitWorkflowPanel.currentPanel._onCommit = onCommit;
    GitWorkflowPanel.currentPanel._onPush = onPush;
    GitWorkflowPanel.currentPanel.update(state, generatedMessage);
  }

  private update(state: GitWorkflowState, generatedMessage?: string) {
    this._panel.webview.html = this._getHtmlContent(state, generatedMessage);
  }

  private _getHtmlContent(state: GitWorkflowState, generatedMessage?: string): string {
    const unstagedList = state.unstaged.map(f => 
      `<div class="file-item" data-path="${this._escapeHtml(f.path)}">
        <input type="checkbox" class="file-checkbox unstaged-checkbox" value="${this._escapeHtml(f.path)}">
        <span class="file-status ${f.status}">${f.status}</span>
        <span class="file-path">${this._escapeHtml(f.path)}</span>
      </div>`
    ).join('');

    const stagedList = state.staged.map(f =>
      `<div class="file-item" data-path="${this._escapeHtml(f.path)}">
        <input type="checkbox" class="file-checkbox staged-checkbox" value="${this._escapeHtml(f.path)}" checked>
        <span class="file-status ${f.status}">${f.status}</span>
        <span class="file-path">${this._escapeHtml(f.path)}</span>
      </div>`
    ).join('');

    const messageDisplay = generatedMessage 
      ? `<div class="message-generated">
          <div class="message-label">✨ Mensaje generado:</div>
          <div class="message-preview">${this._escapeHtml(generatedMessage)}</div>
        </div>`
      : '';

    const commitButton = generatedMessage
      ? `<button class="btn-primary" onclick="commit()">✅ Confirmar Commit</button>`
      : `<button class="btn-secondary" onclick="generateCommit()">🤖 Generar Commit con AI</button>`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Git Workflow</title>
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
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--vscode-panel-border);
    }
    .header h1 {
      font-size: 20px;
      font-weight: 600;
      flex: 1;
    }
    .branch-badge {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .workflow-section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title .count {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 10px;
    }
    .files-container {
      background: var(--vscode-textBlockQuote-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
      padding: 8px;
    }
    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 1px solid var(--vscode-panel-border);
      font-size: 12px;
    }
    .file-item:last-child {
      border-bottom: none;
    }
    .file-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .file-checkbox {
      cursor: pointer;
      width: 16px;
      height: 16px;
    }
    .file-status {
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
      min-width: 30px;
      text-align: center;
    }
    .file-status.M {
      background: var(--vscode-editorWarning-background);
      color: var(--vscode-editorWarning-foreground);
    }
    .file-status.A {
      background: var(--vscode-editorInfo-background);
      color: var(--vscode-editorInfo-foreground);
    }
    .file-status.D {
      background: var(--vscode-editorError-background);
      color: var(--vscode-editorError-foreground);
    }
    .file-status.\\?\\? {
      background: rgba(100, 100, 100, 0.3);
      color: var(--vscode-descriptionForeground);
    }
    .file-path {
      flex: 1;
      font-family: var(--vscode-editor-font-family);
      color: var(--vscode-foreground);
    }
    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    button {
      padding: 6px 12px;
      font-size: 12px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }
    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--vscode-button-hoverBackground);
    }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .btn-secondary:hover:not(:disabled) {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .btn-small {
      padding: 4px 8px;
      font-size: 11px;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .message-generated {
      background: var(--vscode-editorInfo-background);
      border-left: 3px solid var(--vscode-editorInfo-border);
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .message-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .message-preview {
      font-family: var(--vscode-editor-font-family);
      font-size: 13px;
      padding: 8px;
      background: var(--vscode-input-background);
      border-radius: 3px;
      border: 1px solid var(--vscode-input-border);
      word-break: break-word;
      color: var(--vscode-input-foreground);
    }
    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
    }
    .commit-input {
      width: 100%;
      min-height: 80px;
      padding: 12px;
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      resize: vertical;
      margin-bottom: 12px;
    }
    .commit-input:focus {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }
    .status-info {
      display: flex;
      gap: 16px;
      padding: 12px;
      background: var(--vscode-textBlockQuote-background);
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 12px;
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-icon {
      font-size: 14px;
    }
    .push-button {
      margin-top: 16px;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Git Workflow</h1>
      <div class="branch-badge">📍 ${this._escapeHtml(state.branch)}</div>
    </div>

    <div class="status-info">
      <div class="status-item">
        <span class="status-icon">📝</span>
        <span>Sin stage: <strong>${state.unstaged.length}</strong></span>
      </div>
      <div class="status-item">
        <span class="status-icon">✓</span>
        <span>Staged: <strong>${state.staged.length}</strong></span>
      </div>
      <div class="status-item">
        <span class="status-icon">${state.isClean ? '✅' : '⚠️'}</span>
        <span>${state.isClean ? 'Sin cambios' : 'Hay cambios'}</span>
      </div>
    </div>

    <!-- Archivos sin stage -->
    <div class="workflow-section">
      <div class="section-title">
        📋 Archivos sin stage <span class="count">${state.unstaged.length}</span>
      </div>
      ${state.unstaged.length > 0 
        ? `<div class="files-container" id="unstagedContainer">
            ${unstagedList}
          </div>
          <div class="action-buttons">
            <button class="btn-secondary btn-small" onclick="stageSelected()">➕ Stage seleccionados</button>
            <button class="btn-secondary btn-small" onclick="stageAll()">➕ Stage todos</button>
          </div>`
        : '<div class="empty-state">✅ Todos los cambios están staged</div>'
      }
    </div>

    <!-- Archivos staged -->
    <div class="workflow-section">
      <div class="section-title">
        ✅ Archivos staged <span class="count">${state.staged.length}</span>
      </div>
      ${state.staged.length > 0
        ? `<div class="files-container" id="stagedContainer">
            ${stagedList}
          </div>
          <div class="action-buttons">
            <button class="btn-secondary btn-small" onclick="unstageSelected()">➖ Unstage seleccionados</button>
            <button class="btn-secondary btn-small" onclick="unstageAll()">➖ Unstage todos</button>
          </div>`
        : '<div class="empty-state">No hay archivos staged</div>'
      }
    </div>

    <!-- Mensaje de commit -->
    ${state.staged.length > 0 ? `
      <div class="workflow-section">
        <div class="section-title">💬 Mensaje de Commit</div>
        ${messageDisplay}
        <textarea id="commitMessage" class="commit-input" placeholder="Escribe tu mensaje de commit aquí...">${generatedMessage || ''}</textarea>
        <div class="action-buttons">
          ${commitButton}
        </div>
      </div>
    ` : '<div class="empty-state">👆 Stagea archivos para crear un commit</div>'}

    <!-- Push -->
    ${state.staged.length > 0 && generatedMessage ? `
      <button class="btn-primary push-button" onclick="push()" ${!state.canPush ? 'disabled' : ''}>
        🚀 Push (Sincronizar)
      </button>
    ` : ''}
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    function getSelectedFiles(selector) {
      return Array.from(document.querySelectorAll(selector + ':checked'))
        .map(el => el.value);
    }

    function stageSelected() {
      const files = getSelectedFiles('.unstaged-checkbox');
      if (files.length > 0) {
        vscode.postMessage({ command: 'stageFiles', files });
      }
    }

    function stageAll() {
      const files = Array.from(document.querySelectorAll('.unstaged-checkbox'))
        .map(el => el.value);
      if (files.length > 0) {
        vscode.postMessage({ command: 'stageFiles', files });
      }
    }

    function unstageSelected() {
      const files = getSelectedFiles('.staged-checkbox');
      if (files.length > 0) {
        vscode.postMessage({ command: 'unstageFiles', files });
      }
    }

    function unstageAll() {
      const files = Array.from(document.querySelectorAll('.staged-checkbox'))
        .map(el => el.value);
      if (files.length > 0) {
        vscode.postMessage({ command: 'unstageFiles', files });
      }
    }

    function generateCommit() {
      vscode.postMessage({ command: 'generateCommit' });
    }

    function commit() {
      const message = document.getElementById('commitMessage').value;
      if (!message.trim()) {
        alert('Por favor escribe un mensaje de commit');
        return;
      }
      vscode.postMessage({ command: 'commit', message });
    }

    function push() {
      vscode.postMessage({ command: 'push' });
    }

    // Auto-focus en el textarea si existe
    const textarea = document.getElementById('commitMessage');
    if (textarea) {
      textarea.focus();
    }
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
    GitWorkflowPanel.currentPanel = undefined;
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
