require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

const tarefasRoutes = require("./routes/tarefas")

const app = express()

app.use(cors())
app.use(express.json())

// SERVIR FRONTEND
app.use(express.static(path.join(__dirname, "public")))


// ROTAS DA API
app.use("/api/tarefas", tarefasRoutes)


// CONEXÃO MONGODB
mongoose.connect(process.env.MONGO_URI)

.then(() => {

    console.log("MongoDB conectado")

    app.listen(process.env.PORT, () => {

        console.log("Servidor rodando em:")
        console.log(`http://localhost:${process.env.PORT}`)

    })

})

.catch((erro) => {

    console.log("Erro MongoDB:", erro)

})