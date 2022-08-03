const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const session = require('express-session');
const logger = require('./logger.js');
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger/swagger');


const dotenv = require('dotenv');

dotenv.config();
const authRouter = require('./routes/auth');
const v1 = require('./routes/v1');

const { sequelize } = require('./models');
const passportConfig = require('./passport');
const app = express();
passportConfig();
app.set('port', process.env.PORT || 8002);

sequelize.sync({ force: true })
  .then(async () => {
    console.log('데이터베이스 연결 성공');
    
  await sequelize.query("INSERT INTO bigparts (name) VALUES ('어깨'), ('하체'), ('가슴'), ('등'), ('코어'), ('복근'), ('팔')");
    
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (1, '전면'), (1, '측면'), (1, '후면')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (2, '대퇴사두'), (2, '대퇴이두'), (2, '둔근'), (2, '비복근')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (3, '상부'), (3, '중부'), (3, '하부')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (4, '상부승모'), (4, '중앙승모'), (4, '광배상부'), (4, '광배하부'), (4, '기립근')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (5, '코어')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (6, '복직근'), (6, '외복사근'), (6, '내복사근'), (6, '복횡근')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (7, '전완근'), (7, '이두'), (7, '삼두')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (1, '','Shoulder Press')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (2, '','Side lateral raise')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (3, '','Bent-over lateral raise')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (4, '','Squat')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (5, '','LyingLegCurl')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (6, '','Glute bridges')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (7, '','Calf Raise')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (8, '','Incline bench press')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (9, '','Cable CrossOver')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (10, '','Dips')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (11, '','Upright Row')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (12, '','Shrug')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (13, '','Pull up')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (14, '','Deadlift')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (15, '','Superman back extension')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (16, '','Planks')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (17, '','Reverse Crunch')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (18, '','Side band')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (19, '','Bicycle Crunch')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (20, '','Dead bug')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (21, '','Wrist Curl')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (22, '','Dumbbell Curl')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (23, '','lying triceps extension')")
  
  })
  .catch((err) => {
    console.error(err);
  });

  router.use((req, res, next) => { cors({origin: req.get('origin'), credentials: true}); next(); }
  );

const sessionOption =  {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
};

if(process.env.NODE_ENV === 'production'){
  app.use(morgan('combined'));
  sessionOption.proxy = true;
  // sessionOption.cookie.secure = true;   https 일때
  //app.enable('trust proxy') 프록시 서버 사용할때 사용
  app.use(helmet({ contentSecurityPolicy: false }));
  // contentSecurityPolicy: false 하는게 에러가 덜 난다
  app.use(hpp());
} else {
  app.use(morgan('dev'));
}  


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session(sessionOption));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

app.use('/auth', authRouter);
app.use(require('./routes/middlewares').isLoggedIn);
app.use('/v1', v1);




app.use((req, res, next) => {
 
  const error =  new Error((`${req.method} There are no ${req.url} router.`));
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  logger.error(err)
  error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.end(error.message);
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
