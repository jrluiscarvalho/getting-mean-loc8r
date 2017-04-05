var express = require('express');
var router = express.Router();
var ctrlLocations = require('../controllers/locations');
var ctrlReviews = require('../controllers/reviews');

//estabelecimentos (locations)
//router.get('/locations', ctrlLocations.locationsListByDistance);
router.post('/location', ctrlLocations.locationsCreate);
//router.get('/locations/:locationId', ctrlLocations.locationsReadOne);
//router.put('/locations/:locationId', ctrlLocations.locationsUpdateOne);
//router.delete('/locations/:locationId', ctrlLocations.locationsDeleteOne);

 //resenhas (reviews)
//router.post('/locations/:locationId/reviews', ctrlReviews.reviewsCreate);
//router.get('/locations/:locationId/reviews/:reviewId', ctrlReviews.reviewsReadOne);
//router.put('/locations/:locationId', ctrlReviews.reviewsUpdateOne);
//router.delete('/locations/:locationId', ctrlReviews.reviewsDeleteOne);

 module.exports = router;