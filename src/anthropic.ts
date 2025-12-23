import Anthropic from '@anthropic-ai/sdk';
import { CommitConfig, GitDiff, CommitMessage } from './types';

export class AIService {
  private client: Anthropic;
  private config: CommitConfig;

  constructor(config: CommitConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey
    });
  }

  async generateCommitMessage(
    diff: GitDiff,
    recentCommits: string[]
  ): Promise<CommitMessage> {
    const prompt = this.buildPrompt(diff, recentCommits);

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 300,
        temperature: 0.7,
        system: this.getSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      // Extraer el texto de la respuesta
      const messageText = response.content
        .filter(block => block.type === 'text')
        .map(block => block.type === 'text' ? block.text : '')
        .join('');
      
      return { message: this.cleanMessage(messageText) };
    } catch (error: any) {
      console.error('Error calling Claude API:', error);
      
      // Manejo específico de errores de Anthropic
      if (error.status === 401) {
        throw new Error('❌ API Key inválida. Verifica tu configuración en Settings.');
      } else if (error.status === 429) {
        throw new Error('⏱️ Límite de uso excedido. Espera unos minutos e intenta de nuevo.');
      } else if (error.status === 500 || error.status === 529) {
        throw new Error('🔧 Error en el servidor de Anthropic. Intenta de nuevo en unos momentos.');
      } else if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
        throw new Error('🌐 Error de conexión. Verifica tu conexión a internet.');
      } else {
        throw new Error(`❌ Error al generar commit: ${error.message || 'Error desconocido'}`);
      }
    }
  }

  private getSystemPrompt(): string {
    const language = this.config.language === 'spanish' ? 
      'en español' : 'in English';

    const examples = this.config.language === 'spanish' ? `
EJEMPLOS de buenos commits:
- feat: agregar autenticación con OAuth2
- fix: corregir error de cálculo en totales
- docs: actualizar guía de instalación
- refactor: simplificar lógica de validación
- perf: optimizar consultas de base de datos
- test: agregar pruebas unitarias para PaymentService
- chore: actualizar dependencias de proyecto` : `
EXAMPLES of good commits:
- feat: add OAuth2 authentication
- fix: correct calculation error in totals
- docs: update installation guide
- refactor: simplify validation logic
- perf: optimize database queries
- test: add unit tests for PaymentService
- chore: update project dependencies`;

    return `You are an expert at generating Git commit messages following best practices.
Generate clear and concise messages ${language} following the Conventional Commits format:

<type>(<scope>): <subject>

VALID TYPES:
- feat: New feature or functionality
- fix: Bug fix
- docs: Documentation changes
- style: Code style/formatting (no logic changes)
- refactor: Code restructuring (no behavior changes)
- perf: Performance improvements
- test: Adding or updating tests
- chore: Maintenance tasks (dependencies, configs, etc.)

RULES:
1. Keep subject under 50 characters
2. Use imperative mood: "add" not "added", "fix" not "fixed"
3. Don't end subject with period
4. Scope is optional but helpful (e.g., "feat(auth): ...")
5. Focus on WHAT changed and WHY, not HOW
6. Be specific but concise${examples}

Respond with ONLY the commit message, no explanations or additional text.`;
  }

  private buildPrompt(diff: GitDiff, recentCommits: string[]): string {
    const promptLang = this.config.language === 'spanish' ? {
      header: 'Genera un mensaje de commit para estos cambios:',
      files: 'Archivos modificados',
      diff: 'Cambios en el código',
      recent: 'Commits recientes para contexto (mantén un estilo similar)',
      footer: 'Genera SOLO el mensaje de commit, sin explicaciones ni código markdown.'
    } : {
      header: 'Generate a commit message for these changes:',
      files: 'Modified files',
      diff: 'Code changes',
      recent: 'Recent commits for context (maintain similar style)',
      footer: 'Generate ONLY the commit message, no explanations or markdown code.'
    };

    let prompt = `${promptLang.header}\n\n`;
    
    // Agrupar archivos por tipo de cambio
    const fileCount = diff.files.length;
    prompt += `${promptLang.files} (${fileCount}): ${diff.files.slice(0, 10).join(', ')}`;
    if (fileCount > 10) {
      prompt += ` y ${fileCount - 10} más`;
    }
    prompt += '\n\n';
    
    prompt += `${promptLang.diff}:\n${this.truncateDiff(diff.diff)}\n\n`;
    
    if (recentCommits.length > 0) {
      prompt += `${promptLang.recent}:\n`;
      prompt += recentCommits.slice(0, 5).map(c => `- ${c}`).join('\n');
      prompt += '\n\n';
    }

    prompt += promptLang.footer;
    
    return prompt;
  }

  private truncateDiff(diff: string): string {
    const maxLength = 3000;
    if (diff.length > maxLength) {
      return diff.substring(0, maxLength) + '\n\n[... diff truncado ...]';
    }
    return diff;
  }

  private cleanMessage(text: string): string {
    return text
      .trim()
      .replace(/^```.*$/gm, '') // Remover code blocks
      .replace(/^["']|["']$/g, '') // Remover comillas
      .trim();
  }
}