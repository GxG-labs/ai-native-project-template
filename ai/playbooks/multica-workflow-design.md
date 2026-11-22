# Проектирование пошагового workflow в Multica

## Назначение

Используйте этот playbook, когда несколько агентов должны выполнять не
свободную работу «сквадом», а фиксированный процесс из последовательных шагов.
Главный результат — воспроизводимый workflow, в котором видны порядок шагов,
передача артефактов, отдельные runs и точки человеческого решения.

## Главный принцип

Squad отвечает за состав команды и стабильный протокол взаимодействия.
Workflow отвечает за конкретный процесс.
Skill отвечает за выполнение отдельного типа работы.

Не прячьте порядок восьми шагов в prompt лидера или в описании squad. Порядок,
зависимости и контракты должны быть отдельным workflow-артефактом.

## Слои ответственности

```text
Squad instructions
  -> кто входит в команду и как действует координация

Leader instructions
  -> как создать следующий child issue и передать результат

workflow.yaml
  -> узлы, порядок, зависимости, агенты, политики и завершение

Skill
  -> как выполнить конкретный узел

Supporting files
  -> библиотеки, каталоги, рубрики, voice rules и маршрутизация

Run artifacts
  -> фактические результаты конкретного запуска
```

Если процесс должен быть пошаговым, parent issue является контейнером
координации, а каждый workflow node становится отдельной видимой child issue и
отдельным agent run.

## Формат workflow

Исполняемую логику храните в YAML. Markdown рядом с ним объясняет смысл,
границы и rationale, но не является вторым источником порядка шагов.

Минимальная структура:

```yaml
id: content-pipeline
version: 1

input:
  required:
    - source_material
    - tenant
    - locale

nodes:
  - id: research
    agent: researcher
    inputs:
      - source_material
    outputs:
      - research.md

  - id: draft
    agent: writer
    skill: content-writer
    depends_on: [research]
    inputs:
      - research.md
      - tenant_config
    outputs:
      - draft.md

  - id: review
    agent: reviewer
    depends_on: [draft]
    inputs:
      - draft.md
    outputs:
      - review.yaml
    policy:
      on_fail: create_revision_node

completion:
  required:
    - review.approved
```

## Передача артефактов

Не передавайте весь контекст вслепую на каждый шаг. Для каждого артефакта
укажите:

- кто его создаёт;
- какие шаги его используют;
- формат и схему;
- обязательность;
- можно ли изменять исходный файл или только создавать новую версию;
- где он сохраняется;
- критерий готовности.

Артефакт, который нужен всем шагам, объявляется workflow-level input или
стабильным context artifact. Артефакт, нужный только нескольким шагам,
передаётся через явные `inputs` и `outputs` соответствующих nodes. Не делайте
его глобальным только ради удобства.

Пример карты:

```text
source.md ────────────────> research -> draft -> review -> publish
tenant-config.snapshot ──> research -> draft -> review -> publish
research.md ────────────────────────> draft -> review
review.yaml ─────────────────────────────────> publish
```

Каждый output должен иметь понятный контракт. «Результат шага» недостаточно:
следующий агент должен понимать, что именно он может прочитать и на что имеет
право опереться.

## Контракт child issue

Каждая child issue должна содержать:

1. цель только текущего шага;
2. входные артефакты и их версии;
3. ожидаемый output;
4. критерии готовности;
5. skill и supporting files;
6. правило эскалации или human approval;
7. ссылку на предыдущий node и следующий node.

Leader создаёт только готовые к выполнению child issues, ждёт завершения,
читает результат и только затем создаёт следующий шаг или revision issue.
После создания ready child issue лидер прекращает выполнение этого шага.

## Повторения, ошибки и approvals

Политика должна быть указана на уровне node:

```yaml
policy:
  on_fail: create_revision_node
  max_revisions: 2
  requires_human_approval: false
  retry:
    max_attempts: 2
```

Human-in-the-loop оформляется отдельной короткой child issue с префиксом
`HITL:`. Решение человека становится явным артефактом или статусом, а не
теряется в длинном комментарии лидера.

## Артефакты и историчность

Workflow должен фиксировать snapshot tenant-конфигурации и других входов,
которые могут измениться между runs. Простое правило: перед запуском целиком
скопировать выбранный `tenants/<tenant>/config/` в `run/config/`, а рядом
сохранить manifest с версиями, источниками и хэшами. После старта run его
входные snapshots не изменяются.

Не используйте selective resolution без необходимости: всё, что нужно запуску,
должно быть собрано в `config/`. Это позволяет обновлять skill, libraries или
tenant config для новых runs и одновременно понимать, на каких данных и
правилах был создан старый результат.

## Execution harness

Если процесс имеет обязательные действия, инварианты или внешние побочные
эффекты, workflow должен выполняться через execution harness. Harness — это не
только блокировка: он подготавливает окружение, вызывает детерминированные
операции, проверяет результат и переводит процесс в следующее состояние.

```text
input
  -> preflight
  -> deterministic setup
  -> agent/LLM step
  -> programmatic validation
  -> required action
  -> postcondition check
  -> state transition
  -> audit or recovery
```

Типовые операции harness:

- `prepare` — подготовить окружение и входы;
- `validate` — проверить схему, права и предусловия;
- `transform` — привести данные к контракту;
- `execute` — вызвать обязательную внешнюю операцию;
- `guard` — разрешить или запретить действие;
- `evaluate` — проверить результат правилами или оценкой;
- `transition` — изменить состояние workflow;
- `observe` — записать trace, версии и метрики;
- `recover` — выполнить retry, rollback или escalation.

LLM может сформировать intent, план или черновик. Harness обязан сам проверить
intent, выполнить разрешённые действия и зафиксировать последствия. Например,
для release-процесса он не только запрещает push в `main`, но и создаёт ветку,
назначает ID, запускает тесты, создаёт PR, дожидается checks, выполняет deploy,
проверяет health-check и запускает rollback при нарушении postcondition.

Эта модель применяется не только к deployment: также к контенту, data
pipelines, support, sales и любому процессу, где «агент сказал, что сделал» не
является доказательством выполнения.

## Язык harness и vendor adapters

Для общего harness выберите один основной язык реализации. Рекомендуемый
default — TypeScript:

```text
workflow definitions       YAML
policies and manifests      YAML or JSON
harness/control plane       TypeScript
vendor adapters              TypeScript
shell/CLI actions            external commands called by adapters
specialized data work       Python only when its ecosystem is required
```

TypeScript подходит как общий reference runtime для Codex, Claude, Pi, DeepSeek
Harness, Multica и Hermes: он может быть CLI или HTTP-сервисом, имеет строгие
типы для intent, policies, artifacts и results, и не привязывает workflow к
конкретному LLM vendor.

Агенты разных vendors не получают отдельную реализацию правил. Они формируют
vendor-neutral intent, который принимает один harness:

```text
Codex / Claude / Pi / DeepSeek / Multica / Hermes
  -> vendor-neutral intent
  -> TypeScript harness
  -> policy guards
  -> vendor/system adapter
  -> external action
```

Адаптеры могут различаться по способу запуска, но не должны менять смысл
policy, artifact contract или переходов workflow.

TypeScript harness не заменяет enforcement самой внешней системы. Запрет
прямого push в `main` дополнительно задаётся branch protection, обязательные
checks — в CI, а права на deploy — в системе деплоя. Harness координирует и
проверяет процесс, но критические ограничения должны действовать на границе,
которую нельзя обойти другим клиентом.

## Когда использовать другие форматы

- YAML — workflow, зависимости, policies и artifact contracts;
- Markdown — объяснение процесса, rationale и инструкции человеку;
- SKILL.md — повторяемая процедура конкретного узла;
- CSV — плоские библиотеки вариантов;
- YAML/JSON — сложные библиотеки и runtime-конфигурации;
- run manifest/lock — зафиксированный snapshot конкретного запуска.

## Антипаттерны

- весь процесс зашит в prompt лидера;
- squad сам решает порядок шагов в свободном диалоге;
- один run выполняет несколько разных workflow nodes;
- артефакты передаются только через длинную историю комментариев;
- следующий шаг читает живую конфигурацию вместо snapshot;
- reviewer silently исправляет результат без отдельного revision node;
- все артефакты объявлены глобальными независимо от области применения.

## Чеклист готовности

- [ ] workflow имеет версию и однозначный entry point;
- [ ] каждый node имеет agent, inputs, outputs и completion criteria;
- [ ] зависимости между nodes указаны явно;
- [ ] каждый node соответствует отдельной child issue/run;
- [ ] артефакты имеют владельца, формат и место хранения;
- [ ] определены retry, revision и approval policies;
- [ ] tenant/runtime-конфигурация зафиксирована snapshot-ом;
- [ ] старый run можно объяснить без чтения текущих live-файлов;
- [ ] workflow не дублирует логику skill или squad instructions.
