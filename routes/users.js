const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getAllUsers, getUserById, updateProfile, updateAvatar,
} = require('../controllers/users');

router.get('/', getAllUsers);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.objectId().length(24).hex(),
  }),
}),  getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().uri(),
  }),
}), updateAvatar);

module.exports = router;
