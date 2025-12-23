import simpleGit, { SimpleGit } from 'simple-git';
import { GitDiff } from './types';

export class GitService {
  private git: SimpleGit;

  constructor(workspaceRoot: string) {
    this.git = simpleGit(workspaceRoot);
  }

  async getStagedDiff(): Promise<GitDiff | null> {
    try {
      // Verificar que estamos en un repositorio Git
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error('📁 No se detectó un repositorio Git en este workspace.');
      }

      const status = await this.git.status();
      const staged = status.staged;

      if (staged.length === 0) {
        return null;
      }

      const diff = await this.git.diff(['--staged']);

      return {
        files: staged,
        diff: diff
      };
    } catch (error: any) {
      console.error('Error getting git diff:', error);
      
      if (error.message?.includes('not a git repository')) {
        throw new Error('📁 No se detectó un repositorio Git. Inicializa uno con "git init".');
      } else if (error.message?.includes('permission denied')) {
        throw new Error('🔒 Sin permisos para acceder al repositorio Git.');
      } else if (error.message?.includes('📁')) {
        throw error; // Ya es nuestro error personalizado
      } else {
        throw new Error(`❌ Error al leer cambios de Git: ${error.message}`);
      }
    }
  }

  async getRecentCommits(count: number = 10): Promise<string[]> {
    try {
      const log = await this.git.log({ maxCount: count });
      return log.all.map(commit => commit.message);
    } catch (error: any) {
      console.error('Error getting recent commits:', error);
      // No lanzar error, solo retornar array vacío
      // (los commits recientes son opcionales)
      return [];
    }
  }
}