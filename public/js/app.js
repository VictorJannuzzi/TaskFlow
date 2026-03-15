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

// Contadores do menu lateral
const contadorTodas = document.getElementById("contadorTodas")
const contadorPendentes = document.getElementById("contadorPendentes")
const contadorProgresso = document.getElementById("contadorProgresso")
const contadorConcluidas = document.getElementById("contadorConcluidas")

// Cards de estatísticas
const statTotal = document.getElementById("statTotal")
const statPendentes = document.getElementById("statPendentes")
const statProgresso = document.getElementById("statProgresso")
const statConcluidas = document.getElementById("statConcluidas")

// Progresso geral
const percentualProgresso = document.getElementById("percentualProgresso")
const barraProgressoFill = document.getElementById("barraProgressoFill")

// Busca
const campoBusca = document.getElementById("campoBusca")

// Cache de tarefas carregadas
let tarefasCache = []

// Filtros atuais
let filtroStatusAtual = "todas"
let termoBuscaAtual = ""

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

    tarefas.forEach(tarefa => {

        const card = document.createElement("div")

        card.classList.add("card-tarefa")

        const classePrioridade = tarefa.prioridade === "alta" ? "alta" : tarefa.prioridade === "baixa" ? "baixa" : "media"

        const labelStatus = tarefa.status === "em_progresso" ? "Em progresso" : tarefa.status === "concluida" ? "Concluída" : "Pendente"

        card.innerHTML = `

        <div class="tarefa-titulo">${tarefa.titulo}</div>

        <div class="tarefa-status">${labelStatus}</div>

        <div class="tarefa-descricao">${tarefa.descricao || ""}</div>

        <div class="card-tarefa-footer">
            <div class="tarefa-prioridade">
                <span class="ponto-prioridade ${classePrioridade}"></span>
            </div>
            <div class="acoes-tarefa">
                <button class="btn-icone" onclick="event.stopPropagation(); deletarTarefa('${tarefa._id}')">
                🗑
                </button>
            </div>
        </div>

        `

        // Abrir modal de edição ao clicar na tarefa (qualquer status)
        card.addEventListener("click", () => {

            abrirModalEdicao(tarefa)

        })

        listaTarefas.appendChild(card)

    })
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

    if (statTotal) statTotal.textContent = total
    if (statPendentes) statPendentes.textContent = pendentes
    if (statProgresso) statProgresso.textContent = emProgresso
    if (statConcluidas) statConcluidas.textContent = concluidas

    const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0

    if (percentualProgresso) percentualProgresso.textContent = `${percentual}%`
    if (barraProgressoFill) barraProgressoFill.style.width = `${percentual}%`

}

function aplicarFiltros(){

    let filtradas = tarefasCache || []

    if (filtroStatusAtual && filtroStatusAtual !== "todas"){

        filtradas = filtradas.filter(tarefa => tarefa.status === filtroStatusAtual)

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

// Filtros pelos cards de estatísticas
const cardsEstatisticas = document.querySelectorAll(".cards-estatisticas .card-stat")

if (cardsEstatisticas[0]) cardsEstatisticas[0].addEventListener("click", () => atualizarFiltroStatus("todas"))
if (cardsEstatisticas[1]) cardsEstatisticas[1].addEventListener("click", () => atualizarFiltroStatus("pendente"))
if (cardsEstatisticas[2]) cardsEstatisticas[2].addEventListener("click", () => atualizarFiltroStatus("em_progresso"))
if (cardsEstatisticas[3]) cardsEstatisticas[3].addEventListener("click", () => atualizarFiltroStatus("concluida"))

function atualizarFiltroStatus(novoStatus){

    filtroStatusAtual = novoStatus

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

carregarTarefas()