# Verified Repositories — Starter Pack

Семь проверенных репозиториев с хорошо задокументированными практиками и скиллами. Используй эти как отправную точку в Фазе 3 инициализации (`ai/workflows/initialize-project.md`).

Каждый репозиторий включает конкретные скиллы, которые можно адаптировать для вашего проекта.

---

## 1. **andrej-karpathy-skills** — ML/AI Workflows
**Repo**: https://github.com/multica-ai/andrej-karpathy-skills

**Домен**: Machine Learning, AI, Data Science  
**Когда использовать**: Проекты с ML моделями, экспериментами, evaluation

**Ключевые скиллы**:
- Structure an ML experiment (data → train → eval → iterate)
- Evaluate model performance (metrics, baselines, error analysis)
- Version control for models and datasets
- Hyperparameter tuning workflows
- Experiment tracking and reproducibility

**Fit для новых проектов**: ⭐⭐⭐⭐⭐  
**Effort to implement**: Low (2-3 дня базовой версии)

**Как использовать**: Скопируй структуру папок для экспериментов, адаптируй чек-листы для твоей задачи.

---

## 2. **cookiecutter-data-science** — Data Project Template
**Repo**: https://github.com/drivendata/cookiecutter-data-science

**Домен**: Data Science, Data Engineering  
**Когда использовать**: Любой проект с данными (ELT, анализ, ML)

**Ключевые скиллы**:
- Standardized folder structure for data projects
- Makefile automation (install deps, train, predict)
- Environment management (.env, requirements.txt)
- Documentation standards (notebooks, markdown)
- Reproducible workflows (data versioning, artifact management)

**Fit для новых проектов**: ⭐⭐⭐⭐⭐  
**Effort to implement**: Very Low (1 день — это просто template)

**Как использовать**: `cookiecutter https://github.com/drivendata/cookiecutter-data-science` или вручную скопируй структуру.

---

## 3. **Vercel Next.js Best Practices** — Frontend/Full-Stack
**Repo**: https://github.com/vercel/next.js (и документация в `/examples`)

**Домен**: React, Next.js, Full-stack Web Apps  
**Когда использовать**: Web приложения, SPA, SSR приложения

**Ключевые скиллы**:
- File-based routing and layouts (App Router)
- Server Components vs Client Components decision tree
- Data fetching patterns (server vs client)
- API routes and edge functions
- Performance optimization (images, fonts, code splitting)
- Testing patterns (unit, integration, e2e)

**Fit для новых проектов**: ⭐⭐⭐⭐⭐  
**Effort to implement**: Medium (3-4 дня настройки + обучение)

**Как использовать**: Читай `/examples` для pattern'ов, адаптируй под твой stack.

---

## 4. **Google Python Style Guide** — Code Standards
**Repo**: https://github.com/google/styleguide (Python, JavaScript, Shell sections)

**Домен**: Code Style, Best Practices (все языки)  
**Когда использовать**: Любой проект с кодом (язык не важен)

**Ключевые скиллы**:
- Naming conventions (variables, functions, classes)
- Documentation standards (docstrings, comments)
- Type hints and validation
- Testing structure
- Error handling patterns
- Code review guidelines

**Fit для новых проектов**: ⭐⭐⭐⭐  
**Effort to implement**: Low (1 день — это просто reference)

**Как использовать**: Добавь ссылку в `CLAUDE.md`, используй как reference при code review.

---

## 5. **Kubernetes Examples** — Infrastructure & DevOps
**Repo**: https://github.com/kubernetes/examples

**Домен**: Containers, Orchestration, DevOps, Cloud  
**Когда использовать**: Проекты с микросервисами, контейнеризацией, cloud deployment

**Ключевые скиллы**:
- Dockerfile best practices
- Kubernetes manifests (Deployment, Service, ConfigMap)
- Health checks and probes
- Resource management (CPU, memory limits)
- Networking and service discovery
- Monitoring and logging setup

**Fit для новых проектов**: ⭐⭐⭐⭐  
**Effort to implement**: Medium (4-5 дней настройки инфры)

**Как использовать**: Копируй примеры для твоего контейнера, адаптируй manifests.

---

## 6. **Microsoft VS Code Extension Samples** — Developer Tools
**Repo**: https://github.com/microsoft/vscode-extension-samples

**Домен**: VS Code Extensions, IDE Tools, Developer Experience  
**Когда использовать**: Проекты, которые нужны как IDE extension или tool

**Ключевые скиллы**:
- Extension project structure (package.json, tsconfig)
- Command palette and keybindings
- Sidebar UI components
- Webview for custom UI
- Language server integration
- Publishing to marketplace

**Fit для новых проектов**: ⭐⭐⭐ (специфичный домен)  
**Effort to implement**: High (1-2 недели, если это твой домен)

**Как использовать**: Используй как template, если строишь extension. Иначе пропусти.

---

## 7. **Anthropic Cookbook** — AI/LLM Applications
**Repo**: https://github.com/anthropics/anthropic-cookbook

**Домен**: LLM Applications, AI Workflows, Agents  
**Когда использовать**: Проекты с Claude API, RAG, agents, prompting

**Ключевые скиллы**:
- Prompt engineering patterns
- Function calling (tool use) workflows
- Streaming and token counting
- RAG (Retrieval-Augmented Generation) implementations
- Agent and agentic loop patterns
- Vision and multimodal handling

**Fit для новых проектов**: ⭐⭐⭐⭐⭐  
**Effort to implement**: Low-Medium (2-4 дня для basic RAG/agent)

**Как использовать**: Копируй примеры, адаптируй под твой use case.

---

## Как Использовать Этот Лист

### В Фазе 3 Инициализации:

1. **Найди свой домен** в списке выше:
   - ML/Data? → andrej-karpathy-skills + cookiecutter-data-science
   - Web app? → Vercel Next.js + Google styleguide
   - DevOps? → Kubernetes examples
   - IDE tool? → VS Code samples
   - LLM app? → Anthropic cookbook

2. **Оцени fit-score** для каждого:
   - 5 = Решает критическую задачу, низкий effort
   - 4 = Важно, но можно отложить
   - 3 = Полезно, но не блокирует

3. **Создай SKILLS_REVIEW.md** со своей оценкой:
   ```
   | Repository | Domain | Fit | Effort | Phase |
   | andrej-karpathy-skills | ML | 5 | 2 дня | Phase 0 |
   | Google styleguide | Code | 4 | 1 день | Phase 0 |
   ```

4. **Реализуй в порядке:**
   - Phase 0 (сейчас): Критические скиллы
   - Phase 1 (MVP): Core functionality
   - Phase 2+ (после): Polish и scale

---

## Критерии Верификации

Каждый репозиторий в этом списке:

- ✅ **Активно поддерживается** (обновления в последние 3 месяца)
- ✅ **Хорошо задокументирован** (README, примеры, wiki)
- ✅ **Проверен на практике** (использован в реальных проектах)
- ✅ **Адаптируем** (не требует полной переписи твоего кода)
- ✅ **Масштабируем** (работает от MVP до production)

---

## Добавить Новый Репозиторий?

Если нашел полезный репозиторий для добавления в этот лист:

1. Убедись, что он соответствует критериям верификации выше
2. Напиши short summary (домен, ключевые скиллы, fit-score)
3. Создай PR с добавлением в этот файл

Цель: держать этот список из **проверенных, действительно полезных** репозиториев, а не просто длинного списка всего подряд.

---

## Связанные Файлы

- `ai/workflows/initialize-project.md` — Полный workflow инициализации (Фаза 3)
- `ai/methods/skills-discovery.md` — Как оценивать скиллы и репозитории
- `examples/SKILLS_REVIEW_example.md` — Пример заполненной SKILLS_REVIEW.md
