# Шаблон AI-проекта

Минимальная структура для software, контента, исследований и операционных
систем. Начните с [RULES.md](RULES.md), затем заполните
[PROJECT.md](PROJECT.md) и [ai/context.md](ai/context.md).

## Первые шаги

1. Опишите результат и границы в [PROJECT.md](PROJECT.md).
2. Создайте первую задачу в `intent/` по
   [templates/intent.md](templates/intent.md).
3. Для изменения ПО используйте
   [software-change.md](ai/workflows/software-change.md).
4. Если задача основана на пополняемом знании, следуйте
   [compile-knowledge.md](ai/workflows/compile-knowledge.md).
5. Если она улучшает систему итерациями, следуйте
   [gauntlet-loop.md](ai/workflows/gauntlet-loop.md).

## Жизненный цикл изменения ПО

```text
intent/<change>/intent.md
  → docs/spec/<scope>/spec.md
  → docs/plan/<change>/plan.md
  → код + тесты + diff
```

`spec` и `plan` — деревья: входной файл даёт карту, а подробности по модулям
при необходимости размещаются в подпапках.

## Индекс

| Что искать | Владелец или вход |
| --- | --- |
| Правила работы | [RULES.md](RULES.md) |
| Цель и границы проекта | [PROJECT.md](PROJECT.md) |
| Полная карта файлов | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) |
| Устойчивый контекст | [ai/context.md](ai/context.md) |
| Намерения и задачи | [intent/](intent/) |
| Требования и целевая архитектура | [docs/spec/](docs/spec/README.md) |
| Планы реализации | [docs/plan/](docs/plan/README.md) |
| Методы | [ai/methods/](ai/methods/) |
| Исполнимые процедуры | [ai/skills/](ai/skills/) |
| Многошаговые процессы | [ai/workflows/](ai/workflows/) |
| Шаблоны артефактов | [templates/](templates/) |

Полная карта, границы ролей и правила роста находятся в
[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).
