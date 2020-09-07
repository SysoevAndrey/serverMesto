const validator = require('validator');

module.exports.linkValidator = (value, helpers) => {
  if (!validator.isURL(value)) {
    return helpers.error('any.invalid');
  }

  return value;
};
