export interface CommitConfig {
  apiKey: string;
  model: string;
  language: 'english' | 'spanish';
  maxRecentCommits?: number;
}

export interface GitDiff {
  files: string[];
  diff: string;
}

export interface CommitMessage {
  message: string;
}