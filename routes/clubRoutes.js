const { createClub, getAllClubs } = require('../controllers/clubController')
const router = require('express').Router() 

router.post('/createClub' , createClub)
router.get('/allClubs' , getAllClubs)

module.exports = router