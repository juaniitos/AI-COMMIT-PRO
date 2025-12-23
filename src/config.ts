import * as vscode from 'vscode';
import { CommitConfig } from './types';

export function getConfig(): CommitConfig {
  const config = vscode.workspace.getConfiguration('aiCommitPro');
  
  return {
    apiKey: config.get('apiKey', ''),
    model: config.get('model', 'claude-3-5-haiku-20241022'),
    language: config.get('language', 'english'),
    maxRecentCommits: config.get('maxRecentCommits', 5)
  };
}

export function isConfigured(): boolean {
  const config = getConfig();
  return config.apiKey !== '';
}