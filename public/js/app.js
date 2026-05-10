const API = "/api/tarefas"

/* ELEMENTOS */

const btnAbrirModal = document.getElementById("btnAbrirModal")
const btnFecharModal = document.getElementById("btnFecharModal")
const btnCancelarModal = document.getElementById("btnCancelarModal")

const overlayModal = document.getElementById("overlayModal")

const formularioTarefa = document.getElementById("formularioTarefa")

const listaTarefas = document.getElementById("listaTarefas")

const campoIdTarefa = document.getElementById("campoIdTarefa")
const tituloModal = document.getElementById("tituloModal")

const tituloPagina = document.getElementById("tituloPagina")
const btnAlternarTema = document.getElementById("btnAlternarTema")
const iconeTema = document.getElementById("iconeTema")
const textoTema = document.getElementById("textoTema")

// Contadores do menu lateral
const contadorTodas = document.getElementById("contadorTodas")
const contadorPendentes = document.getElementById("contadorPendentes")
const contadorProgresso = document.getElementById("contadorProgresso")
const contadorConcluidas = document.getElementById("contadorConcluidas")

// Busca
const campoBusca = document.getElementById("campoBusca")
const estadoVazio = document.getElementById("estadoVazio")
const btnVazioNovaTarefa = document.getElementById("btnVazioNovaTarefa")

// Cache de tarefas carregadas
let tarefasCache = []

// Filtros atuais
let filtroStatusAtual = "todas"
let filtroPrioridadeAtual = null
let termoBuscaAtual = ""
let houveArraste = false

const definicoesStatusKanban = [
    { valor: "pendente", titulo: "Pendente", icone: "fa-clock" },
    { valor: "em_progresso", titulo: "Em Progresso", icone: "fa-fire" },
    { valor: "concluida", titulo: "Concluida", icone: "fa-check-circle" }
]

const nomesPrioridade = {
    alta: "Alta",
    media: "Media",
    baixa: "Baixa"
}

const chaveTemaSalvo = "tema-preferido-taskflow"

function atualizarEstadoBotaoTema(temaAtivo){

    if (!btnAlternarTema || !iconeTema || !textoTema) return

    const estaEscuro = temaAtivo === "escuro"

    iconeTema.className = estaEscuro ? "fas fa-sun" : "fas fa-moon"
    textoTema.textContent = estaEscuro ? "Modo claro" : "Modo escuro"

    btnAlternarTema.setAttribute("aria-pressed", estaEscuro ? "true" : "false")
    btnAlternarTema.setAttribute("aria-label", estaEscuro ? "Ativar modo claro" : "Ativar modo escuro")

}

function aplicarTema(temaSelecionado){

    const temaNormalizado = temaSelecionado === "escuro" ? "escuro" : "claro"

    document.body.classList.toggle("tema-escuro", temaNormalizado === "escuro")

    localStorage.setItem(chaveTemaSalvo, temaNormalizado)

    atualizarEstadoBotaoTema(temaNormalizado)

}

function iniciarTema(){

    const temaSalvo = localStorage.getItem(chaveTemaSalvo)

    if (temaSalvo === "claro" || temaSalvo === "escuro"){

        aplicarTema(temaSalvo)
        return

    }

    const prefereEscuro = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

    aplicarTema(prefereEscuro ? "escuro" : "claro")

}

if (btnAlternarTema){

    btnAlternarTema.addEventListener("click", () => {

        const temaAtual = document.body.classList.contains("tema-escuro") ? "escuro" : "claro"
        const proximoTema = temaAtual === "escuro" ? "claro" : "escuro"

        aplicarTema(proximoTema)

    })

}

if (btnVazioNovaTarefa){

    btnVazioNovaTarefa.addEventListener("click", () => {

        btnAbrirModal.click()

    })

}

/* ======================
ABRIR MODAL
====================== */

btnAbrirModal.addEventListener("click", () => {

    if (tituloModal) tituloModal.textContent = "Nova Tarefa"
    if (campoIdTarefa) campoIdTarefa.value = ""
    formularioTarefa.reset()

    overlayModal.style.display = "flex"

})

/* ======================
FECHAR MODAL
====================== */

btnFecharModal.addEventListener("click", fecharModal)

btnCancelarModal.addEventListener("click", fecharModal)

function fecharModal(){

    overlayModal.style.display = "none"

    formularioTarefa.reset()

}

/* ======================
CRIAR TAREFA
====================== */

formularioTarefa.addEventListener("submit", async (e) => {

    e.preventDefault()

    const tarefa = {

        titulo: document.getElementById("campoTitulo").value,
        descricao: document.getElementById("campoDescricao").value,
        status: document.getElementById("campoStatus").value,
        prioridade: document.getElementById("campoPrioridade").value,
        categoria: document.getElementById("campoCategoria").value,
        dataVencimento: document.getElementById("campoDataVencimento").value

    }

    const idTarefa = campoIdTarefa ? campoIdTarefa.value : ""

    const url = idTarefa ? `${API}/${idTarefa}` : API
    const metodo = idTarefa ? "PUT" : "POST"

    await fetch(url, {

        method: metodo,
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(tarefa)

    })

    fecharModal()

    carregarTarefas()

})

/* ======================
LISTAR TAREFAS
====================== */

async function carregarTarefas(){

    const resposta = await fetch(API)

    const tarefas = await resposta.json()

    tarefasCache = tarefas

    atualizarEstatisticas(tarefas)

    aplicarFiltros()

}

function renderizarTarefas(tarefas){

    listaTarefas.innerHTML = ""

    const tarefasPorStatus = {
        pendente: [],
        em_progresso: [],
        concluida: []
    }

    tarefas.forEach(tarefa => {

        if (tarefasPorStatus[tarefa.status]){
            tarefasPorStatus[tarefa.status].push(tarefa)
        }

    })

    const colunasExibidas = filtroStatusAtual === "todas"
        ? definicoesStatusKanban
        : definicoesStatusKanban.filter(coluna => coluna.valor === filtroStatusAtual)

    colunasExibidas.forEach(coluna => {

        const elementoColuna = criarColunaKanban(coluna, tarefasPorStatus[coluna.valor] || [])

        listaTarefas.appendChild(elementoColuna)

    })

    if (estadoVazio){
        estadoVazio.style.display = tarefas.length === 0 ? "block" : "none"
    }

    listaTarefas.style.display = tarefas.length === 0 ? "none" : "grid"
}

function criarColunaKanban(definicaoColuna, tarefasColuna){

    const coluna = document.createElement("section")
    coluna.className = "coluna-kanban"
    coluna.dataset.status = definicaoColuna.valor

    coluna.innerHTML = `
        <div class="cabecalho-coluna-kanban">
            <div class="titulo-coluna-kanban">
                <i class="fas ${definicaoColuna.icone}" aria-hidden="true"></i>
                <span>${definicaoColuna.titulo}</span>
            </div>
            <span class="contador-coluna-kanban">${tarefasColuna.length}</span>
        </div>
        <div class="lista-coluna-kanban"></div>
    `

    const listaColuna = coluna.querySelector(".lista-coluna-kanban")

    tarefasColuna.forEach(tarefa => {

        const card = criarCardTarefaKanban(tarefa)
        listaColuna.appendChild(card)

    })

    if (tarefasColuna.length === 0){

        const marcador = document.createElement("p")
        marcador.className = "coluna-vazia"
        marcador.textContent = "Arraste tarefas para ca"
        listaColuna.appendChild(marcador)

    }

    coluna.addEventListener("dragover", (evento) => {

        evento.preventDefault()
        coluna.classList.add("coluna-arraste-ativa")

    })

    coluna.addEventListener("dragleave", (evento) => {

        if (!coluna.contains(evento.relatedTarget)){
            coluna.classList.remove("coluna-arraste-ativa")
        }

    })

    coluna.addEventListener("drop", async (evento) => {

        evento.preventDefault()
        coluna.classList.remove("coluna-arraste-ativa")

        const idTarefa = evento.dataTransfer.getData("text/plain")
        const novoStatus = coluna.dataset.status

        if (!idTarefa || !novoStatus) return

        await moverTarefaKanban(idTarefa, novoStatus)

    })

    return coluna

}

function criarCardTarefaKanban(tarefa){

    const card = document.createElement("article")
    const classePrioridade = tarefa.prioridade === "alta" ? "alta" : tarefa.prioridade === "baixa" ? "baixa" : "media"
    const dataVencimento = tarefa.dataVencimento ? formatarData(tarefa.dataVencimento) : "Sem vencimento"
    const categoria = tarefa.categoria ? escaparHtml(tarefa.categoria) : "Sem categoria"

    card.className = "card-tarefa kanban-card"
    card.draggable = true
    card.dataset.id = tarefa._id

    card.innerHTML = `
        <div class="tarefa-titulo">${escaparHtml(tarefa.titulo || "Sem titulo")}</div>
        <div class="tarefa-descricao">${escaparHtml(tarefa.descricao || "")}</div>
        <div class="meta-tarefa-kanban">
            <span class="selo-prioridade ${classePrioridade}">${nomesPrioridade[tarefa.prioridade] || "Media"}</span>
            <span class="texto-meta-kanban">${categoria}</span>
            <span class="texto-meta-kanban">${dataVencimento}</span>
        </div>
        <div class="card-tarefa-footer">
            <div class="acoes-tarefa">
                <button class="btn-icone" type="button" aria-label="Excluir tarefa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `

    const botaoExcluir = card.querySelector(".btn-icone")

    botaoExcluir.addEventListener("click", async (evento) => {

        evento.stopPropagation()
        await deletarTarefa(tarefa._id)

    })

    card.addEventListener("dragstart", (evento) => {

        evento.dataTransfer.setData("text/plain", tarefa._id)
        evento.dataTransfer.effectAllowed = "move"
        card.classList.add("card-arrastando")
        houveArraste = true

    })

    card.addEventListener("dragend", () => {

        card.classList.remove("card-arrastando")

        setTimeout(() => {
            houveArraste = false
        }, 0)

    })

    card.addEventListener("click", () => {

        if (houveArraste) return

        abrirModalEdicao(tarefa)

    })

    return card

}

async function moverTarefaKanban(idTarefa, novoStatus){

    const tarefaAtual = tarefasCache.find(item => item._id === idTarefa)

    if (!tarefaAtual || tarefaAtual.status === novoStatus) return

    const statusAnterior = tarefaAtual.status

    tarefaAtual.status = novoStatus
    aplicarFiltros()

    try {

        const resposta = await fetch(`${API}/${idTarefa}`, {

            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: novoStatus })

        })

        if (!resposta.ok){
            throw new Error("Falha ao atualizar status")
        }

        carregarTarefas()

    } catch (erro) {

        tarefaAtual.status = statusAnterior
        aplicarFiltros()

    }

}

function formatarData(dataIso){

    const data = new Date(dataIso)

    if (Number.isNaN(data.getTime())) return "Data invalida"

    return data.toLocaleDateString("pt-BR")

}

function escaparHtml(texto){

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")

}

function atualizarEstatisticas(tarefas){

    const total = tarefas.length
    const pendentes = tarefas.filter(tarefa => tarefa.status === "pendente").length
    const emProgresso = tarefas.filter(tarefa => tarefa.status === "em_progresso").length
    const concluidas = tarefas.filter(tarefa => tarefa.status === "concluida").length

    if (contadorTodas) contadorTodas.textContent = total
    if (contadorPendentes) contadorPendentes.textContent = pendentes
    if (contadorProgresso) contadorProgresso.textContent = emProgresso
    if (contadorConcluidas) contadorConcluidas.textContent = concluidas

}

function aplicarFiltros(){

    let filtradas = tarefasCache || []

    if (filtroStatusAtual && filtroStatusAtual !== "todas"){

        filtradas = filtradas.filter(tarefa => tarefa.status === filtroStatusAtual)

    }

    if (filtroPrioridadeAtual){

        filtradas = filtradas.filter(tarefa => tarefa.prioridade === filtroPrioridadeAtual)

    }

    if (termoBuscaAtual){

        const termo = termoBuscaAtual

        filtradas = filtradas.filter(tarefa => {

            const titulo = (tarefa.titulo || "").toLowerCase()
            const descricao = (tarefa.descricao || "").toLowerCase()

            return titulo.includes(termo) || descricao.includes(termo)

        })

    }

    renderizarTarefas(filtradas)

}

function abrirModalEdicao(tarefa){

    if (tituloModal) tituloModal.textContent = "Editar Tarefa"
    if (campoIdTarefa) campoIdTarefa.value = tarefa._id

    document.getElementById("campoTitulo").value = tarefa.titulo || ""
    document.getElementById("campoDescricao").value = tarefa.descricao || ""
    document.getElementById("campoStatus").value = tarefa.status || "pendente"
    document.getElementById("campoPrioridade").value = tarefa.prioridade || "media"
    document.getElementById("campoCategoria").value = tarefa.categoria || ""

    const inputData = document.getElementById("campoDataVencimento")
    if (tarefa.dataVencimento && inputData){
        const data = new Date(tarefa.dataVencimento)
        const ano = data.getFullYear()
        const mes = String(data.getMonth() + 1).padStart(2, "0")
        const dia = String(data.getDate()).padStart(2, "0")
        inputData.value = `${ano}-${mes}-${dia}`
    } else if (inputData){
        inputData.value = ""
    }

    overlayModal.style.display = "flex"

}

/* ======================
DELETAR
====================== */

async function deletarTarefa(id){

    await fetch(API + "/" + id, {

        method: "DELETE"

    })

    carregarTarefas()

}

if (campoBusca){

    campoBusca.addEventListener("input", () => {

        termoBuscaAtual = campoBusca.value.toLowerCase()

        aplicarFiltros()

    })

}

// Filtros por status na sidebar
const linksStatus = document.querySelectorAll(".navegacao .item-nav[data-filtro]")

linksStatus.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault()

        const filtro = link.getAttribute("data-filtro") || "todas"

        atualizarFiltroStatus(filtro)

    })

})

// Filtros por prioridade na sidebar
const linksPrioridade = document.querySelectorAll(".secao-prioridade .item-nav[data-prioridade]")

linksPrioridade.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault()

        const prioridade = link.getAttribute("data-prioridade") || null

        atualizarFiltroPrioridade(prioridade)

    })

})

function atualizarFiltroStatus(novoStatus){

    filtroStatusAtual = novoStatus
    filtroPrioridadeAtual = null

    // Remover destaque dos filtros de prioridade
    linksPrioridade.forEach(link => link.classList.remove("ativo"))

    // Atualizar destaque no menu lateral
    linksStatus.forEach(link => {

        const valor = link.getAttribute("data-filtro") || "todas"

        if (valor === novoStatus){
            link.classList.add("ativo")
        } else {
            link.classList.remove("ativo")
        }

    })

    // Atualizar título da página
    if (tituloPagina){

        if (novoStatus === "pendente") tituloPagina.textContent = "Tarefas Pendentes"
        else if (novoStatus === "em_progresso") tituloPagina.textContent = "Tarefas em Progresso"
        else if (novoStatus === "concluida") tituloPagina.textContent = "Tarefas Concluídas"
        else tituloPagina.textContent = "Todas as Tarefas"

    }

    aplicarFiltros()

}

function atualizarFiltroPrioridade(prioridade){

    filtroPrioridadeAtual = prioridade
    filtroStatusAtual = "todas"

    // Remover destaque dos filtros de status
    linksStatus.forEach(link => link.classList.remove("ativo"))

    // Atualizar destaque no menu lateral de prioridade
    linksPrioridade.forEach(link => {

        const valor = link.getAttribute("data-prioridade")

        if (valor === prioridade){
            link.classList.add("ativo")
        } else {
            link.classList.remove("ativo")
        }

    })

    // Atualizar título da página
    if (tituloPagina){

        if (prioridade === "alta") tituloPagina.textContent = "Tarefas com Alta Prioridade"
        else if (prioridade === "media") tituloPagina.textContent = "Tarefas com Média Prioridade"
        else if (prioridade === "baixa") tituloPagina.textContent = "Tarefas com Baixa Prioridade"
        else tituloPagina.textContent = "Todas as Tarefas"

    }

    aplicarFiltros()

}

iniciarTema()
carregarTarefas()