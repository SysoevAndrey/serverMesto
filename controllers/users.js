const validator = require('validator');
const User = require('../models/users');

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
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  console.log(typeof about);

  if (validator.isLength(name, { min: 2, max: 30 }) && validator.isLength(about, { min: 2, max: 30 })) {
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
