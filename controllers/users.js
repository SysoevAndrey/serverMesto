const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PasswordValidator = require('password-validator');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized-err');

const pass = new PasswordValidator();

pass
  .has().not().spaces()
  .is().min(6);

const User = require('../models/users');

const { NODE_ENV, JWT_SECRET } = process.env;
const key = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users) {
        throw new NotFoundError('Нет пользователей');
      }

      res.send({ data: users })
    })
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findOne({ _id: userId })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }

      res.send(user);
    })
    .catch(next);
};

module.exports.createUser = (req, res) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  if (!pass.validate(password)) {
    throw new UnauthorizedError('Пароль не валиден');
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then(() => res.send({
      email, name, about, avatar,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        res.status(409).send({ message: 'Пользователь с таким email уже существует' });
      }

      next(err);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  if (validator.isLength(name, { min: 2, max: 30 })
    && validator.isLength(about, { min: 2, max: 30 })) {
    User.findByIdAndUpdate(userId, { name, about }, { new: true })
      .then((user) => {
        if (!user) {
          throw new NotFoundError('Пользователь не найден');
        }

        res.send({ data: user })
      })
      .catch(next);
  } else {
    res.status(400).send({ message: 'От 2 до 30 символов' });
  }
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  if (validator.isURL(avatar)) {
    User.findByIdAndUpdate(userId, { avatar }, { new: true })
      .then((user) => {
        if (!user) {
          throw new NotFoundError('Пользователь не найден');
        }

        res.send({ data: user })
      })
      .catch(next);
  } else {
    res.status(400).send({ message: 'Должна быть ссылка на картинку' });
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, key);

      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        })
        .send({ message: `Добро пожаловать: ${user.name}` });
    })
    .catch(next);
};
