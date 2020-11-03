const express = require('express')
const rateLimit = require("express-rate-limit");
require('./mongo/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const fourOhFourRouter = require('./routers/404')

const app = express()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20
  });

app.use(express.json())
app.use(limiter);
app.use(userRouter)
app.use(taskRouter)
app.use(fourOhFourRouter)

module.exports = app
