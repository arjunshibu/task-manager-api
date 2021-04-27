const mongoose = require('mongoose');

mongoose
.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
})
.catch(() => {
    console.log('MongoDB connection failed!');
});