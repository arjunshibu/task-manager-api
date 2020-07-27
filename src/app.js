const express = require('express')
require('./mongo/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const fourOhFourRouter = require('./routers/404')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.use(fourOhFourRouter)

module.exports = app
