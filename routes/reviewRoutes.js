const express = require('express');
const ReviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// POST /tour/:tourId/reviews
// GET /tour/:tourId/reviews
// POST /reviews

router
  .route('/')
  .get(ReviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    ReviewController.setTourUserIds,
    ReviewController.createReview,
  );

router
  .route('/:id')
  .get(ReviewController.getReview)
  .patch(ReviewController.updateReview)
  .delete(ReviewController.deleteReview);
module.exports = router;
