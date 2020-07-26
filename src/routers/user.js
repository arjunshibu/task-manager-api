const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../mongo/models/user')
const Task = require('../mongo/models/task')
const auth = require('../middlewares/auth')
const email = require('../mails/account')
const router = express.Router({ caseSensitive: true })

router.post('/users/signup', async (req, res) => {
  try {
    const user = new User(req.body)
    await user.save()
    const verificationToken = await user.generateVerificationToken(user._id)
    email.sendWelcome(user.email, user.name, verificationToken)
    res.status(201).send({ user, status: 'Check mail to verify your account.' })
  } catch (err) {
    if (err.message.includes('User validation failed')) {
      const errorArray = err.message.split('failed: ')[1].split(', ')
      let errors = []
      errorArray.forEach((err) => {
        if (err.includes('`') || err.includes('(')) {
          errors.push(err.split('Path ')[1].replace(/`/g, "").replace(/[\(|\)]/g, "'"))
        } else {
          errors.push(err.split(': ')[1])
        }
      })
      res.status(500).send({ error: errors })
    } else if (err.message.includes('duplicate')) {
      res.status(500).send({ error: 'User with email ' + req.body.email + ' already exists.' })
    } else {
      res.status(500).send({ error: 'Cannot process request.' })
    }
  }
})

router.get('/users/verify/:token', async (req, res) => {
  try {
    const token = req.params.token
    await User.verifyAccount(token)
    res.send({ success: 'Account verified successfully, you can now login.' })
  } catch (err) {
    res.status(400).send({ error: 'Verification link has expired or not valid.' })
  }
})

router.get('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      throw new Error('User does not exists.')
    }
    if (!user.verificationToken) {
      throw new Error('Account already verified.')
    }
    const verificationToken = await user.generateVerificationToken(user._id)
    email.sendWelcome(user.email, user.name, verificationToken)
    res.send({ status: 'Check mail to verify your account.' })
  } catch (err) {
    res.status(400).send({ error: err.message })
  }

})

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findByCreds(email, password)
    if (user.verificationToken) {
      throw new Error('Account is not verified.')
    }
    const authToken = await user.generateAuthToken(user._id)
    res.send({user, status: 'Logged in',authToken})
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
})

router.get('/users/logout', auth, async(req, res) => {
  try {
    const { user, token } = req
    user.tokens = user.tokens.filter((_token) => {
      return _token.token != token
    })
    await user.save()
    res.send({ status: 'Logged out from current session.' })
  } catch (err) {
    res.status(500).send()
  }
})

router.get('/users/logout/all', auth, async (req, res) => {
  try {
    const { user } = req
    user.tokens = []
    await user.save()
    res.send({ status: 'Logged out from all sessions.' })
  } catch (err) {
    res.status(500).send()
  }
})

router.get('/users/me', auth, async (req, res) => {
  try {
    const user = req.user
    res.send(user)
  } catch (err) {
    res.status(500).send()
  }
})

router.patch('/users/me', auth, async (req, res) => {
  const updatableParams = [ 'name', 'age', 'email', 'password' ]
  const providedParams = Object.keys(req.body)
  const isParamsValid = providedParams.every((param) => updatableParams.includes(param))

  if (!isParamsValid) {
    res.status(400).send({ error: 'Invalid parameters provided.' })
    return
  }
  try {
    providedParams.forEach((param) => req.user[param] = req.body[param])
    const user = await req.user.save()
    res.send({ user, status: 'Updated' })
  } catch (err) {
    if (err.message.includes('User validation failed')) {
      const errorArray = err.message.split('failed: ')[1].split(', ')
      let errors = []
      errorArray.forEach((err) => {
        if (err.includes('`') || err.includes('(')) {
          errors.push(err.split('Path ')[1].replace(/`/g, "").replace(/[\(|\)]/g, "'"))
        } else {
          errors.push(err.split(': ')[1])
        }
      })
      res.status(500).send({ error: errors })
    } else if (err.message.includes('duplicate')) {
      res.status(500).send({ error: 'User with email ' + req.body.email + ' already exists.' })
    } else {
      res.status(500).send({ error: 'Cannot process request.' })
    }
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    const user = await req.user.deleteOne()
    const deletedTasks = await Task.deleteMany({ owner: user._id })
    res.send({ user, status: 'Deleted' })
    email.sendCancelation(user.email, user.name)
  } catch(err) {
    res.status(500).send()
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000
  }, fileFilter(req, file, callback) {
    if (file.mimetype.match(/^(image\/)(jpe|pn)g$/) && file.originalname.match(/\.(jp[e]?|pn)g$/)) {
      callback(undefined, true)
      return
    }
    callback(new Error('File is not an image.'))
  }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), (err, req, res, next) => {
  res.status(400).send({ error: err.message })
}, async (req, res) => {
  if (!req.file) {
    res.send({ status: 'Profile picture unchanged.' })
    return
  }
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send({ status: 'Profile picture updated.' })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  if (!req.user.avatar) {
    res.status(404).send({ error: 'Not found.' })
    return
  }
  req.user.avatar = undefined
  await req.user.save()
  res.send({ status: 'Profile picture deleted.' })
})

router.get('/users/:id/avatar.png', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (err) {
    res.status(404).send({ error: 'Not found.' })
  }
})

module.exports = router
