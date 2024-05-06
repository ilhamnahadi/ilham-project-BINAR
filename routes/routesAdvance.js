const express = require('express');
const router = express.Router();

const TravelAdvance = require('../controller/travelAdvance');

// ROUTES
router.get('/TA', TravelAdvance.showTravelAdvance);
router.get('/TA/:id', TravelAdvance.showListTravelAdvance);
router.post('/TA', TravelAdvance.createTravelAdvance);
router.put('/TA/:id', TravelAdvance.updateTravelAdvance);
router.delete('/TA/:id', TravelAdvance.deleteTravelAdvance);

module.exports = router;