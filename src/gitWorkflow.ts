import simpleGit, { SimpleGit } from 'simple-git';

export interface GitFile {
  path: string;
  status: 'M' | 'A' | 'D' | '??' | 'MM' | 'MD' | 'AM';
  staged: boolean;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitWorkflowState {
  unstaged: GitFile[];
  staged: GitFile[];
  branch: string;
  isClean: boolean;
  canPush: boolean;
  localBranches: string[];
  remoteBranches: string[];
  recentCommits: GitCommit[];
}

export interface BranchInfo {
  name: string;
  isLocal: boolean;
  isRemote: boolean;
  isCurrent: boolean;
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

      // Obtener ramas locales y remotas
      const branches = await this.git.branch();
      const localBranches = branches.all.filter(b => !b.includes('remotes')).map(b => b.replace('* ', ''));
      const remoteBranches = branches.all.filter(b => b.includes('remotes')).map(b => b.trim());

      // Verificar si hay commits para push
      let canPush = false;
      try {
        const log = await this.git.log(['--oneline', '-n', '1']);
        canPush = log.total > 0;
      } catch {
        canPush = false;
      }

      // Obtener commits recientes
      const recentCommits: GitCommit[] = [];
      try {
        const log = await this.git.log(['-n', '10']);
        for (const commit of log.all) {
          recentCommits.push({
            hash: commit.hash.substring(0, 7),
            message: commit.message,
            author: commit.author_name,
            date: new Date(commit.date).toLocaleDateString()
          });
        }
      } catch {
        // Si no hay commits, dejar array vacío
      }

      return {
        unstaged,
        staged,
        branch,
        isClean,
        canPush,
        localBranches,
        remoteBranches,
        recentCommits
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
      const status = await this.git.status();
      const currentBranch = status.current;

      if (!currentBranch) {
        throw new Error('No branch detected');
      }

      // Intentar push normal
      try {
        await this.git.push();
      } catch (error: any) {
        // Si falla por no tener upstream, establecerlo
        if (error.message.includes('no upstream branch')) {
          await this.git.push(['--set-upstream', 'origin', currentBranch]);
        } else if (error.message.includes('rejected') || error.message.includes('fetch first')) {
          // Si el rechazo es porque el remoto tiene cambios, hacer pull y luego push
          await this.git.pull();
          await this.git.push();
        } else {
          throw error;
        }
      }
    } catch (error) {
      throw new Error(`Error pushing: ${error}`);
    }
  }

  async switchBranch(branchName: string): Promise<void> {
    try {
      await this.git.checkout(branchName);
    } catch (error) {
      throw new Error(`Error switching branch: ${error}`);
    }
  }

  async getAllBranches(): Promise<BranchInfo[]> {
    try {
      const branches = await this.git.branch();
      const status = await this.git.status();
      const currentBranch = status.current;

      const allBranches: BranchInfo[] = [];

      // Agregar ramas locales
      for (const branch of branches.all) {
        const cleanName = branch.replace('* ', '').trim();
        if (!cleanName.includes('remotes')) {
          allBranches.push({
            name: cleanName,
            isLocal: true,
            isRemote: false,
            isCurrent: cleanName === currentBranch
          });
        }
      }

      // Agregar ramas remotas
      for (const branch of branches.all) {
        if (branch.includes('remotes')) {
          const cleanName = branch.trim();
          allBranches.push({
            name: cleanName,
            isLocal: false,
            isRemote: true,
            isCurrent: false
          });
        }
      }

      return allBranches;
    } catch (error) {
      throw new Error(`Error getting branches: ${error}`);
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
