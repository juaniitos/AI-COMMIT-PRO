import * as vscode from 'vscode';
import { getConfig, isConfigured } from './config';
import { GitService } from './git';
import { AIService } from './anthropic';
import { CommitMessagePanel } from './webview';

export function activate(context: vscode.ExtensionContext) {
  console.log('AI Commit Pro is now active!');

  const generateCommit = vscode.commands.registerCommand(
    'ai-commit-pro.generateCommit',
    async () => {
      await generateCommitMessage(context);
    }
  );

  context.subscriptions.push(generateCommit);
}

async function generateCommitMessage(context: vscode.ExtensionContext) {
  // 1. Check if API key is configured
  if (!isConfigured()) {
    const response = await vscode.window.showWarningMessage(
      '🔑 API Key de Anthropic no configurada. Configúrala para usar AI Commit Pro.',
      'Configurar Ahora',
      'Obtener API Key'
    );
    
    if (response === 'Configurar Ahora') {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'aiCommitPro.apiKey'
      );
    } else if (response === 'Obtener API Key') {
      vscode.env.openExternal(vscode.Uri.parse('https://console.anthropic.com/'));
    }
    return;
  }

  // 2. Get workspace root (support multiple repos)
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('📁 No hay ningún workspace abierto');
    return;
  }

  let workspaceRoot: string;
  
  // Si hay múltiples repos, permitir al usuario elegir
  if (workspaceFolders.length > 1) {
    const selected = await vscode.window.showQuickPick(
      workspaceFolders.map(folder => ({
        label: folder.name,
        description: folder.uri.fsPath,
        folder: folder
      })),
      {
        placeHolder: '📂 Selecciona el repositorio para generar el commit'
      }
    );
    
    if (!selected) {
      return; // Usuario canceló
    }
    
    workspaceRoot = selected.folder.uri.fsPath;
  } else {
    workspaceRoot = workspaceFolders[0].uri.fsPath;
  }

  // 3. Initialize services
  const config = getConfig();
  const gitService = new GitService(workspaceRoot);
  const aiService = new AIService(config);

  try {
    // 4. Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '🤖 Generando commit message con Claude AI...',
        cancellable: false
      },
      async (progress) => {
        // 5. Get staged changes
        progress.report({ increment: 10, message: '📖 Leyendo cambios staged...' });
        const diff = await gitService.getStagedDiff();

        if (!diff) {
          vscode.window.showWarningMessage(
            '⚠️ No hay cambios staged. Usa "git add" primero para agregar archivos.',
            'Abrir Git'
          ).then(selection => {
            if (selection === 'Abrir Git') {
              vscode.commands.executeCommand('workbench.view.scm');
            }
          });
          return;
        }

        // Mostrar resumen de archivos
        const fileCount = diff.files.length;
        progress.report({ 
          increment: 20, 
          message: `📝 ${fileCount} archivo${fileCount > 1 ? 's' : ''} modificado${fileCount > 1 ? 's' : ''}...` 
        });

        // 6. Get recent commits for context
        progress.report({ increment: 30, message: '🔍 Analizando historial de commits...' });
        const maxCommits = config.maxRecentCommits ?? 5;
        const recentCommits = maxCommits > 0 ? await gitService.getRecentCommits(maxCommits) : [];

        // 7. Generate commit message
        progress.report({ increment: 50, message: '✨ Generando mensaje con Claude AI...' });
        const result = await aiService.generateCommitMessage(
          diff,
          recentCommits
        );

        progress.report({ increment: 90, message: '✅ Completado!' });

        // Obtener configuración de preview mode
        const showPreview = vscode.workspace.getConfiguration('aiCommitPro').get('showPreview', true);
        const autoCopy = vscode.workspace.getConfiguration('aiCommitPro').get('autoCopyToClipboard', true);

        // 8. Insert into SCM input box
        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        const git = gitExtension?.getAPI(1);
        
        if (git && git.repositories.length > 0) {
          // Buscar el repo correcto si hay múltiples
          let targetRepo = git.repositories[0];
          if (git.repositories.length > 1) {
            targetRepo = git.repositories.find(
              (r: any) => r.rootUri.fsPath === workspaceRoot
            ) || git.repositories[0];
          }
          
          // Copiar al clipboard automáticamente si está habilitado
          if (autoCopy) {
            await vscode.env.clipboard.writeText(result.message);
          }
          
          if (showPreview) {
            // Mostrar panel de preview para editar
            CommitMessagePanel.show(
              context.extensionUri,
              result.message,
              diff.files,
              (editedMessage) => {
                // Usuario aceptó el mensaje (posiblemente editado)
                targetRepo.inputBox.value = editedMessage;
                const clipboardMsg = autoCopy ? ' 📋 Ya está en el clipboard' : '';
                vscode.window.showInformationMessage(
                  `✅ Mensaje insertado!${clipboardMsg}`,
                  'Ver en Git'
                ).then(selection => {
                  if (selection === 'Ver en Git') {
                    vscode.commands.executeCommand('workbench.view.scm');
                  }
                });
              },
              () => {
                // Usuario canceló
                vscode.window.showInformationMessage('❌ Generación de commit cancelada');
              }
            );
          } else {
            // Insertar directamente sin preview
            targetRepo.inputBox.value = result.message;
            
            const clipboardMsg = autoCopy ? ' 📋 Copiado al clipboard' : '';
            vscode.window.showInformationMessage(
              `✅ Commit message generado!${clipboardMsg}`,
              'Ver en Git',
              'Vista Previa'
            ).then(selection => {
              if (selection === 'Ver en Git') {
                vscode.commands.executeCommand('workbench.view.scm');
              } else if (selection === 'Vista Previa') {
                CommitMessagePanel.show(
                  context.extensionUri,
                  result.message,
                  diff.files,
                  (editedMessage) => {
                    targetRepo.inputBox.value = editedMessage;
                  },
                  () => {}
                );
              }
            });
          }
        } else {
          vscode.window.showWarningMessage(
            '⚠️ No se pudo acceder a la extensión de Git. El mensaje es: ' + result.message
          );
        }
      }
    );
  } catch (error: any) {
    // Mejorar mensajes de error con opciones de retry
    const errorMessage = error.message || 'Error desconocido';
    
    vscode.window.showErrorMessage(
      errorMessage,
      'Reintentar',
      'Ver Logs'
    ).then(selection => {
      if (selection === 'Reintentar') {
        generateCommitMessage(context);
      } else if (selection === 'Ver Logs') {
        vscode.commands.executeCommand('workbench.action.output.toggleOutput');
      }
    });
  }
}

export function deactivate() {}