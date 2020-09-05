const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { default: validator } = require('validator');
const {
  getAllUsers, getUserById, updateProfile, updateAvatar,
} = require('../controllers/users');

const linkValidator = (value, helpers) => {
  if (!validator.isURL(value)) {
    return helpers.error('any.invalid');
  }

  return value;
};

router.get('/', getAllUsers);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.objectId().length(24).hex(),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().custom(linkValidator),
  }),
}), updateAvatar);

module.exports = router;
