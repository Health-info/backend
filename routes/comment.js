const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { Exercise, User, Comment } = require('../models');
const { Op } = require("sequelize");
const { sequelize } = require('../models');
const router = express.Router();

router.get('/:id', isLoggedIn, async (req, res, next) => {
try {
    const ExerciseId = req.params.id;
    const exercise = await Exercise.findOne({ where: {id: ExerciseId}});
    if(exercise){
      const Comments = exercise.getComments({ 
        include:{
          model: User,
          as: 'Likers',
      }});
      res.status(200).json({
        code: 200,
        payload: Comments,
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



router.get('/:id/like', isLoggedIn, async (req, res, next) => {
  try{
    const comment = await Comment.findOne({where: {id: req.params.id}});
    if(comment){
      const user = await User.findOne({ where: { id: req.user.id } });
      if (user) {
      await user.addLikings(parseInt(req.params.id, 10));
      res.status(200).json({
        code: 200,
        message: "Like success",
      });
      } else {
        res.status(404).json({
        message: 'no such user'
        });
      }
      
    }
    else {
        res.status(404).json({
        message: 'no such comment'
        });
    }
} catch( error) {
    console.error(error);
    next(error);
}
});


router.get('/:id/unlike', isLoggedIn, async (req, res, next) => {
    try{
      const comment = await Comment.findOne({where: {id: req.params.id}});
      if(comment){
        const user = await User.findOne({ where: { id: req.user.id } });
        if (user) {
          await sequelize.models.UserLikeComment.destroy({
            where: {[Op.and]: [
            { UserId: req.user.id },
            { CommentId: parseInt(req.params.id, 10) }
            ]},
            truncate: true
          });
          res.status(200).json({
          code: 200,
          message: 'unlike success'
          });
        } else {
          res.status(404).json({
          message: 'no such user'
          });
        }
      } else {
          res.status(404).json({
          message: 'no such comment'
        });
      }
    } catch( error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
