const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');
const sanitizetHtml = require('sanitize-html');

const { verifyToken, apiLimiter } = require('./middlewares');
const { isLoggedIn } = require('./middlewares');
const { User ,Bigpart, Smallpart, Exercise, Comment} = require('../models');

const router = express.Router();

router.use(async (req, res, next) => {
  if (req.user) {
    cors({
      origin: req.get('origin'),
      credentials: true,
    })(req, res, next);
  } else {
    next();
  }
});

router.get('/part', (req, res) => {
    Bigpart.findAll({})
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

router.post('/smallpart', async (req, res) => {
    try{
      const bigpart = await Bigpart.findOne({
        where: {
          id: req.body.BigpartId,
        }
      });
      console.log(bigpart);
      if(bigpart){
        const smallparts = await bigpart.getSmallparts();
        res.json({
          code:200,
          payload: smallparts,
        })     
      } else{
        res.status(404).json({message: 'no such bigpart'});
      }

    } catch(error) {
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: '서버 에러',
        });   
    }
});

router.post('/exercise', async (req, res, next) => {
    try {
      const smallpart = await Smallpart.findOne({ where: { id: req.body.SmallpartId } });
      if (smallpart) {
        const exercises  = await smallpart.getExercises();
        res.status(200).json({
          code: 200,
          payload: exercises,
        });
      } else {
        res.status(404).json({message: 'no such smallpart'});
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
});

router.post('/image', async (req, res, next) => {
try {

    const exercise = await Exercise.findOne({ where: {id: req.body.ExerciseId}});
    if(exercise){
        const Images = await exercise.getImages({ limit: 3 });
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

router.get('/comment/:ExerciseId', async (req, res, next) => {
    try {
        const exercise = await Exercise.findOne({ where: {id: req.params.ExerciseId}});
        if(exercise){
          const Comments = await exercise.getComments({ 
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
router.post('/comment', async (req, res, next) => {
  try {
      const exercise = await Exercise.findOne({ where: {id: req.body.ExerciseId}});
      if(exercise){
        
        const comment = await Comment.create({
          UserId: req.user.id,
          ExerciseId: req.body.ExerciseId,
          content: req.body.content
        })
        await exercise.addComments([comment]);
        res.status(200).json({
          code: 200,
          message: 'Comment register success',
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
router.delete('/comment', async (req, res, next) => {
  try {
      const comment = await Comment.destroy({ where: {id: req.body.CommentId}});
      if(comment){
        res.status(200).json({
          code: 200,
          message: 'Comment delete success',
        });
      }
      else {
          res.status(404).json({message: 'no such Comment'}); 
      }
  } catch (err) {
      console.error(err);
      next(err);
  }
  });
router.post('/comment/like' , async (req, res, next) => {
    try{
        const comment = await Comment.findOne({where: {id: req.body.CommentId}});
        if(comment){
            const user = await User.findOne({ where: { id: req.user.id } });
            if (user) {
            await user.addLikings(parseInt(req.body.CommentId, 10));
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
router.post('/comment/unlike', async (req, res, next) => {
    try{
        const comment = await Comment.findOne({where: {id: req.body.CommentId}});
        if(comment){
            const user = await User.findOne({ where: { id: req.user.id } });
            if (user) {

            await user.removeLikings([comment]);
            res.status(200).json({
                code: 200,
                message: "unLike success",
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


    
module.exports = router;
