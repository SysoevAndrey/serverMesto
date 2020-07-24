const router = require('express').Router();
const path = require('path');
const fs = require('fs');

const dataPath = path.resolve(__dirname, '../data/cards.json');
const cardsData = JSON.parse(fs.readFileSync(dataPath, { encoding: 'utf8' }));

router.get('/', (req, res) => {
  res.send(cardsData);
});

module.exports = router;