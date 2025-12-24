# Instrucciones de Prueba - AI Commit Pro v0.0.2

## 🚀 Cómo Probar la Extensión

### 1. **Abrir Extension Development Host**
- Presiona `F5` en VS Code
- Se abrirá una nueva ventana con la extensión activada

### 2. **Configurar la Extensión**
- Abre `Settings` (Ctrl+,)
- Busca "AI Commit Pro"
- Configura tu API Key de Anthropic en `aiCommitPro.apiKey`
  - Obtén una API key en: https://console.anthropic.com/settings/keys

### 3. **Ubicar la Vista en el Sidebar**
- En la ventana de desarrollo, abre un proyecto Git
- En el panel izquierdo, busca la vista **"AI Commit Pro"** en Source Control
- Deberías ver:
  - ✅ Estado actual (sin cambios o cambios pendientes)
  - 📍 Rama actual
  - 📝 Archivos sin stage (si los hay)
  - ✅ Archivos staged (si los hay)
  - 🔀 Selector de ramas locales y remotas

### 4. **Probar el Flujo Completo**

#### Paso A: Hacer cambios en archivos
- Modifica algunos archivos en tu proyecto de prueba

#### Paso B: Hacer stage de archivos
- En el TreeView, expande la sección **"📝 Sin stage (N)"**
- Haz clic derecho sobre un archivo
- Selecciona **"Stage File"**
- El archivo se moverá a la sección **"✅ Staged (N)"**

#### Paso C: Generar mensaje de commit con AI
- Asegúrate de tener archivos staged
- Presiona `Ctrl+Shift+C` (o usa el comando desde el Command Palette)
- La IA generará un mensaje de commit automático en español

#### Paso D: Confirmar el commit
- Acepta el mensaje generado
- El commit se creará automáticamente

#### Paso E: Hacer push (NUEVA FUNCIONALIDAD)
- **Si hay rechazo remoto**: La extensión ahora hace automáticamente `git pull` y luego `git push`
- **Si es una rama nueva**: La extensión establece automáticamente el upstream (`--set-upstream origin branch`)
- Los cambios se sincronizarán con GitHub

### 5. **Probar Cambio de Rama**
- En el TreeView, expande la sección **"🔀 Ramas"**
- Verás dos subsecciones:
  - **Ramas locales** (con ● para la rama actual)
  - **Ramas remotas** (con ▻ para indicar remota)
- Haz clic derecho sobre una rama
- Selecciona **"Switch to Branch"**
- La rama actual cambará automáticamente

## ✅ Checklist de Prueba

- [ ] La vista "AI Commit Pro" aparece en Source Control sidebar
- [ ] El estado se muestra correctamente (✅ Sin cambios o 📝 con cambios)
- [ ] Puedo hacer stage de archivos con clic derecho
- [ ] Puedo hacer unstage de archivos con clic derecho
- [ ] El comando `Ctrl+Shift+C` genera mensajes con IA
- [ ] El commit se crea correctamente
- [ ] El push funciona sin errores (incluso con ramas nuevas)
- [ ] Si hay rechazo remoto, se hace pull automáticamente
- [ ] Puedo cambiar de rama desde el selector
- [ ] El TreeView se actualiza después de cada operación

## 🐛 Problemas Conocidos y Soluciones

### Problema: "La extensión no aparece en el sidebar"
**Solución**: 
- Asegúrate de que tienes un repositorio Git abierto
- La vista solo aparece cuando `scmProvider == git`
- Reinicia VS Code (Ctrl+Shift+P > "Reload Window")

### Problema: "El push falla con 'fetch first'"
**Solución**: 
- CORREGIDO en esta versión
- La extensión ahora hace automáticamente `git pull` antes de `git push`
- No necesitas hacer nada, funcionará automáticamente

### Problema: "No puedo hacer push en rama nueva"
**Solución**: 
- CORREGIDO en esta versión
- La extensión establece automáticamente `--set-upstream origin branch`
- Solo presiona el botón de push

### Problema: "El API Key no está siendo leído"
**Solución**:
- Abre Settings (Ctrl+,)
- Busca "aiCommitPro.apiKey"
- Asegúrate de haber guardado la key (Enter después de pegarla)
- Recarga la extensión (Ctrl+Shift+P > "Reload Window")

## 📝 Notas Importantes

1. **Los cambios de la v0.0.2**:
   - ✅ Manejo automático de pull cuando el push es rechazado
   - ✅ Mejor visualización del estado en el TreeView
   - ✅ Nombre actualizado de la vista a "AI Commit Pro"

2. **Requisitos**:
   - VS Code v1.85.0 o superior
   - API Key de Anthropic válido
   - Repositorio Git inicializado

3. **Próximas mejoras planeadas**:
   - Historia de commits recientes
   - Vista previa del diff
   - Configuración por repositorio
