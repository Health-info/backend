const express = require('express');
const jwt = require('jsonwebtoken');

const url = require('url');
const path = require("path");
const sanitizetHtml = require('sanitize-html');

const { verifyToken, apiLimiter } = require('./middlewares');
const { isLoggedIn } = require('./middlewares');
const { User ,Bigpart, Smallpart, Exercise, Comment} = require('../models');

const router = express.Router();





router.use(isLoggedIn, express.static(path.join(__dirname, '/../public')));
/**
 * @swagger
 *
 * /v1/part:
 *  get:
 *    summary: "Bigparts 조회"
 *    description: "GET 방식으로 Bigparts 를 조회한다.."
 *    tags: [Bigparts]
 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다. (유저 등록)
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                  default: 200
 *                payload:
 *                  type: array
 *                  example: [{"id": 1, "name" : "어깨"}, {"id": 2, "name" : "하체"}]
 */
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

/**
 * @swagger
 *
 * /v1/smallpart:
 *  post:
 *    summary: "Smallparts 조회"
 *    description: "POST 방식으로 Smallparts를 조회한다."
 *    tags: [Smallparts]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다. (Smallparts 조회)
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              BigpartId:
 *                type: integer
 *                description: "BigpartId"
 *                required: true
 *                default: 1
 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다. 
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                  default: 200
 *                payload:
 *                  type: array
 *                  example: [{"id": 1, "Bigpartid": 1, "name" : "전면"}, {"id": 2, "Bigpartid": 1, "name" : "측면"}, {"id": 3, "Bigpartid": 1, "name" : "후면"}]
 */
router.post('/smallpart', async (req, res) => {
    try{
      const bigpart = await Bigpart.findOne({
        where: {
          id: req.body.BigpartId,
        }
      });
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

/**
 * @swagger
 *
 * /v1/exercise:
 *  post:
 *    summary: "Exercises 조회"
 *    description: "POST 방식으로 Exercises를 조회한다."
 *    tags: [Exercises]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다. (Exercises 조회)
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              SmallpartId:
 *                type: integer
 *                description: "SmallpartId"
 *                required: true
 *                default: 1
 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                  default: 200
 *                payload:
 *                  type: array
 *                  example: [{"id": 1, "Smallpartid": 1, description": "좋은 운동입니다.", "name" : "Shoulder Press"}]
 */

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

/**
 * @swagger
 *
 * /v1/comment/{ExerciseId}:
 *  get:
 *    summary: "특정 Exercise에 대한 Comment 조회"
 *    description: "get 방식으로 Exercise에 대한 댓글을 조회한다."
 *    tags: [Comment]
 *    parameters:
 *      - in: path
 *        name: ExerciseId
 *        required: true
 *        description: ExerciseId
 *        default: 1
 *        schema:
 *          type: number
 *    responses:
 *      "200":
 *        description: "UserId: 댓글 쓴사람 , Likers: 댓글에 좋아요 누른사람들"
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                  default: 200
 *                payload:
 *                  type: array
 *                  example: [{"id": 1, "UserId": 2,"content": "이 운동 이렇게 하는거 아닌데", "Likers": [{"id": 3}, {"id": 4}, {"id": 5}]}]
 */


router.get('/comment/:ExerciseId', async (req, res, next) => {
    try {
        const exercise = await Exercise.findOne({ where: {id: req.params.ExerciseId}});
        if(exercise){
          const Comments = await exercise.getComments({ 
            include:{
              model: User,
              as: 'Likers',
              attributes: ['id']
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

/**
 * @swagger
 *
 * /v1/comment:
 *  post:
 *    summary: "댓글 등록"
 *    description: "POST 방식으로 댓글을 등록한다."
 *    tags: [Comment]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              ExerciseId:
 *                type: integer
 *                description: "ExerciseId"
 *                required: true
 *                default: 1
 * 
 *              content:
 *                type: string
 *                description: "댓글 내용"
 *                required: true
 *                default: "운동 개못하네 ㅋㅋ"
 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                  default: 200
 *                message:
 *                  type: string
 *                  default: 'Comment register success'
 */

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

/**
 * @swagger
 *
 * /v1/comment:
 *  delete:
 *    summary: "댓글 삭제"
 *    description: "DELETE 방식으로 댓글을 삭제한다."
 *    tags: [Comment]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              CommentId:
 *                type: integer
 *                description: "CommentId"
 *                required: true
 *                default: 1

 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                  default: 200
 *                message:
 *                  type: string
 *                  default: 'Comment delete success'
 */

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
/**
 * @swagger
 *
 * /v1/comment/like:
 *  post:
 *    summary: "댓글 좋아요"
 *    description: "POST 방식으로 댓글 좋아요를 등록한다."
 *    tags: [Comment]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              CommentId:
 *                type: integer
 *                description: "CommentId"
 *                required: true
 *                default: 1

 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                  default: 200
 *                message:
 *                  type: string
 *                  default: "Like success"
 */

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

/**
 * @swagger
 *
 * /v1/comment/unlike:
 *  post:
 *    summary: "댓글 좋아요 취소"
 *    description: "POST 방식으로 댓글 좋아요를 취소한다."
 *    tags: [Comment]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              CommentId:
 *                type: integer
 *                description: "CommentId"
 *                required: true
 *                default: 1

 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                  default: 200
 *                message:
 *                  type: string
 *                  default: "unLike success"
 */

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

/**
 * @swagger
 *
 * /v1/images/{ExerciseId}.jpg:
 *  get:
 *    summary: "Exercise 이미지 조회"
 *    description: "GET 방식으로 Exercise 이미지 를 조회한다.."
 *    tags: [Image]
 *    parameters:
 *      - in: path
 *        name: ExerciseId
 *        required: true
 *        description: ExerciseId
 *        default: "1"
 *        schema:
 *          type: string
 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 */


    
module.exports = router;
