# 📘 AI Commit Pro - Guía de Usuario

## 🎯 ¿Qué es AI Commit Pro?

**AI Commit Pro** es una extensión de Visual Studio Code que usa **Inteligencia Artificial** para escribir tus mensajes de commit automáticamente.

### ¿Para qué sirve?

En lugar de pensar qué escribir en cada commit, la IA lo hace por ti:

**ANTES:**
```
git add .
git commit -m "fix stuff"  ← 😓 Mensaje vago
```

**AHORA:**
```
git add .
Ctrl+Shift+C               ← ✨ IA genera el mensaje
git commit                 ← ✅ Mensaje profesional listo
```

---

## 🚀 Instalación

### Opción A: Desde VS Code Marketplace (Cuando esté publicada)

1. Abre VS Code
2. Ve a Extensions (`Ctrl+Shift+X`)
3. Busca: **"AI Commit Pro"**
4. Click en **Install**

### Opción B: Desde archivo .vsix (Durante desarrollo)

1. Descarga el archivo `.vsix`
2. Abre VS Code
3. `Ctrl+Shift+P` → Escribe: **"Install from VSIX"**
4. Selecciona el archivo descargado

---

## ⚙️ Configuración Inicial

### Paso 1: Obtener API Key de Anthropic

1. **Crea una cuenta en Anthropic:**
   - Ve a: https://console.anthropic.com
   - Sign up (es gratis, dan $5 de crédito)

2. **Genera tu API Key:**
   - Ve a: https://console.anthropic.com/settings/keys
   - Click en **"Create Key"**
   - Copia la key (empieza con `sk-ant-...`)
   - ⚠️ **Guárdala en un lugar seguro** - no la podrás ver de nuevo

### Paso 2: Configurar la extensión en VS Code

1. **Abrir Settings:**
   - `Ctrl+,` (o `Cmd+,` en Mac)
   - O: `File → Preferences → Settings`

2. **Buscar la extensión:**
   - En el buscador, escribe: **"AI Commit Pro"**

3. **Configurar los ajustes:**

   | Setting | Descripción | Valor recomendado |
   |---------|-------------|-------------------|
   | **Api Key** | Tu API key de Anthropic | `sk-ant-...` (tu key) |
   | **Model** | Modelo de IA a usar | `claude-3-5-haiku-20241022` ✅ |
   | **Language** | Idioma de los commits | `spanish` o `english` |

**Ejemplo de configuración:**
```
AI Commit Pro: Api Key
[sk-ant-api03-xxxxxxxxxxxxx]

AI Commit Pro: Model
[claude-3-5-haiku-20241022]

AI Commit Pro: Language
[spanish]
```

---

## 📖 Cómo Usar

### Método 1: Con Shortcut (Más rápido ⚡)

1. Haz cambios en tu código
2. Stagea los archivos: `git add .`
3. Presiona **`Ctrl+Shift+C`** (o `Cmd+Shift+C` en Mac)
4. ¡El mensaje aparece automáticamente en el input box de Git!
5. Revisa el mensaje (puedes editarlo si quieres)
6. Haz commit: Click en el botón ✓ o `git commit`

### Método 2: Desde Command Palette

1. Haz cambios en tu código
2. Stagea: `git add .`
3. Presiona **`Ctrl+Shift+P`**
4. Escribe: **"AI Commit"**
5. Selecciona: **"AI Commit: Generate Commit Message"**
6. El mensaje aparece en el input box

### Método 3: Desde el panel de Git

1. Ve al panel de **Source Control** (icono de Git en la barra lateral)
2. Stagea tus cambios
3. Busca el ícono ✨ **sparkle** en la barra superior del panel
4. Click en el ícono
5. El mensaje se genera automáticamente

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Agregar nueva funcionalidad

**Cambios que hiciste:**
```javascript
// Agregaste una nueva función en utils.js
export function formatDate(date) {
  return date.toLocaleDateString('es-ES');
}
```

**Comando:**
```bash
git add utils.js
# Ctrl+Shift+C
```

**Mensaje generado por IA:**
```
feat: agregar función de formateo de fechas

Implementa formatDate para convertir objetos Date a formato español localizado
```

---

### Ejemplo 2: Corregir un bug

**Cambios que hiciste:**
```javascript
// Corregiste un bug en login.js
- if (password = correctPassword) {  // ❌ Bug
+ if (password === correctPassword) {  // ✅ Fix
```

**Comando:**
```bash
git add login.js
# Ctrl+Shift+C
```

**Mensaje generado por IA:**
```
fix: corregir comparación en validación de password

Cambia operador de asignación (=) a comparación estricta (===) en validación de login
```

---

### Ejemplo 3: Refactorizar código

**Cambios que hiciste:**
```javascript
// Refactorizaste una función larga en varias pequeñas
// Antes: 1 función de 100 líneas
// Ahora: 5 funciones de 20 líneas cada una
```

**Mensaje generado por IA:**
```
refactor: dividir función processData en funciones más pequeñas

Mejora legibilidad separando lógica en validateData, transformData, y saveData
```

---

## 🎨 Personalizando los Mensajes

### Cambiar el idioma

**En español:**
```
Settings → AI Commit Pro: Language → spanish
```

**Ejemplo:**
```
feat: agregar validación de email
```

**En inglés:**
```
Settings → AI Commit Pro: Language → english
```

**Ejemplo:**
```
feat: add email validation
```

---

### Elegir el modelo de IA

Hay 3 modelos disponibles:

| Modelo | Velocidad | Costo | Calidad | Recomendado para |
|--------|-----------|-------|---------|------------------|
| **Haiku** | ⚡⚡⚡ Muy rápido | 💰 Barato | ⭐⭐⭐ Bueno | Uso diario ✅ |
| **Sonnet** | ⚡⚡ Rápido | 💰💰 Medio | ⭐⭐⭐⭐ Muy bueno | Commits importantes |
| **Opus** | ⚡ Normal | 💰💰💰 Caro | ⭐⭐⭐⭐⭐ Excelente | Proyectos críticos |

**Recomendación:** Usa **Haiku** para el día a día. Es rápido, barato y genera mensajes excelentes.

---

## 🔧 Solución de Problemas

### ❌ "Anthropic API key not configured"

**Problema:** No configuraste tu API key.

**Solución:**
1. `Ctrl+,` → Busca "AI Commit Pro"
2. Pega tu API key en el campo **"Api Key"**
3. Guarda (la ventana se cierra automáticamente)

---

### ❌ "No staged changes found"

**Problema:** No hay archivos en staging area.

**Solución:**
```bash
git add .
# O selecciona archivos específicos
git add archivo1.js archivo2.js
```

**Verificar:**
```bash
git status
```

Deberías ver:
```
Changes to be committed:
  modified:   archivo1.js
```

---

### ❌ "Error calling Claude API"

**Posibles causas y soluciones:**

**1. API Key inválida**
- Verifica que copiaste bien la key
- Debe empezar con `sk-ant-`

**2. Sin créditos**
- Ve a: https://console.anthropic.com/settings/billing
- Verifica que tengas crédito disponible
- Anthropic da $5 gratis al crear cuenta

**3. Problemas de internet**
- Verifica tu conexión
- Intenta de nuevo en unos segundos

**4. Rate limit**
- Has hecho demasiadas peticiones muy rápido
- Espera 1 minuto e intenta de nuevo

---

### ❌ El mensaje generado no me gusta

**No hay problema, puedes:**

**Opción 1: Editar manualmente**
- El mensaje aparece en el input box
- Edítalo como quieras
- Haz commit normalmente

**Opción 2: Generar otro**
- `Ctrl+Shift+C` de nuevo
- Genera un nuevo mensaje (puede ser diferente)

**Opción 3: Cambiar el modelo**
- Si usas Haiku, prueba con Sonnet
- Los modelos más avanzados son más descriptivos

---

### ❌ Los mensajes son muy largos/cortos

**Actualmente:** No es configurable (estamos trabajando en eso).

**Workaround:**
- Si son muy largos → Edítalos manualmente
- Si son muy cortos → Usa modelo Sonnet en lugar de Haiku

---

## 💰 Costos de Uso

### ¿Cuánto cuesta usar la extensión?

**La extensión es GRATIS**, pero la API de Anthropic tiene costo:

| Modelo | Costo por millón de tokens | Commits aproximados | Costo por commit |
|--------|----------------------------|---------------------|------------------|
| **Haiku** | $1 USD | ~2,000 commits | $0.0005 (medio centavo) |
| **Sonnet** | $3 USD | ~2,000 commits | $0.0015 (1.5 centavos) |
| **Opus** | $15 USD | ~2,000 commits | $0.0075 (7.5 centavos) |

### Crédito gratis inicial

Anthropic da **$5 USD gratis** al crear cuenta.

Con **Haiku** (recomendado):
- $5 = ~10,000 commits
- Si haces 20 commits/día = **500 días de uso gratis**

### ¿Cuándo necesito pagar?

Solo cuando gastes los $5 iniciales. Puedes:
1. Agregar una tarjeta en: https://console.anthropic.com/settings/billing
2. Configurar límites de gasto (ej: máximo $10/mes)

---

## 🎓 Mejores Prácticas

### ✅ DO - Haz esto:

**1. Stagea cambios relacionados juntos**
```bash
# Bueno: Cambios relacionados
git add authentication.js login.js
# Ctrl+Shift+C
# → "feat: implementar autenticación de usuarios"
```

**2. Haz commits pequeños y frecuentes**
- Mejor: 5 commits pequeños
- Peor: 1 commit gigante con todo

**3. Revisa el mensaje antes de commitear**
- La IA es muy buena, pero no perfecta
- Lee el mensaje, edita si es necesario

**4. Usa mensajes en el mismo idioma que tu equipo**
- Si tu equipo usa español → Settings: spanish
- Si tu equipo usa inglés → Settings: english

---

### ❌ DON'T - Evita esto:

**1. No stagees cambios no relacionados**
```bash
# Malo: Mezclar diferentes features
git add login.js styles.css database.sql
# → Mensaje confuso
```

**2. No dependas 100% de la IA sin revisar**
- Siempre lee el mensaje
- La IA puede malinterpretar cambios complejos

**3. No uses siempre el mismo modelo por defecto**
- Commits importantes → Usa Sonnet
- Commits normales → Usa Haiku

---

## 🔐 Seguridad y Privacidad

### ¿Qué datos se envían a Anthropic?

Cuando usas la extensión, se envía:
- ✅ Los archivos modificados (nombres)
- ✅ El diff de los cambios (qué cambió)
- ✅ Tus últimos 10 mensajes de commit (para contexto)

**NO se envía:**
- ❌ Tu código completo
- ❌ Archivos no modificados
- ❌ Tu API key (solo se usa localmente)
- ❌ Información personal

### ¿Es seguro?

- ✅ La comunicación es encriptada (HTTPS)
- ✅ Anthropic no entrena modelos con tus datos (según sus políticas)
- ✅ Tu API key se guarda solo en tu computadora

### Recomendaciones

**Si trabajas en proyectos confidenciales:**
1. Revisa el diff antes de generar
2. No stagees archivos con información sensible
3. Lee la política de privacidad de Anthropic: https://www.anthropic.com/privacy

---

## 📊 Formato de Mensajes (Conventional Commits)

La extensión genera mensajes siguiendo **Conventional Commits**, un estándar popular:

### Estructura

```
<type>: <subject>

<body (opcional)>
```

### Tipos de commits

| Type | Cuándo usarlo | Ejemplo |
|------|---------------|---------|
| `feat` | Nueva funcionalidad | `feat: agregar búsqueda de usuarios` |
| `fix` | Corrección de bug | `fix: corregir error en login` |
| `docs` | Cambios en documentación | `docs: actualizar README` |
| `style` | Formato, espacios, etc. | `style: formatear código con prettier` |
| `refactor` | Refactorización | `refactor: simplificar función de validación` |
| `perf` | Mejora de performance | `perf: optimizar consulta de base de datos` |
| `test` | Agregar tests | `test: agregar tests para auth` |
| `chore` | Tareas de mantenimiento | `chore: actualizar dependencias` |

---

## 🎯 Casos de Uso Reales

### Caso 1: Desarrollador Solo

**Situación:** Trabajas en tu proyecto personal.

**Beneficio:**
- Commits profesionales sin esfuerzo
- Histórico de cambios claro
- Fácil de revisar después

**Uso recomendado:**
- Modelo: Haiku
- Idioma: El que prefieras
- Frecuencia: Cada commit

---

### Caso 2: Equipo de Desarrollo

**Situación:** Trabajas con 3-5 developers.

**Beneficio:**
- Todos usan el mismo formato
- Code reviews más fáciles
- Git history profesional

**Uso recomendado:**
- Modelo: Haiku para commits normales, Sonnet para PRs importantes
- Idioma: El que use el equipo (generalmente inglés)
- Convención: Acordar editar si el mensaje no refleja exactamente el cambio

---

### Caso 3: Proyecto Open Source

**Situación:** Contribuyes a proyectos en GitHub.

**Beneficio:**
- Mensajes de alta calidad
- Siguen las convenciones del proyecto
- Maintainers contentos 😊

**Uso recomendado:**
- Modelo: Sonnet (mejor calidad)
- Idioma: English (estándar en OSS)
- Extra: Revisar siempre antes de hacer push

---

## ❓ Preguntas Frecuentes (FAQ)

### ¿Necesito internet para usar la extensión?

**Sí.** La extensión se comunica con la API de Claude en la nube.

---

### ¿Funciona con otros sistemas de control de versiones?

**No.** Solo funciona con Git (por ahora).

---

### ¿Puedo usar mi propia API key de OpenAI en lugar de Anthropic?

**No en esta versión.** La extensión está diseñada específicamente para Claude API. Si quieres usar OpenAI, tendrías que modificar el código.

---

### ¿La extensión aprende de mis commits anteriores?

**Sí y no.**
- ✅ Cada vez que generas un mensaje, la IA ve tus últimos 10 commits para imitar el estilo
- ❌ No hay "aprendizaje" persistente entre sesiones

---

### ¿Puedo usar esto en el trabajo?

**Depende de tu empresa:**
1. Verifica si está permitido usar servicios de IA externos
2. Lee la política de privacidad de Anthropic
3. Si trabajas con código confidencial, consulta con tu equipo/legal

**Alternativa segura:** Usa solo en proyectos personales/open source.

---

### ¿Qué pasa si no tengo más crédito?

La extensión mostrará un error: **"Error calling Claude API"**

**Soluciones:**
1. Agrega crédito en: https://console.anthropic.com/settings/billing
2. Configura un límite de gasto para evitar sorpresas
3. Mientras tanto, escribe commits manualmente

---

### ¿Puedo compartir mi API key con mi equipo?

**NO RECOMENDADO.**
- Cada persona debería tener su propia key
- Así controlas tus gastos
- Evitas problemas de rate limits

**Alternativa:** Si quieren compartir costos, creen una cuenta de equipo en Anthropic.

---

## 🆘 Soporte

### ¿Tienes problemas o preguntas?

**1. Revisa esta guía primero**
- La mayoría de problemas están cubiertos en "Solución de Problemas"

**2. Revisa GitHub Issues**
- Tal vez alguien más tuvo el mismo problema
- URL: [Cuando esté publicado]

**3. Abre un nuevo Issue**
- Describe el problema
- Incluye el mensaje de error (si hay)
- Especifica tu versión de VS Code

**4. Contacto directo**
- Email: juan.solorzano19@gmail.com
- LinkedIn: https://www.linkedin.com/in/juan-andr%C3%A9s-solorzano-sosa-bb9839214/

---

## 🚀 Próximas Funcionalidades

Estamos trabajando en:

- ⏳ Configurar longitud de commits (corto/medio/largo)
- ⏳ Soporte para otros modelos de IA (OpenAI, Google)
- ⏳ Historial de commits generados
- ⏳ Sugerencias de mejora para commits viejos
- ⏳ Templates personalizados por proyecto
- ⏳ Integración con JIRA/Linear (auto-link de tickets)

**¿Tienes sugerencias?** Abre un Issue en GitHub!

---

## 📄 Licencia

[MIT License / Especificar cuando esté publicado]

---

## 🙏 Agradecimientos

- **Anthropic** - Por crear Claude, una IA increíble
- **VS Code Team** - Por la excelente API de extensiones
- **Contributors** - [Lista cuando haya]
- **Beta Testers** - [Lista cuando haya]

---

## 📚 Recursos Adicionales

### Para aprender más sobre Conventional Commits
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Why Use Conventional Commits](https://www.freecodecamp.org/news/how-to-write-better-git-commit-messages/)

### Para aprender más sobre Claude
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude API Pricing](https://www.anthropic.com/pricing)

### Para aprender más sobre Git
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [How to Write Good Commit Messages](https://chris.beams.io/posts/git-commit/)

---

**¡Gracias por usar AI Commit Pro!** 🎉

Si te gusta la extensión, considera:
- ⭐ Darle una star en GitHub
- 📝 Dejar una review en VS Code Marketplace
- 🐦 Compartirla en redes sociales
- ☕ [Buy me a coffee] (opcional, cuando esté disponible)

---

**Versión de la guía:** 1.0  
**Última actualización:** Diciembre 2025  
**Versión de la extensión:** 0.0.1