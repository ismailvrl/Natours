const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

console.log(process.env.NODE_ENV);

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data drom body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
// Data sanitization against XSS

function cleanObject(obj) {
  const cleaned = {};
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      cleaned[key] = xss(mongoSanitize(obj[key]));
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleaned[key] = cleanObject(obj[key]);
    } else {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

module.exports = (req, res, next) => {
  req.body = cleanObject(req.body);
  req.params = cleanObject(req.params);
  req.query = cleanObject(req.query); // Yeni obje oluşturuyoruz → Express 5 uyumlu
  next();
};

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Serrving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
