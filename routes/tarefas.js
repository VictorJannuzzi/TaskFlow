const express = require("express")
const router = express.Router()

const Tarefa = require("../models/Tarefa")

// LISTAR TODAS
router.get("/", async (req, res) => {

    try {

        const tarefas = await Tarefa.find().sort({ dataCriacao: -1 })

        res.json(tarefas)

    } catch (erro) {

        res.status(500).json({ erro: "Erro ao buscar tarefas" })

    }

})


// BUSCAR UMA
router.get("/:id", async (req, res) => {

    try {

        const tarefa = await Tarefa.findById(req.params.id)

        res.json(tarefa)

    } catch (erro) {

        res.status(500).json({ erro: "Erro ao buscar tarefa" })

    }

})


// CRIAR
router.post("/", async (req, res) => {

    try {

        const novaTarefa = new Tarefa(req.body)

        const tarefaSalva = await novaTarefa.save()

        res.status(201).json(tarefaSalva)

    } catch (erro) {

        res.status(500).json({ erro: "Erro ao criar tarefa" })

    }

})


// ATUALIZAR
router.put("/:id", async (req, res) => {

    try {

        const tarefaAtualizada = await Tarefa.findByIdAndUpdate(

            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }

        )

        if (!tarefaAtualizada){
            return res.status(404).json({ erro: "Tarefa nao encontrada" })
        }

        res.json(tarefaAtualizada)

    } catch (erro) {

        res.status(500).json({ erro: "Erro ao atualizar tarefa" })

    }

})


// DELETAR
router.delete("/:id", async (req, res) => {

    try {

        await Tarefa.findByIdAndDelete(req.params.id)

        res.json({ mensagem: "Tarefa removida com sucesso" })

    } catch (erro) {

        res.status(500).json({ erro: "Erro ao deletar tarefa" })

    }

})

module.exports = router