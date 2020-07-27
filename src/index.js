const app = require('./app')
const port = process.env.PORT

app.listen(port, () => {
  console.log('Server listening on 0.0.0.0:' + port)
})
