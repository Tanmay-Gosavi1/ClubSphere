const clubController = require('../controllers/clubController')
const router = require('express').Router() 
const AuthMiddleware = require('../middleware/authMiddleware')

router.post('/createClub' , AuthMiddleware.auth , AuthMiddleware.authorizeRoles('admin') , clubController.createClub.bind(clubController)) // Only admin can create a club
router.get('/allClubs' , clubController.getAllClubs.bind(clubController))
router.put('/editClub/:clubId' ,AuthMiddleware.auth , AuthMiddleware.authorizeRoles('admin') , clubController.editClub.bind(clubController)) // Only admin can edit a club

module.exports = router