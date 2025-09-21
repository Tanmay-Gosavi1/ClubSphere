const clubController = require('../controllers/clubController')
const router = require('express').Router() 
const AuthMiddleware = require('../middleware/authMiddleware')

// Anyone can create a club (pending approval)
router.post('/createClub', AuthMiddleware.auth, clubController.createClub.bind(clubController))

// Everyone can see approved clubs
router.get('/allClubs', AuthMiddleware.auth, clubController.getAllClubs.bind(clubController))

// Only admin can edit approved clubs
router.put('/editClub/:clubId', AuthMiddleware.auth, AuthMiddleware.authorizeRoles('admin'), clubController.editClub.bind(clubController))

// Admin-only routes for club approval
router.get('/pending', AuthMiddleware.auth, AuthMiddleware.authorizeRoles('admin'), clubController.getPendingClubs.bind(clubController))
router.put('/approve/:clubId', AuthMiddleware.auth, AuthMiddleware.authorizeRoles('admin'), clubController.approveClub.bind(clubController))
router.delete('/reject/:clubId', AuthMiddleware.auth, AuthMiddleware.authorizeRoles('admin'), clubController.rejectClub.bind(clubController))

// Membership request routes
router.post('/join/:clubId', AuthMiddleware.auth, clubController.requestMembership.bind(clubController))
router.get('/membership-requests/pending', AuthMiddleware.auth, AuthMiddleware.authorizeRoles('admin'), clubController.getPendingMembershipRequests.bind(clubController))
router.put('/membership-requests/approve/:requestId', AuthMiddleware.auth, AuthMiddleware.authorizeRoles('admin'), clubController.approveMembershipRequest.bind(clubController))
router.put('/membership-requests/reject/:requestId', AuthMiddleware.auth, AuthMiddleware.authorizeRoles('admin'), clubController.rejectMembershipRequest.bind(clubController))
router.get('/my-requests', AuthMiddleware.auth, clubController.getUserMembershipRequests.bind(clubController))

module.exports = router