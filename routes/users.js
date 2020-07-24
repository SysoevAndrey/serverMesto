const router = require('express').Router();
const path = require('path');
const fs = require('fs');

const dataPath = path.resolve(__dirname, '../data/user.json');
const usersData = JSON.parse(fs.readFileSync(dataPath, { encoding: 'utf8' }));

router.get('/', (req, res) => {
  res.send(usersData);
});

router.get('/:id', (req, res) => {
  const user = usersData.find((item) => item._id === req.params.id);

  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ message: 'Нет пользователя с таким id' });
  }
});

module.exports = router;
