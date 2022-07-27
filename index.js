const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const morgan = require('morgan');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();
const authRouter = require('./routes/auth');
const partRouter = require('./routes/part');
const exerciseRouter = require('./routes/exercise');
const imageRouter = require('./routes/image');
const videoRouter = require('./routes/video');
const commentRouter = require('./routes/comment');

const { sequelize, Exercise } = require('./models');
const passportConfig = require('./passport');
const app = express();
passportConfig();
app.set('port', process.env.PORT || 8002);
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));
app.use(passport.initialize());
app.use(passport.session());




app.use('/auth', authRouter);
app.use('/part', partRouter);
app.use('/exercise', exerciseRouter);;
app.use('/image', imageRouter);
app.use('/video', videoRouter);
app.use('/comment', commentRouter);

app.use((req, res, next) => {
 
  const error =  new Error((`${req.method} There are no ${req.url} router.`));
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.error(err)
  error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.end(error.message);
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
