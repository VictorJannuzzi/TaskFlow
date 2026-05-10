# TaskFlow - Gerenciador de Tarefas

Aplicação CRUD de tarefas com backend em Node.js + Express + MongoDB e frontend em HTML/CSS/JS. O servidor Node serve tanto a API quanto o frontend estático.

---

## Backend (API + Banco de Dados)

### Tarefa.js

Define o schema do MongoDB para uma tarefa (Tarefa).

**Campos suportados:**
- `titulo` (String, obrigatório, trimado)
- `descricao` (String, padrão vazio)
- `status` (String, enum: `pendente`, `em_progresso`, `concluida`, padrão: `pendente`)
- `prioridade` (String, enum: `baixa`, `media`, `alta`, padrão: `media`)
- `categoria` (String, padrão vazio)
- `dataVencimento` (Date, opcional)
- `dataCriacao` (Date, padrão: `Date.now()`)

Usa `mongoose.Schema` com validações básicas (enum, required, defaults).

### tarefas.js

Contém as rotas REST para gerenciamento de tarefas:

- **GET** `/api/tarefas` → lista todas as tarefas (ordenadas por `dataCriacao` descendente)
- **GET** `/api/tarefas/:id` → pega tarefa por ID
- **POST** `/api/tarefas` → cria nova tarefa
- **PUT** `/api/tarefas/:id` → atualiza tarefa (com validação de status e retorno 404 se não encontrada)
- **DELETE** `/api/tarefas/:id` → exclui tarefa

Usa modelo `Tarefa` (mongoose) para acessar o banco de dados. A rota PUT agora:
- Ativa `runValidators: true` para garantir campos válidos durante update
- Valida existência da tarefa e retorna erro 404 caso ela não exista

---

## Frontend (UI Estática + Lógica de Cliente)

### index.html

Página principal da aplicação (UI do gerenciador de tarefas).

**Contém:**
- Sidebar com filtros (por status / prioridade) e contadores de tarefas
- Painel principal com área de tarefas (quadro kanban)
- Modal para criar/editar tarefas
- Modal de confirmação de exclusão
- Barra de busca e seletor de tema (claro/escuro)

**Carrega:**
- `css/style.css`
- `js/app.js`
- Scripts extras (Font Awesome, Google Fonts)

### style.css

Estiliza layout, sidebar, cards de tarefa, modal, filtros, quadro kanban e responsividade.

**Definições base:**
- Variáveis CSS (cores, espaçamento, animações)
- Grid de layout principal
- Estilo de cards kanban (com indicadores de prioridade)
- Animações de drag-and-drop visual
- Modo escuro/claro (toggle via JavaScript)

### app.js

Lógica principal do lado cliente (SPA sem frameworks).

**Fluxo principal:**
- Carrega tarefas via `fetch("/api/tarefas")`
- Mantém cache `tarefasCache` em memória
- Atualiza estatísticas (contadores) imediatamente no cache
- Renderiza cards em quadro kanban
- Controla modal de criação/edição
- Faz requisições POST/PUT/DELETE para a API

**Kanban (Drag-and-Drop):**
- Coloca tarefas em 3 colunas (Pendente, Em Progresso, Concluída)
- Cada coluna exibe contador visual de tarefas
- Ao arrastar tarefa entre colunas:
  1. Status é atualizado no cache (otimismo)
  2. Contadores da sidebar são recalculados imediatamente
  3. PUT é enviado à API para persistir
  4. Se PUT falhar, rollback restaura status anterior e re-renderiza
  
**Melhorias recentes:**
- Listeners de drop registrados em coluna e lista interna (mais resiliente ao soltar em filhos)
- `atualizarEstatisticas()` agora chamado sempre que cache muda (drag-and-drop, filtros, criação, exclusão)
- Contadores da sidebar atualizam em tempo real, sem depender de recarga da API

**Filtros:**
- Por status na sidebar (Todas, Pendentes, Em Progresso, Concluídas)
- Por prioridade (Alta, Média, Baixa)
- Busca por texto (título e descrição)
- Filtros são combináveis ao mudar cache

**Tema:**
- Toggle claro/escuro na barra superior
- Preferência salva em `localStorage` (chave: `tema-preferido-taskflow`)
- Detecta preferência do sistema se nenhuma salva

---

## Funcionalidades

- ✅ CRUD completo de tarefas
- ✅ Quadro kanban com drag-and-drop
- ✅ Filtros por status, prioridade e busca
- ✅ Contador de tarefas por categoria (atualização em tempo real)
- ✅ Modal de edição com campos validados
- ✅ Modo escuro/claro
- ✅ Persistência no MongoDB
- ✅ Validação de dados no backend

---

## Como rodar

```bash
npm install
npm run dev        # Modo desenvolvimento (nodemon)
# ou
npm run start      # Modo produção
```

O servidor estará disponível em `http://localhost:3000` (verifique a porta no `.env`).
