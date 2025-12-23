import simpleGit, { SimpleGit } from 'simple-git';

export interface GitFile {
  path: string;
  status: 'M' | 'A' | 'D' | '??' | 'MM' | 'MD' | 'AM';
  staged: boolean;
}

export interface GitWorkflowState {
  unstaged: GitFile[];
  staged: GitFile[];
  branch: string;
  isClean: boolean;
  canPush: boolean;
}

export class GitWorkflowService {
  private git: SimpleGit;

  constructor(workspaceRoot: string) {
    this.git = simpleGit(workspaceRoot);
  }

  async getWorkflowState(): Promise<GitWorkflowState> {
    try {
      const status = await this.git.status();
      
      const unstaged: GitFile[] = [
        ...status.not_added.map(path => ({ path, status: '??' as const, staged: false })),
        ...status.modified.map(path => ({ path, status: 'M' as const, staged: false })),
        ...status.deleted.map(path => ({ path, status: 'D' as const, staged: false }))
      ];

      const staged: GitFile[] = [
        ...status.created.map(path => ({ path, status: 'A' as const, staged: true })),
        ...status.staged.map(path => ({ path, status: 'M' as const, staged: true })),
        ...status.renamed.map(item => ({ 
          path: typeof item === 'string' ? item : item.from, 
          status: 'M' as const, 
          staged: true 
        }))
      ];

      const branch = status.current || 'unknown';
      const isClean = status.isClean();

      // Verificar si hay commits para push
      let canPush = false;
      try {
        const log = await this.git.log(['--oneline', '-n', '1']);
        canPush = log.total > 0;
      } catch {
        canPush = false;
      }

      return {
        unstaged,
        staged,
        branch,
        isClean,
        canPush
      };
    } catch (error) {
      throw new Error(`Error getting Git workflow state: ${error}`);
    }
  }

  async stageFiles(filePaths: string[]): Promise<void> {
    try {
      if (filePaths.length === 0) {return;}
      await this.git.add(filePaths);
    } catch (error) {
      throw new Error(`Error staging files: ${error}`);
    }
  }

  async unstageFiles(filePaths: string[]): Promise<void> {
    try {
      if (filePaths.length === 0) {return;}
      await this.git.reset(filePaths);
    } catch (error) {
      throw new Error(`Error unstaging files: ${error}`);
    }
  }

  async commitMessage(message: string): Promise<void> {
    try {
      await this.git.commit(message);
    } catch (error) {
      throw new Error(`Error committing: ${error}`);
    }
  }

  async push(): Promise<void> {
    try {
      await this.git.push();
    } catch (error) {
      throw new Error(`Error pushing: ${error}`);
    }
  }

  async getStagedDiff(): Promise<string> {
    try {
      return await this.git.diff(['--staged']);
    } catch (error) {
      throw new Error(`Error getting diff: ${error}`);
    }
  }
}
