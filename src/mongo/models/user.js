const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	}, age: {
		type: Number,
		default: 1,
		validate(value) {
			if(value < 0) {
				throw new Error('Age must not be a negative number.')
			}
		}
	}, email: {
		type: String,
		unique: true,
		required: true,
		validate(value) {
			if(!validator.isEmail(value)) {
				throw new Error('Email validation failed.')
			}
		}
	}, password: {
		type: String,
		required: true,
		minlength: 6,
		trim: true,
		validate(value) {
			if(value.toLowerCase().includes('password') || value.includes('1234')) {
				throw new Error('Password validation failed.')
			}
		}
	}, avatar: {
		type: Buffer
	}, tokens: [{
		token: {
			type: String,
			required: true
		}
	}], verificationToken: {
	type: String
}}, {
		timestamps: true
})

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function(_id) {
	const token = jwt.sign({ _id: this._id.toString(), email: this.email }, process.env.JWT_SECRET, { expiresIn: '1w' })
	this.tokens = this.tokens.concat({ token })
	await this.save()
	return token
}

userSchema.methods.generateVerificationToken = async function(_id) {
	const token = jwt.sign({ _id: this._id.toString(), email: this.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
	this.verificationToken = token
	await this.save()
	return token
}

userSchema.methods.toJSON = function() {
	const { _id, name, age, email} = this
	const user = { _id, name, age, email }
	return user
}

userSchema.statics.findByCreds = async (email, password) => {
	const user = await User.findOne( { email })
	if (!user) {
		throw new Error('Login failed.')
	}
	const isPasswordValid = await bcrypt.compare(password, user.password)
	if (!isPasswordValid) {
		throw new Error('Login failed.')
	}
	return user
}

userSchema.statics.verifyAccount = async (token) => {
	const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET)
	const user = await User.findOne({ _id: tokenDecoded._id, email: tokenDecoded.email, verificationToken: token})
	if (!user) {
		throw new Error()
	}
	user.verificationToken = undefined
	await user.save()
}

userSchema.pre('save', async function() {
	if (this.isModified('password')) {
		this['password'] = await bcrypt.hash(this['password'], 8)
	}
})

const User = new mongoose.model('User', userSchema)

module.exports = User
