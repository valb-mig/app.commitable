# Commitable — Plano de Evolução

> Documento vivo. Atualizar conforme fases completadas.

---

## Diagnóstico Atual

| Área | Status |
|------|--------|
| Arquitetura | ✅ Boa — separação clara screens/hooks/components |
| Funcionalidades core | ⚠️ 60% — sync nunca chamado, widget limitado |
| Qualidade de código | ⚠️ Logs de debug no prod, código duplicado no widget |
| Testes | ❌ Nenhum |
| Notificações | ❌ Não implementado |
| Widget Android | ⚠️ Funciona mas mostra apenas 20 semanas e só o primeiro hábito |
| README | ⚠️ Incompleto |
| CI/CD | ❌ Nenhum |

---

## Fase 1 — Qualidade de Código (Imediato)

**Objetivo:** Limpar o que está errado sem alterar comportamento visível.

- [x] Remover todos os `console.log` de produção (`HomeScreen`, `CreateHabitScreen`, `useHabits`)
- [x] Adicionar `try/catch` no `syncConnector` com feedback de erro ao usuário
- [x] Validar formato de URL no campo conector antes de salvar
- [x] Remover `setTimeout` desnecessário no delete do `CreateHabitScreen`
- [x] Extrair números mágicos do widget Kotlin para constantes (`SQ_SIZE`, `SQ_GAP`, `NUM_WEEKS`)
- [x] Remover logs excessivos do `CommitGridWidget.kt` e `WidgetModule.kt`
- [x] Unificar geração de bitmap — `CommitGridWidget.buildBitmap()` companion object

---

## Fase 2 — Funcionalidades Quebradas (Alta Prioridade)

**Objetivo:** Fazer funcionar o que já está construído mas não funciona.

- [x] **Sync do Connector** — botão "sync connector" na `HomeScreen` quando hábito tem `connectorUrl`
- [x] **Loading state** — spinner durante sync
- [x] **Feedback de erro** — Alert com mensagem detalhada (HTTP status, formato inválido, rede)
- [x] **Widget — data range** — corrigido para 52 semanas (`NUM_WEEKS = 52`)
- [ ] **Widget — seleção de hábito** — salvar `habit_id` selecionado e sincronizar o hábito correto (não sempre o primeiro)

---

## Fase 3 — Notificações Push Locais

**Objetivo:** Lembrar o usuário de commitar seus hábitos diariamente.

- [x] Instalar `expo-notifications`
- [x] Criar `src/services/notifications.ts` — `scheduleDaily`, `cancelForHabit`, `requestPermission`, `cancelAll`
- [x] Step 4 no `CreateHabitScreen` — toggle on/off + seletor de hora e minuto
- [x] Cancelar notificação quando hábito for deletado
- [ ] Ao abrir o app via notificação, focar o hábito correspondente (deep link)

---

## Fase 4 — Widget Android Melhorado

**Objetivo:** Widget útil, adaptável e correto.

- [ ] Corrigir cálculo de datas para 52 semanas com `LocalDate` (API 26+)
- [ ] Adaptar tamanho do grid ao tamanho real do widget (`RemoteViews` bounds)
- [ ] Refatorar código duplicado — classe `GridBitmapGenerator` compartilhada
- [ ] Mostrar streak atual e nome do hábito no widget
- [ ] Adicionar suporte a múltiplos widgets (um por hábito via `AppWidgetManager`)

---

## Fase 5 — Estatísticas & UX

**Objetivo:** Dar contexto e motivação ao usuário.

- [x] **Streak counter** — streak atual exibido no stats bar
- [x] **Completion rate** — % dos últimos 30 dias no stats bar
- [x] `src/utils/stats.ts` — `computeStats()` com streak atual, melhor streak, taxa 30d, total
- [x] **Stats bar** — bloco visual com 4 métricas abaixo do grid
- [ ] **Grid responsivo** — ajustar tamanho dos quadrados ao width da tela
- [ ] **Haptic feedback** — vibração suave ao commitar (expo-haptics)

---

## Fase 6 — README & Documentação

**Objetivo:** README completo e profissional.

- [x] Documentação do contrato JSON do Connector
- [x] Guia de instalação completo (Android build, widget setup)
- [x] Seção de estrutura do projeto
- [ ] Screenshots do app (grid, modal, criação)

---

## Fase 7 — GitHub Infrastructure

**Objetivo:** Pipeline básico de qualidade.

- [x] GitHub Actions CI — TypeScript check + console.log lint + expo-doctor em push/PR
- [x] Issues #4–#9 criadas cobrindo bugs críticos e features
- [ ] Branch protection rules (require CI pass)
- [ ] PR template

---

## TODO — Funcionalidades Futuras

> Backlog para versões futuras. Não comprometido com data.

### Curto Prazo
- **Templates de commit** — mensagens reutilizáveis frequentes
- **Swipe to commit** — gesto deslizar no card para commitar o dia de hoje
- **Export JSON** — exportar todos os hábitos e histórico

### Médio Prazo
- **iOS Widget** (WidgetKit) — paridade com Android
- **Import/Restore** — importar backup JSON
- **Temas** — alternar entre dark/light/custom
- **Múltiplos widets** — um widget por hábito na home screen

### Longo Prazo
- **Backup em nuvem** — sync com Google Drive ou iCloud
- **Collaboração** — compartilhar hábito com link (read-only view)
- **GitHub real integration** — conector oficial para commits reais do GitHub
- **Recorrências** — marcar commits futuros como planejados
- **Internacionalização** — EN/ES além do PT-BR

---

## Progresso por Fase

```
Fase 1 — Qualidade      [x] ██████████ 100%
Fase 2 — Funcionalidades[x] ████████░░  80% (widget habit selection pendente)
Fase 3 — Notificações   [x] ████████░░  80% (deep link pendente)
Fase 4 — Widget         [x] █████░░░░░  50% (multi-widget pendente)
Fase 5 — Stats & UX     [x] ████████░░  80% (haptics, responsive grid pendentes)
Fase 6 — README         [x] █████████░  90% (screenshots pendentes)
Fase 7 — Infrastructure [x] ████████░░  80% (branch protection pendente)
```
