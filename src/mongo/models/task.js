const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
	description: {
		type: String,
		required: true,
		trim: true
	},
	completed: {
		type: Boolean,
		default: false
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	}
},
{
	timestamps: true
});

taskSchema.methods.toJSON = function() {
	const { _id, description, completed, createdAt, updatedAt } = this;
	const task = { _id, description, completed, createdAt, updatedAt };

	return task;
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
