# Taskflow

O projeto **TaskFlow** é uma aplicação **CRUD de tarefas** com backend em **Node.js + Express + MongoDB** e frontend em **HTML/CSS/JS**.
Neste projeto o servidor Node serve a API e também o frontend estático.

 Backend (API + Banco)

- **Tarefa.js**
  - Define o **schema** do MongoDB para uma tarefa (`Tarefa`).
  - Campos suportados:
    - `titulo`, `descricao`, `status`, `prioridade`, `categoria`, `dataVencimento`, `dataCriacao`
  - Usa `mongoose.Schema` com validações básicas (enum, required, defaults)

- **tarefas.js**
  - Contém as rotas REST para gerenciamento de tarefas:
    - `GET /api/tarefas` → lista todas (ordenadas por `dataCriacao`)
    - `GET /api/tarefas/:id` → pega tarefa por ID
    - `POST /api/tarefas` → cria nova tarefa
    - `PUT /api/tarefas/:id` → atualiza tarefa
    - `DELETE /api/tarefas/:id` → exclui tarefa
  - Usa `Tarefa` (modelo mongoose) para acessar o banco de dados
 
  -  Frontend (UI estática + lógica de cliente)

- **index.html**
  - Página principal do app (UI do gerenciador de tarefas).
  - Contém:
    - Sidebar com filtros (por status / prioridade)
    - Painel principal com cards de estatísticas + listagem de tarefas
    - Modal para criar/editar tarefas
    - Modal de confirmação de exclusão
  - Carrega:
    - `css/style.css`
    - `js/app.js`
    - e scripts extras em `js/features/` (dashboard, drag/drop, modo escuro)

- **style.css**
  - Estiliza layout, sidebar, cards, modal, filtros etc.
  - Definições base usadas pelo frontend para aparência (cores, animações, responsividade básica)

- **app.js**
  - Lógica principal do lado cliente (SPA sem frameworks):
    - Carrega tarefas via `fetch("/api/tarefas")`
    - Atualiza estatísticas e filtros
    - Renderiza cards de tarefa
    - Controla modal de criação/edição
    - Faz POST/PUT/DELETE para a API
    - Mantém cache `tarefasCache` e aplica filtros/busca
