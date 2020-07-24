const router = require('express').Router();
const path = require('path');
const fs = require('fs');

const dataPath = path.resolve(__dirname, '../data/user.json');
const usersData = JSON.parse(fs.readFileSync(dataPath, { encoding: 'utf8' }));

router.get('/', (req, res) => {
  res.send(usersData);
});

router.get('/:id', (req, res) => {
  if (!usersData.some((item) => item._id === req.params.id)) {
    res.status(404).send({ "message": "Нет пользователя с таким id" });

    return;
  }

  res.send(usersData.find((item) => item._id === req.params.id))
});

module.exports = router;
