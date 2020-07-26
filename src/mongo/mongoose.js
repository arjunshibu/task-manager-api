const mongoose = require('mongoose')
const url = process.env.MONGODB_URL

mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
}).catch(() => {
		console.log('Couldn\'t connect to database!')
})
