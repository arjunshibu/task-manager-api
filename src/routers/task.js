const express = require('express');
const Task = require('../mongo/models/task');
const auth = require('../middleware/auth');

const router = express.Router({ caseSensitive: true });

router.post('/', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });

  try {
    await task.save();

    res.status(201).send({ task, status: 'Created' });
  } catch (err) {
    if (err.message.includes('Task validation failed')) {
      const errorArray = err.message.split('failed: ')[1].split(', ');
      let errors = []

      errorArray.forEach((err) => {
        if (err.includes('`') || err.includes('(')) {
          errors.push(err.split('Path ')[1].replace(/`/g, '').replace(/[\(|\)]/g, "'"));
        } else {
          errors.push(err.split(': ')[1]);
        }
      });

      res.status(500).send({ error: errors });
    } else {
      res.status(500).send({ error: 'Cannot process request' });
    }
  }
});

router.get('/', auth, async (req, res) => {
  const match = {}, options = {}, sort = {};

  const { sortBy, completed, limit, skip } = req.query;

  try {
    if (sortBy) {
      const sortQueries = sortBy.split(',');
      let sortPair = [];

      sortQueries.forEach((query) => {
        sortPair = query.split(':');
        sort[sortPair[0]] = sortPair[1] === 'desc' ? -1 : 1;
      });

      options.sort = sort;
    }

    if (completed) {
      match.completed = completed === 'true' || completed === 1;
    }
    
    if (limit) {
      if (parseInt(limit) && parseInt(limit) > 0) {
        options.limit = parseInt(limit);
      } else {
        throw new Error('Parameter parsing failed');
      }
    }

    if (skip) {
      if (parseInt(skip) && parseInt(skip) > 0) {
        options.skip = parseInt(skip);
      } else {
        throw new Error('Parameter parsing failed');
      }
    }

    await req.user.populate({ path: 'tasks', match, options }).execPopulate();

    const tasks = req.user.tasks;

    res.status(200).send(tasks);
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if(!task) {
      res.status(404).send();
      return;
    }

    res.send(task);
  } catch (err) {
    res.status(404).send({ error: 'Not found' });
  }
});

router.patch('/:id', auth, async (req, res) => {
  const params = Object.keys(Task.schema.obj);
  const givenParams = Object.keys(req.body);
  const isParamsValid = givenParams.every((param) => params.includes(param));

  if (!isParamsValid) {
    res.status(400).send({ error: 'Invalid parameters provided' });
    return;
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if (!task) {
      res.status(404).send({ error: 'Not found.' });
      return;
    }

    givenParams.forEach((param) => task[param] = req.body[param]);

    const savedTask = await task.save();

    res.send({ task: savedTask, status: 'Updated' });
  } catch (err) {
    if (err.message.includes('Task validation failed')) {
      const errorArray = err.message.split('failed: ')[1].split(', ');
      let errors = [];

      errorArray.forEach((err) => {
        if (err.includes('`') || err.includes('(')) {
          errors.push(err.split('Path ')[1].replace(/`/g, "").replace(/[\(|\)]/g, "'"));
        } else {
          errors.push(err.split(': ')[1]);
        }
      });

      res.status(500).send({ error: errors });
    } else {
      res.status(500).send({ error: 'Cannot process request' });
    }
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
   
    if (!task) {
      res.status(404).send({ error: 'Not found' });
      return;
    }

    res.send({ task, status: 'Deleted' });
  } catch(err) {
    res.status(500).send();
  }
});

module.exports = router;
