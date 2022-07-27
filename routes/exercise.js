const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { Smallpart, Exercise, Comment } = require('../models');

const router = express.Router();

router.post('/', isLoggedIn, async (req, res, next) => {
    try {
      const SmallpartId = req.body.id;
      const smallpart = await Smallpart.findOne({ where: { id: SmallpartId } });
      if (smallpart) {
        const Exercises  = await smallpart.getExercises();
        res.status(200).json({
          code: 200,
          payload: Exercises,
        });
      } else {
        res.status(404).json({message: 'no such smallpart'});
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

module.exports = router;
