const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { Exercise } = require('../models');

const router = express.Router();

router.get('/:id', isLoggedIn, async (req, res, next) => {
try {
    const ExerciseId = req.params.id;
    const exercise = await Exercise.findOne({ where: {id: ExerciseId}});
    if(exercise){
      const Images = exercise.getImages({ limit: 3 });
      res.status(200).json({
        code: 200,
        payload: Images
      });
    }
    else {
        res.status(404).json({message: 'no such Exercise'}); 
    }
} catch (err) {
    console.error(err);
    next(err);
}
});

module.exports = router;