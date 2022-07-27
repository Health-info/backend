const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { Bigpart, Smallpart} = require('../models');

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => {
  Bigpart.findAll({
    include: {
      model: Smallpart,
    },
  })
    .then((bigparts) => {
      res.json({
        code: 200,
        payload: bigparts,
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      });
    });
});

module.exports = router;
