# 📋 Checklist de Testing - AI Commit Pro

## ✅ Tests Automatizados Completados

### Configuration Tests
- [x] getConfig retorna objeto válido
- [x] getConfig tiene valores por defecto correctos
- [x] isConfigured retorna boolean

### GitService Tests
- [x] GitService se instancia correctamente
- [x] getStagedDiff maneja caso sin cambios staged
- [x] getRecentCommits retorna array

### AIService Tests
- [x] AIService se instancia con config válido
- [x] generateCommitMessage maneja API key inválida

### Command Tests
- [x] Comando 'generateCommit' está registrado
- [x] Comando es ejecutable

### Integration Tests
- [x] Workflow completo con datos mock

---

## 🧪 Manual Testing Checklist

### Testing con Diferentes Repositorios

#### 1. Repositorio Simple (Archivos básicos)
- [ ] Proyecto con 1-3 archivos modificados
- [ ] Cambios en archivos .js/.ts
- [ ] Verificar mensaje generado es apropiado

#### 2. Repositorio con Múltiples Archivos
- [ ] 10+ archivos modificados
- [ ] Verificar que no hay timeout
- [ ] Verificar que el diff se trunca correctamente

#### 3. Repositorio Multi-Lenguaje
- [ ] Archivos .ts, .js, .json, .md mezclados
- [ ] Verificar que Claude entiende el contexto
- [ ] Mensaje debe reflejar cambios en todos los tipos

#### 4. Mono-Repo
- [ ] Múltiples proyectos en un workspace
- [ ] Selector de repo aparece
- [ ] Se inserta en el repo correcto

#### 5. Repo con Historia Extensa
- [ ] 100+ commits previos
- [ ] getRecentCommits funciona
- [ ] Contexto de commits mejora el mensaje

#### 6. Repo Nuevo (Sin Historia)
- [ ] Repositorio recién inicializado
- [ ] Sin commits previos
- [ ] Genera mensaje apropiado sin contexto

#### 7. Cambios Grandes (Refactor)
- [ ] Cambios en 20+ archivos
- [ ] Diff mayor a 3000 caracteres
- [ ] Se trunca correctamente
- [ ] Mensaje sigue siendo coherente

#### 8. Cambios Pequeños (Fix)
- [ ] 1 línea modificada
- [ ] Mensaje simple pero descriptivo
- [ ] Tipo correcto (fix, chore, etc.)

#### 9. Proyecto con Configuración
- [ ] Cambios en package.json, tsconfig.json
- [ ] Mensaje identifica tipo "chore"
- [ ] Describe el cambio de configuración

#### 10. Proyecto con Tests
- [ ] Cambios solo en archivos .test.ts
- [ ] Mensaje identifica tipo "test"
- [ ] Describe qué tests se agregaron/modificaron

---

## 🎯 Scenarios de Error

### API Errors
- [x] API Key inválida → Mensaje claro con link a configuración
- [ ] Rate limit excedido → Mensaje con sugerencia de esperar
- [ ] Sin internet → Mensaje de error de conexión
- [ ] Timeout de API → Retry habilitado

### Git Errors
- [x] No hay repositorio Git → Mensaje claro
- [x] Sin cambios staged → Sugerencia de usar git add
- [ ] Sin permisos en .git → Mensaje de error de permisos
- [ ] Repo corrupto → Error manejado gracefully

### User Errors
- [ ] API key vacía → Prompt para configurar
- [ ] Modelo inválido seleccionado → Fallback a default
- [ ] Configuración corrupta → Reset a defaults

---

## 🎨 UI/UX Testing

### Preview Panel
- [ ] Se abre correctamente
- [ ] Muestra mensaje generado
- [ ] Lista de archivos visible
- [ ] Contador de caracteres funciona
- [ ] Edición de texto funciona
- [ ] Botón "Aceptar" inserta mensaje
- [ ] Botón "Cancelar" cierra panel
- [ ] Botón "Copiar" copia al clipboard
- [ ] Atajos de teclado (Ctrl+Enter, Esc) funcionan
- [ ] Theme de VS Code se aplica correctamente

### Progress Indicators
- [ ] Barra de progreso aparece
- [ ] Mensajes por etapa se muestran
- [ ] Porcentaje de progreso es correcto
- [ ] No se puede cancelar (como esperado)

### Notifications
- [ ] Mensaje de éxito con emojis
- [ ] Botones de acción funcionan
- [ ] Error messages son claros
- [ ] Link a settings funciona

---

## ⚙️ Configuration Testing

### Settings
- [ ] apiKey se guarda correctamente
- [ ] model se cambia correctamente
- [ ] language (spanish/english) funciona
- [ ] showPreview true/false funciona
- [ ] maxRecentCommits respeta límite
- [ ] autoCopyToClipboard funciona

### Defaults
- [ ] Sin configuración usa valores por defecto
- [ ] Modelo default es Haiku
- [ ] Idioma default es español
- [ ] Preview está habilitado por defecto

---

## 🚀 Performance Testing

- [ ] Tiempo de respuesta < 5 segundos (Haiku)
- [ ] Tiempo de respuesta < 10 segundos (Sonnet)
- [ ] No hay memory leaks
- [ ] Múltiples ejecuciones consecutivas funcionan
- [ ] Extension no ralentiza VS Code

---

## 🔐 Security Testing

- [ ] API Key no se muestra en logs
- [ ] API Key no se envía a lugares incorrectos
- [ ] Diff no expone información sensible innecesariamente
- [ ] No hay XSS en webview panel

---

## 🌐 Cross-Platform Testing

### Windows
- [ ] Shortcut Ctrl+Shift+C funciona
- [ ] Paths con backslashes funcionan
- [ ] PowerShell compatible

### macOS
- [ ] Shortcut Cmd+Shift+C funciona
- [ ] Paths POSIX funcionan
- [ ] Terminal compatible

### Linux
- [ ] Shortcut Ctrl+Shift+C funciona
- [ ] Permissions correctos
- [ ] Different shells compatibles

---

## 📊 Results Summary

**Total Tests:** 10 automatizados + ~80 manuales
**Passing:** TBD
**Failing:** TBD
**Blocked:** TBD

**Date:** ___________
**Tester:** ___________
**Build:** v0.0.1

---

## 🐛 Bugs Encontrados

| ID | Descripción | Severidad | Status |
|----|-------------|-----------|--------|
| 1  | TBD         | TBD       | TBD    |

---

## ✨ Mejoras Sugeridas

1. TBD
2. TBD
3. TBD

---

**Notas:**
- Ejecutar `npm test` para tests automatizados
- Presionar F5 para Extension Development Host
- Usar workspace con múltiples repos para testing completo
