import * as vscode from 'vscode';
import { GitWorkflowService, GitWorkflowState, BranchInfo } from './gitWorkflow';

export class GitWorkflowTreeProvider implements vscode.TreeDataProvider<GitWorkflowItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<GitWorkflowItem | undefined | null | void> =
    new vscode.EventEmitter<GitWorkflowItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<GitWorkflowItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private gitWorkflowService: GitWorkflowService | undefined;
  private state: GitWorkflowState | undefined;

  constructor(private workspaceRoot: string) {
    this.gitWorkflowService = new GitWorkflowService(workspaceRoot);
    this.refresh();
  }

  refresh(): void {
    this.getWorkflowState().then(() => {
      this._onDidChangeTreeData.fire(null);
    });
  }

  private async getWorkflowState(): Promise<void> {
    if (!this.gitWorkflowService) {return;}
    try {
      this.state = await this.gitWorkflowService.getWorkflowState();
    } catch (error) {
      console.error('Error getting workflow state:', error);
    }
  }

  getTreeItem(element: GitWorkflowItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: GitWorkflowItem): Promise<GitWorkflowItem[]> {
    if (!this.state) {
      return [];
    }

    if (!element) {
      // Root level
      const items: GitWorkflowItem[] = [];

      // Status
      items.push(
        new GitWorkflowItem(
          `📍 Branch: ${this.state.branch}`,
          vscode.TreeItemCollapsibleState.None,
          'status'
        )
      );

      // Estado limpio o cambios
      const statusIcon = this.state.isClean ? '✅' : '⚠️';
      const statusText = this.state.isClean ? 'Sin cambios' : `${this.state.unstaged.length} cambios sin stage`;
      items.push(
        new GitWorkflowItem(statusText, vscode.TreeItemCollapsibleState.None, 'status')
      );

      // Archivos sin stage
      if (this.state.unstaged.length > 0) {
        items.push(
          new GitWorkflowItem(
            `📝 Sin stage (${this.state.unstaged.length})`,
            vscode.TreeItemCollapsibleState.Collapsed,
            'unstaged-group'
          )
        );
      }

      // Archivos staged
      if (this.state.staged.length > 0) {
        items.push(
          new GitWorkflowItem(
            `✅ Staged (${this.state.staged.length})`,
            vscode.TreeItemCollapsibleState.Collapsed,
            'staged-group'
          )
        );
      }

      // Ramas
      items.push(
        new GitWorkflowItem(
          `🔀 Ramas (${this.state.localBranches.length} local, ${this.state.remoteBranches.length} remote)`,
          vscode.TreeItemCollapsibleState.Collapsed,
          'branches-group'
        )
      );

      return items;
    }

    // Children of groups
    if (element.type === 'unstaged-group' && this.state) {
      return this.state.unstaged.map(
        file =>
          new GitWorkflowItem(
            `${file.status} ${file.path}`,
            vscode.TreeItemCollapsibleState.None,
            'file',
            file
          )
      );
    }

    if (element.type === 'staged-group' && this.state) {
      return this.state.staged.map(
        file =>
          new GitWorkflowItem(
            `${file.status} ${file.path}`,
            vscode.TreeItemCollapsibleState.None,
            'file',
            file
          )
      );
    }

    if (element.type === 'branches-group' && this.state) {
      const items: GitWorkflowItem[] = [];

      // Ramas locales
      for (const branch of this.state.localBranches) {
        const isCurrent = branch === this.state.branch;
        const icon = isCurrent ? '●' : '○';
        items.push(
          new GitWorkflowItem(
            `${icon} ${branch}${isCurrent ? ' (actual)' : ''}`,
            vscode.TreeItemCollapsibleState.None,
            'branch-local',
            undefined,
            branch
          )
        );
      }

      // Ramas remotas
      for (const branch of this.state.remoteBranches) {
        items.push(
          new GitWorkflowItem(
            `▻ ${branch}`,
            vscode.TreeItemCollapsibleState.None,
            'branch-remote',
            undefined,
            branch
          )
        );
      }

      return items;
    }

    return [];
  }

  async stageFile(file: GitWorkflowItem | undefined): Promise<void> {
    if (!file || !file.file || !this.gitWorkflowService) {return;}
    try {
      await this.gitWorkflowService.stageFiles([file.file.path]);
      this.refresh();
    } catch (error) {
      vscode.window.showErrorMessage(`Error staging file: ${error}`);
    }
  }

  async unstageFile(file: GitWorkflowItem | undefined): Promise<void> {
    if (!file || !file.file || !this.gitWorkflowService) {return;}
    try {
      await this.gitWorkflowService.unstageFiles([file.file.path]);
      this.refresh();
    } catch (error) {
      vscode.window.showErrorMessage(`Error unstaging file: ${error}`);
    }
  }

  async switchBranch(branch: GitWorkflowItem | undefined): Promise<void> {
    if (!branch || !branch.branchName || !this.gitWorkflowService) {return;}
    try {
      // Si es rama remota, crear rama local tracking
      if (branch.type === 'branch-remote') {
        const localName = branch.branchName.replace('origin/', '');
        await this.gitWorkflowService.switchBranch(localName);
      } else {
        await this.gitWorkflowService.switchBranch(branch.branchName);
      }
      this.refresh();
    } catch (error) {
      vscode.window.showErrorMessage(`Error switching branch: ${error}`);
    }
  }
}

export class GitWorkflowItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly type: string,
    public readonly file?: any,
    public readonly branchName?: string,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = new vscode.MarkdownString(label);

    if (type === 'file') {
      this.contextValue = file?.staged ? 'staged-file' : 'unstaged-file';
      this.iconPath = new vscode.ThemeIcon(
        file?.status === 'M'
          ? 'file-modification'
          : file?.status === 'A'
            ? 'file-added'
            : file?.status === 'D'
              ? 'file-deleted'
              : 'file'
      );
    } else if (type === 'branch-local' || type === 'branch-remote') {
      this.contextValue = 'branch';
      this.iconPath = new vscode.ThemeIcon('git-branch');
    }
  }
}
