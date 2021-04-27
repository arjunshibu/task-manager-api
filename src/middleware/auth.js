const jwt = require('jsonwebtoken');
const User = require('../mongo/models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1];
    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: tokenDecoded._id, email: tokenDecoded.email, 'tokens.token': token });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    res.status(400).send({ error: 'Authentication failed' });
  }
};

module.exports = auth;
