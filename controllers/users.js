const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/users');

const { NODE_ENV, JWT_SECRET } = process.env;
const key = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;

  User.findOne({ _id: userId })
    .orFail(() => Error('Пользователь не найден'))
    .then((user) => res.send(user))
    .catch((err) => res.status(404).send({ message: err.message }));
};

module.exports.createUser = (req, res) => {
  const { email, password, name, about, avatar } = req.body;

  bcrypt.hash(password, 10)
    .then(hash => User.create({
      email,
      password: hash,
      name,
      about,
      avatar
    }))
    .then((user) => res.send({ data: user }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  if (validator.isLength(name, { min: 2, max: 30 })
    && validator.isLength(about, { min: 2, max: 30 })) {
    User.findByIdAndUpdate(userId, { name, about })
      .orFail(() => Error('Пользователь не найден'))
      .then((user) => res.send({ data: user }))
      .catch((err) => res.status(500).send({ message: err.message }));
  } else {
    res.status(400).send({ message: 'От 2 до 30 символов' });
  }
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  if (validator.isURL(avatar)) {
    User.findByIdAndUpdate(userId, { avatar })
      .orFail(() => Error('Пользователь не найден'))
      .then((user) => res.send({ data: user }))
      .catch((err) => res.status(500).send({ message: err.message }));
  } else {
    res.status(400).send({ message: 'Должна быть ссылка на картинку' });
  }
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findOne({ email }).select('+password')
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, key);

      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true
        })
        .send({ message: `Добро пожаловать: ${user.name}` });
    })
    .catch(err => {
      res.status(401).send({ message: err.message });
    });
};
