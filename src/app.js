const express = require('express');
const rateLimit = require('express-rate-limit');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const globalRouter = require('./routers/global');

require('./mongo/db');

const app = express();

app.use(express.json());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
}));

app.use('/users', userRouter);
app.use('/tasks', taskRouter);
app.use('/', globalRouter);

module.exports = app;
