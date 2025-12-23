# 🔧 AI Commit Pro - Documentación Técnica

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Principales](#componentes-principales)
4. [Flujo de Ejecución](#flujo-de-ejecución)
5. [Código Explicado](#código-explicado)
6. [APIs Utilizadas](#apis-utilizadas)
7. [Configuración y Settings](#configuración-y-settings)
8. [Debugging y Troubleshooting](#debugging-y-troubleshooting)

---

## 📖 Visión General

### ¿Qué es AI Commit Pro?

AI Commit Pro es una **extensión de Visual Studio Code** que utiliza **Inteligencia Artificial** (Claude de Anthropic) para generar automáticamente mensajes de commit de Git profesionales y descriptivos.

### ¿Cómo funciona en 3 pasos?

```
1. Usuario presiona Ctrl+Shift+C
           ↓
2. La extensión lee los cambios staged en Git
           ↓
3. Claude AI genera un mensaje de commit apropiado
           ↓
4. El mensaje aparece en el input box de Git
```

### Tecnologías utilizadas

- **TypeScript**: Lenguaje de programación
- **VS Code Extension API**: Para integrarse con VS Code
- **Anthropic Claude API**: IA para generar mensajes
- **simple-git**: Librería para trabajar con Git
- **esbuild**: Bundler para compilar el código

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────┐
│                    VS Code                          │
│  ┌──────────────────────────────────────────────┐  │
│  │          Extension Host Process               │  │
│  │                                               │  │
│  │  ┌──────────────┐                            │  │
│  │  │ extension.ts │ ← Entry Point               │  │
│  │  └──────┬───────┘                            │  │
│  │         │                                     │  │
│  │         ├──→ ┌─────────┐                     │  │
│  │         │    │config.ts│ (Lee settings)       │  │
│  │         │    └─────────┘                     │  │
│  │         │                                     │  │
│  │         ├──→ ┌────────┐                      │  │
│  │         │    │ git.ts │ (Lee cambios Git)     │  │
│  │         │    └────────┘                      │  │
│  │         │                                     │  │
│  │         └──→ ┌───────────────┐               │  │
│  │              │anthropic.ts   │               │  │
│  │              │(Llama a IA)   │               │  │
│  │              └───────┬───────┘               │  │
│  └──────────────────────┼───────────────────────┘  │
└─────────────────────────┼───────────────────────────┘
                          │
                          ↓
                  ┌───────────────┐
                  │ Claude API    │
                  │ (Anthropic)   │
                  └───────────────┘
```

### Estructura de Archivos

```
ai-commit-pro/
├── src/
│   ├── extension.ts      # Punto de entrada principal
│   ├── types.ts          # Definiciones de tipos TypeScript
│   ├── config.ts         # Manejo de configuración
│   ├── git.ts            # Interacción con Git
│   └── anthropic.ts      # Comunicación con Claude AI
├── package.json          # Configuración de la extensión
├── tsconfig.json         # Configuración de TypeScript
└── esbuild.js            # Configuración del bundler
```

---

## 🧩 Componentes Principales

### 1. `types.ts` - Definiciones de Tipos

**¿Qué hace?**
Define las estructuras de datos que usa toda la aplicación.

**Código:**
```typescript
export interface CommitConfig {
  apiKey: string;           // API key de Anthropic
  model: string;            // Modelo de Claude a usar
  language: 'english' | 'spanish';  // Idioma
}

export interface GitDiff {
  files: string[];          // Lista de archivos modificados
  diff: string;             // Contenido del diff
}

export interface CommitMessage {
  message: string;          // Mensaje de commit generado
}
```

**Explicación para juniors:**
- `interface` es como un "contrato" que dice qué propiedades debe tener un objeto
- Por ejemplo, `CommitConfig` SIEMPRE tendrá `apiKey`, `model` y `language`
- TypeScript verificará que no te falte ninguno

---

### 2. `config.ts` - Configuración

**¿Qué hace?**
Lee la configuración que el usuario puso en VS Code Settings.

**Código explicado:**
```typescript
import * as vscode from 'vscode';
import { CommitConfig } from './types';

export function getConfig(): CommitConfig {
  // vscode.workspace.getConfiguration obtiene las settings
  const config = vscode.workspace.getConfiguration('aiCommitPro');
  
  return {
    // .get('nombreSetting', 'valorPorDefecto')
    apiKey: config.get('apiKey', ''),
    model: config.get('model', 'claude-3-5-haiku-20241022'),
    language: config.get('language', 'english')
  };
}

export function isConfigured(): boolean {
  const config = getConfig();
  // Verifica que el usuario haya puesto su API key
  return config.apiKey !== '';
}
```

**Explicación para juniors:**
- `vscode.workspace.getConfiguration('aiCommitPro')` busca en Settings todo lo que empiece con `aiCommitPro.`
- Si el usuario no configuró algo, usamos valores por defecto (segundo parámetro de `.get()`)
- `isConfigured()` es una función helper para validar rápido

---

### 3. `git.ts` - Interacción con Git

**¿Qué hace?**
Lee información del repositorio Git usando la librería `simple-git`.

**Código explicado:**
```typescript
import simpleGit, { SimpleGit } from 'simple-git';
import { GitDiff } from './types';

export class GitService {
  private git: SimpleGit;

  constructor(workspaceRoot: string) {
    // Crea una instancia de simple-git en la carpeta del proyecto
    this.git = simpleGit(workspaceRoot);
  }

  async getStagedDiff(): Promise<GitDiff | null> {
    try {
      // Obtener estado de Git
      const status = await this.git.status();
      const staged = status.staged;  // Archivos en "git add"

      if (staged.length === 0) {
        return null;  // No hay nada staged
      }

      // Obtener el diff de los cambios staged
      const diff = await this.git.diff(['--staged']);

      return {
        files: staged,
        diff: diff
      };
    } catch (error) {
      console.error('Error getting git diff:', error);
      return null;
    }
  }

  async getRecentCommits(count: number = 10): Promise<string[]> {
    try {
      // Obtener últimos N commits
      const log = await this.git.log({ maxCount: count });
      // Extraer solo los mensajes
      return log.all.map(commit => commit.message);
    } catch (error) {
      console.error('Error getting recent commits:', error);
      return [];
    }
  }
}
```

**Explicación para juniors:**
- `async/await`: Como Git puede tardar, usamos código asíncrono
- `.status()`: Equivalente a `git status` en terminal
- `.diff(['--staged'])`: Equivalente a `git diff --staged`
- `.log()`: Equivalente a `git log`
- `Promise<GitDiff | null>`: Puede retornar GitDiff O null si hay error

**¿Por qué una clase?**
Porque necesitamos mantener `this.git` (la instancia) entre múltiples llamadas.

---

### 4. `anthropic.ts` - Cliente de IA

**¿Qué hace?**
Se comunica con la API de Claude (Anthropic) para generar mensajes de commit.

**Código explicado paso a paso:**

#### Constructor
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { CommitConfig, GitDiff, CommitMessage } from './types';

export class AIService {
  private client: Anthropic;
  private config: CommitConfig;

  constructor(config: CommitConfig) {
    this.config = config;
    // Crear cliente de Anthropic con la API key
    this.client = new Anthropic({
      apiKey: config.apiKey
    });
  }
```

**Explicación:** Guardamos la configuración y creamos el cliente de Anthropic.

---

#### Método principal: generateCommitMessage

```typescript
async generateCommitMessage(
  diff: GitDiff,
  recentCommits: string[]
): Promise<CommitMessage> {
  // Construir el prompt para Claude
  const prompt = this.buildPrompt(diff, recentCommits);

  try {
    // Llamar a la API de Claude
    const response = await this.client.messages.create({
      model: this.config.model,           // Qué modelo usar
      max_tokens: 300,                    // Máximo de respuesta
      temperature: 0.7,                   // Creatividad (0-1)
      system: this.getSystemPrompt(),     // Instrucciones generales
      messages: [                         // El chat
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
    throw new Error(`Failed to generate commit message: ${error.message}`);
  }
}
```

**Explicación para juniors:**
- `max_tokens`: Cuánto puede responder Claude (300 tokens ≈ 225 palabras)
- `temperature`: 0 = muy predecible, 1 = muy creativo. 0.7 es buen balance
- `system`: Instrucciones que siempre se aplican (como el "rol" de Claude)
- `messages`: El historial del chat (en este caso, solo 1 mensaje del usuario)

---

#### System Prompt

```typescript
private getSystemPrompt(): string {
  const language = this.config.language === 'spanish' ? 
    'en español' : 'in English';

  return `Eres un experto en generar mensajes de commit de Git. 
Genera mensajes claros y concisos ${language} siguiendo el formato Conventional Commits:

<type>: <subject>

Tipos válidos: feat, fix, docs, style, refactor, perf, test, chore
Mantén el subject bajo 50 caracteres
Usa modo imperativo: "agregar" no "agregado" (o "add" no "added")

Enfócate en QUÉ cambió y POR QUÉ.
Responde SOLO con el mensaje de commit, sin explicaciones adicionales.`;
}
```

**Explicación:**
Este es el "entrenamiento" que le damos a Claude. Le decimos:
- Qué formato usar (Conventional Commits)
- Qué reglas seguir
- Cómo responder

---

#### Construcción del Prompt

```typescript
private buildPrompt(diff: GitDiff, recentCommits: string[]): string {
  let prompt = `Genera un mensaje de commit para estos cambios:\n\n`;
  
  // Agregar archivos modificados
  prompt += `Archivos modificados: ${diff.files.join(', ')}\n\n`;
  
  // Agregar el diff (truncado si es muy largo)
  prompt += `Diff:\n${this.truncateDiff(diff.diff)}\n\n`;
  
  // Agregar commits recientes como contexto
  if (recentCommits.length > 0) {
    prompt += `Commits recientes para contexto (usa un estilo similar):\n`;
    prompt += recentCommits.slice(0, 5).map(c => `- ${c}`).join('\n');
    prompt += '\n\n';
  }

  prompt += 'Genera SOLO el mensaje de commit, sin explicaciones.';
  
  return prompt;
}
```

**Explicación:**
Construimos el mensaje que enviamos a Claude con:
1. Los archivos que cambiaron
2. El diff (qué cambió exactamente)
3. Commits recientes (para que imite el estilo)
4. Recordatorio final de responder solo el mensaje

---

#### Helpers

```typescript
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
    .replace(/^```.*$/gm, '')    // Quitar markdown code blocks
    .replace(/^["']|["']$/g, '') // Quitar comillas
    .trim();
}
```

**Explicación:**
- `truncateDiff`: Claude tiene límite de tokens. Si el diff es muy grande, lo cortamos.
- `cleanMessage`: A veces Claude responde con markdown o comillas. Los limpiamos.

---

### 5. `extension.ts` - Punto de Entrada

**¿Qué hace?**
Es el archivo principal que VS Code carga cuando activa la extensión.

**Código completo explicado:**

```typescript
import * as vscode from 'vscode';
import { getConfig, isConfigured } from './config';
import { GitService } from './git';
import { AIService } from './anthropic';

// Esta función se ejecuta cuando VS Code activa la extensión
export function activate(context: vscode.ExtensionContext) {
  console.log('AI Commit Pro is now active!');

  // Registrar el comando
  const generateCommit = vscode.commands.registerCommand(
    'ai-commit-pro.generateCommit',  // ID del comando (del package.json)
    async () => {
      await generateCommitMessage(context);
    }
  );

  // Agregar el comando a las subscripciones
  // (VS Code lo limpiará cuando la extensión se desactive)
  context.subscriptions.push(generateCommit);
}

// Función principal que genera el commit
async function generateCommitMessage(context: vscode.ExtensionContext) {
  // 1. Verificar que el usuario configuró su API key
  if (!isConfigured()) {
    const response = await vscode.window.showWarningMessage(
      'Anthropic API key not configured',
      'Configure Now'
    );
    
    if (response === 'Configure Now') {
      // Abrir settings directamente en el campo de API key
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'aiCommitPro.apiKey'
      );
    }
    return;  // Salir si no hay API key
  }

  // 2. Obtener la carpeta del workspace
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;

  // 3. Inicializar los servicios
  const config = getConfig();
  const gitService = new GitService(workspaceRoot);
  const aiService = new AIService(config);

  try {
    // 4. Mostrar barra de progreso
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generando commit message con Claude...',
        cancellable: false
      },
      async (progress) => {
        // 5. Leer cambios staged de Git
        progress.report({ message: 'Leyendo cambios staged...' });
        const diff = await gitService.getStagedDiff();

        if (!diff) {
          vscode.window.showWarningMessage(
            'No staged changes found. Stage your changes first (git add).'
          );
          return;
        }

        // 6. Obtener commits recientes para contexto
        progress.report({ message: 'Analizando historial de commits...' });
        const recentCommits = await gitService.getRecentCommits();

        // 7. Generar el mensaje con IA
        progress.report({ message: 'Generando mensaje con Claude AI...' });
        const result = await aiService.generateCommitMessage(
          diff,
          recentCommits
        );

        // 8. Insertar en el input box de Git
        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        const git = gitExtension?.getAPI(1);
        
        if (git && git.repositories.length > 0) {
          const repo = git.repositories[0];
          repo.inputBox.value = result.message;  // ¡Aquí aparece el mensaje!
          
          vscode.window.showInformationMessage(
            '✨ Commit message generado con Claude!'
          );
        }
      }
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Error al generar commit: ${error.message}`
    );
  }
}

// Se ejecuta cuando VS Code desactiva la extensión
export function deactivate() {}
```

**Explicación del flujo para juniors:**

1. **activate()**: VS Code la llama cuando carga la extensión
2. **registerCommand**: Decimos "cuando ejecuten 'ai-commit-pro.generateCommit', ejecuta esta función"
3. **generateCommitMessage()**: Es la función que hace todo el trabajo:
   - Valida API key
   - Obtiene el workspace
   - Lee Git
   - Llama a Claude
   - Inserta el resultado
4. **withProgress**: Muestra una barra de progreso mientras trabaja
5. **gitExtension.getAPI()**: Accede a la extensión de Git de VS Code para insertar el mensaje

---

## 🔄 Flujo de Ejecución

### Diagrama de Secuencia

```
Usuario                VS Code              Extension            Git        Claude API
  |                       |                     |                 |              |
  | Ctrl+Shift+C          |                     |                 |              |
  |---------------------->|                     |                 |              |
  |                       |                     |                 |              |
  |                       | executeCommand()    |                 |              |
  |                       |-------------------->|                 |              |
  |                       |                     |                 |              |
  |                       |                     | getStagedDiff() |              |
  |                       |                     |---------------->|              |
  |                       |                     |     diff        |              |
  |                       |                     |<----------------|              |
  |                       |                     |                 |              |
  |                       |                     | getRecentCommits()             |
  |                       |                     |---------------->|              |
  |                       |                     |    commits      |              |
  |                       |                     |<----------------|              |
  |                       |                     |                 |              |
  |                       |                     | generate()      |              |
  |                       |                     |---------------------------->   |
  |                       |                     |              message           |
  |                       |                     |<----------------------------|  |
  |                       |                     |                 |              |
  |                       | setInputBox()       |                 |              |
  |                       |<--------------------|                 |              |
  |                       |                     |                 |              |
  | ✨ Mensaje generado   |                     |                 |              |
  |<----------------------|                     |                 |              |
```

### Paso a Paso

1. **Usuario presiona `Ctrl+Shift+C`**
   - VS Code busca el comando registrado con ese shortcut

2. **VS Code ejecuta el comando**
   - Llama a `generateCommitMessage()`

3. **Validaciones iniciales**
   - ¿Hay API key? Si no → mostrar aviso
   - ¿Hay workspace abierto? Si no → error

4. **Leer información de Git**
   - `gitService.getStagedDiff()` lee cambios staged
   - `gitService.getRecentCommits()` lee últimos commits

5. **Generar mensaje con IA**
   - `aiService.generateCommitMessage()` llama a Claude
   - Espera la respuesta (2-5 segundos)

6. **Insertar en VS Code**
   - Accede a la extensión de Git
   - Inserta el mensaje en el input box

7. **Notificar al usuario**
   - Muestra "✨ Commit message generado con Claude!"

---

## 🔌 APIs Utilizadas

### 1. VS Code Extension API

**Documentación:** https://code.visualstudio.com/api

#### Commands API
```typescript
vscode.commands.registerCommand(id, callback)
vscode.commands.executeCommand(id, ...args)
```

**Uso en nuestra extensión:**
- Registramos el comando `ai-commit-pro.generateCommit`
- Puede ejecutarse con shortcut o Command Palette

#### Window API
```typescript
vscode.window.showInformationMessage(message, ...items)
vscode.window.showWarningMessage(message, ...items)
vscode.window.showErrorMessage(message, ...items)
vscode.window.withProgress(options, task)
```

**Uso en nuestra extensión:**
- Mostrar notificaciones al usuario
- Mostrar barra de progreso

#### Workspace API
```typescript
vscode.workspace.workspaceFolders
vscode.workspace.getConfiguration(section)
```

**Uso en nuestra extensión:**
- Obtener la carpeta del proyecto
- Leer configuración del usuario

---

### 2. Anthropic Claude API

**Documentación:** https://docs.anthropic.com/

#### Messages API
```typescript
client.messages.create({
  model: string,
  max_tokens: number,
  temperature: number,
  system: string,
  messages: Array<{ role, content }>
})
```

**Parámetros importantes:**

| Parámetro | Descripción | Valor usado |
|-----------|-------------|-------------|
| `model` | Modelo de Claude | `claude-3-5-haiku-20241022` |
| `max_tokens` | Máximo de respuesta | `300` (≈225 palabras) |
| `temperature` | Creatividad (0-1) | `0.7` (balanceado) |
| `system` | Instrucciones generales | Nuestro prompt de sistema |
| `messages` | Historial del chat | `[{ role: 'user', content: prompt }]` |

**Respuesta:**
```typescript
{
  content: [
    {
      type: 'text',
      text: 'feat: add AI commit generation'
    }
  ],
  model: 'claude-3-5-haiku-20241022',
  usage: {
    input_tokens: 245,
    output_tokens: 12
  }
}
```

---

### 3. simple-git

**Documentación:** https://github.com/steveukx/git-js

#### Métodos usados

```typescript
const git = simpleGit(workspaceRoot);

// Obtener estado
await git.status();

// Obtener diff
await git.diff(['--staged']);

// Obtener log
await git.log({ maxCount: 10 });
```

**Equivalentes en terminal:**

| Método | Comando Git |
|--------|-------------|
| `git.status()` | `git status` |
| `git.diff(['--staged'])` | `git diff --staged` |
| `git.log({ maxCount: 10 })` | `git log -n 10` |

---

## ⚙️ Configuración y Settings

### package.json - Sección `contributes.configuration`

```json
"configuration": {
  "title": "AI Commit Pro",
  "properties": {
    "aiCommitPro.apiKey": {
      "type": "string",
      "default": "",
      "description": "Your Anthropic API Key"
    },
    "aiCommitPro.model": {
      "type": "string",
      "default": "claude-3-5-haiku-20241022",
      "enum": [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229"
      ]
    },
    "aiCommitPro.language": {
      "type": "string",
      "default": "spanish",
      "enum": ["english", "spanish"]
    }
  }
}
```

**Explicación:**
- `properties`: Define cada setting
- `type`: Tipo de dato (string, number, boolean, etc.)
- `default`: Valor por defecto
- `enum`: Lista de valores permitidos (se muestra como dropdown)

### Cómo leer configuración en código

```typescript
const config = vscode.workspace.getConfiguration('aiCommitPro');
const apiKey = config.get('apiKey', '');
```

**Explicación:**
- `getConfiguration('aiCommitPro')`: Busca todas las settings que empiezan con `aiCommitPro.`
- `.get('apiKey', '')`: Lee `aiCommitPro.apiKey`, si no existe usa `''`

---

## 🐛 Debugging y Troubleshooting

### Cómo hacer debug de la extensión

1. **Abrir el proyecto en VS Code**
2. **Presionar F5**
   - Abre nueva ventana con la extensión cargada
3. **En la ventana original:**
   - Ve a `View → Output`
   - Selecciona `Log (Extension Host)`
   - Aquí verás los `console.log()` y errores

### Agregar logs para debugging

```typescript
// En cualquier parte del código
console.log('DEBUG: Diff obtenido:', diff);
console.error('ERROR:', error);
```

Estos logs aparecerán en **Output → Log (Extension Host)**.

### Breakpoints

1. Click en el margen izquierdo del editor (aparece punto rojo)
2. F5 para ejecutar
3. Cuando llegue al breakpoint, se pausará
4. Puedes inspeccionar variables, ejecutar paso a paso, etc.

### Problemas comunes

#### "No staged changes"
**Causa:** No hay archivos en `git add`
**Solución:**
```bash
git add .
```

#### "API key not configured"
**Causa:** No pusiste tu API key en Settings
**Solución:**
- `Ctrl+,` → Buscar "AI Commit Pro" → Pegar API key

#### "Error calling Claude API"
**Posibles causas:**
- API key inválida
- Sin créditos en Anthropic
- Problemas de internet
- Rate limit

**Debug:**
```typescript
catch (error: any) {
  console.error('Full error:', JSON.stringify(error, null, 2));
  throw error;
}
```

---

## 📚 Recursos Adicionales

### Para aprender más sobre VS Code Extensions

- [Official VS Code Extension Guide](https://code.visualstudio.com/api)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### Para aprender más sobre Claude API

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- [API Reference](https://docs.anthropic.com/en/api/messages)

### Para aprender más sobre Git

- [simple-git Documentation](https://github.com/steveukx/git-js)
- [Git Official Docs](https://git-scm.com/doc)

---

## 🎓 Ejercicios para Practicar

### Nivel Básico

1. **Cambiar el modelo de IA:**
   - Modifica el código para usar Sonnet en lugar de Haiku
   - Compara los resultados

2. **Agregar un nuevo setting:**
   - Agregar `maxTokens` configurable
   - Leerlo desde `config.ts`
   - Usarlo en `anthropic.ts`

3. **Mejorar el system prompt:**
   - Experimenta con diferentes instrucciones
   - Prueba agregar más contexto

### Nivel Intermedio

4. **Agregar longitud del commit configurable:**
   - Setting: `short`, `medium`, `long`
   - Ajustar `max_tokens` según la opción

5. **Mostrar tiempo de respuesta:**
   - Medir cuánto tarda Claude
   - Mostrarlo en la notificación

6. **Agregar caché de commits:**
   - Guardar últimos 5 commits generados
   - Mostrar opción de reusar

### Nivel Avanzado

7. **Soporte para múltiples repositorios:**
   - Detectar si hay múltiples repos abiertos
   - Permitir al usuario elegir

8. **Historial de commits generados:**
   - Guardar en workspace state
   - Mostrar en un panel custom

9. **Integración con Conventional Commits:**
   - Validar que el formato sea correcto
   - Agregar autocompletado de tipos

---

## ✅ Checklist de Comprensión

Después de leer este documento, deberías poder responder:

- [ ] ¿Qué hace cada archivo en `src/`?
- [ ] ¿Cómo se comunica la extensión con Claude API?
- [ ] ¿Cómo lee la extensión los cambios de Git?
- [ ] ¿Cómo se registra un comando en VS Code?
- [ ] ¿Dónde se configura la API key del usuario?
- [ ] ¿Qué es un `system prompt` y para qué sirve?
- [ ] ¿Cómo hacer debug de la extensión?
- [ ] ¿Qué hace `temperature` en la API de Claude?
- [ ] ¿Por qué truncamos el diff antes de enviarlo a Claude?
- [ ] ¿Cómo insertamos el mensaje en el input box de Git?

Si puedes responder todas, ¡entiendes la arquitectura completa! 🎉

---

**Documentación creada:** Diciembre 2025
**Versión de la extensión:** 0.0.1
**Autor:** Juan Solórzano (JD Solutions Inc.)