const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

/**
 * @swagger
 *
 * /auth/join:
 *  post:
 *    summary: "유저 등록"
 *    description: "POST 방식으로 유저를 등록한다."
 *    tags: [Users]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다. (유저 등록)
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: "유저 고유아이디"
 *                required: true
 *              password:
 *                type: string
 *                description: "유저 비밀번호"
 *                required: true
 *              nick:
 *                type: string
 *                description: "유저 닉네임"
 *                required: true
 *              age:
 *                type: integer
 *                description: "유저 나이"
 *                required: true
 *                default: 25
 *              gender:
 *                type: boolean
 *                description: "유저 성별"
 *                required: true
 *                default: true
 *              weight:
 *                type: integer
 *                description: "유저 몸무게"
 *                required: true
 *                default: 71
 *              height:
 *                type: integer
 *                description: "유저 키"
 *                required: true
 *                default: 179
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
 *                message:
 *                  type: string
 *                  default: "Register success"
 */

router.post('/join', isNotLoggedIn, async (req, res, next) => {

  const { email,
          nick,
          password,
          gender,
          age,
          height,
          weight,
                   } = req.body;
  console.log(req.body)
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(403).json({
        message: "Email that exists"
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
      gender,
      age,
      height,
      weight,
    });
    return res.status(200).json({
      message: "Register success"
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

/**
 * @swagger
 *
 * /auth/login:
 *  post:
 *    summary: "유저 로그인"
 *    description: "POST 방식으로 로그인 한다."
 *    tags: [Users]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다. (유저 로그인)
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: "유저 고유아이디"
 *                required: true
 *              password:
 *                type: string
 *                description: "유저 비밀번호"
 *                required: true
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
 *                message:
 *                  type: string
 *                  default: "Login success"
 */

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.status(403).json(info)
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.status(200).json({
        message: 'Login success'
      });
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});
/**
 * @swagger
 *
 * /auth/logout:
 *  get:
 *    summary: "유저 로그아웃"
 *    description: "GET 방식으로 로그아웃 한다."
 *    tags: [Users]
 *    responses:
 *      "200":
 *        description: 로그아웃 성공 시
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
 *                  default: "Logout success"
 */
router.get('/logout', isLoggedIn, (req, res) => {

  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy();
    res.status(200).json({
      message: 'Logout success'
    });
  });

});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.status(200).json({
    message: 'Login success'
  });
});

module.exports = router;
