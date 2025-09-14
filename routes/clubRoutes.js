const { createClub, getAllClubs } = require('../controllers/clubController')
const router = require('express').Router() 
const { editClub } = require('../controllers/clubController')
const { auth, authorizeRoles } = require('../middleware/authMiddleware')

router.post('/createClub' , auth , authorizeRoles('admin') , createClub) // Only admin can create a club
router.get('/allClubs' , getAllClubs)
router.post('/editClub/:clubId' ,auth , authorizeRoles('admin') , editClub)

module.exports = router