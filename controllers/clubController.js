const Club = require("../models/Club")
const MembershipRequest = require("../models/MembershipRequest")
const uploadToCloudinary = require("../utils/imageUpload")  

class BaseController {

    sendSuccess(res, data, message = "Success") {
        return res.status(200).json({ success: true, message, ...data });
    }
    sendError(res, error, message = "Error", code = 500) {
        console.log(message, error);
        return res.status(code).json({ success: false, message });
    }
}

class ClubController extends BaseController {
    async createClub(req , res){
        try {
            const { clubName , clubDescription } = req.body

            // Can be array or single file
            const clubPhotos = req.files?.clubPhotos 

            if(!clubName || !clubDescription || !clubPhotos){
                return res.status(400).json({success : false , message : "Incomplete credentials"})
            }

            let photoUrls = []

            if(clubPhotos.length > 0){
                const filesArray = Array.isArray(clubPhotos) ? clubPhotos : [clubPhotos]
                for (const file of filesArray) {
                    const result = await uploadToCloudinary(file, "ClubSphere/clubs")
                    photoUrls.push(result.secure_url)
                }
            }

            const club = await Club.create({
                clubName : clubName ,
                clubDescription : clubDescription ,
                clubPhotos: photoUrls,
                createdBy: req.user._id,
                isApproved: false // Club needs admin approval
            })
            if(!club){
                return res.status(500).json({success : false , message : "Error in creating club"})
            }

            return this.sendSuccess(res, { club }, "Club created successfully and is pending approval");
        } catch (error) {
            return this.sendError(res, error, "Error in creating club");
        }
    }

    async getAllClubs (req , res){
        try {
            // Only show approved clubs to regular users
            // Admins can see all clubs
            const filter = req.user.role === 'admin' ? {} : { isApproved: true };
            
            const result = await Club.find(filter)
                .populate('createdBy', 'userName email')
                .populate('approvedBy', 'userName email')
                .populate('members', 'userName email');
                
            if(!result || result.length === 0){
                return res.status(404).json({success : false , message : "No clubs found"})
            }

            // Add member count and user membership status to each club
            const clubsWithMemberInfo = result.map(club => {
                const clubObj = club.toObject();
                clubObj.memberCount = club.members.length;
                clubObj.isUserMember = club.members.some(member => member._id.toString() === req.user._id.toString());
                return clubObj;
            });

            return this.sendSuccess(res, { clubs: clubsWithMemberInfo }, "Clubs fetched successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in fetching club");
        }
    }

    async editClub (req, res){
        try {
            const { clubId } = req.params;
            const { clubName, clubDescription, imagesToDelete } = req.body;
            const clubPhotos = req.files?.clubPhotos;

            // Find the club
            const club = await Club.findById(clubId);
            if (!club) {
                return res.status(404).json({ success: false, message: "Club not found" });
            }

            // Remove images specified for deletion
            let updatedPhotos = club.clubPhotos
            if (imagesToDelete && Array.isArray(imagesToDelete)) {
                updatedPhotos = updatedPhotos.filter(url => !imagesToDelete.includes(url));
            }

            // Upload new images if provided
            if (clubPhotos) {
                const filesArray = Array.isArray(clubPhotos) ? clubPhotos : [clubPhotos];
                for (const file of filesArray) {
                    const result = await uploadToCloudinary(file, "ClubSphere/clubs");
                    updatedPhotos.push(result.secure_url);
                }
            }

            // Update club fields
            club.clubName = clubName || club.clubName;
            club.clubDescription = clubDescription || club.clubDescription;
            club.clubPhotos = updatedPhotos;

            await club.save();

            return this.sendSuccess(res, { club }, "Club edited successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in editing club");
        }
    }

    // Admin Methods
    async getPendingClubs(req, res) {
        try {
            const pendingClubs = await Club.find({ isApproved: false })
                .populate('createdBy', 'userName email')
                .sort({ createdAt: -1 });

            return this.sendSuccess(res, { clubs: pendingClubs }, "Pending clubs fetched successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in fetching pending clubs");
        }
    }

    async approveClub(req, res) {
        try {
            const { clubId } = req.params;

            const club = await Club.findById(clubId);
            if (!club) {
                return res.status(404).json({ success: false, message: "Club not found" });
            }

            if (club.isApproved) {
                return res.status(400).json({ success: false, message: "Club is already approved" });
            }

            club.isApproved = true;
            club.approvedBy = req.user._id;
            club.approvedAt = new Date();

            await club.save();

            return this.sendSuccess(res, { club }, "Club approved successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in approving club");
        }
    }

    async rejectClub(req, res) {
        try {
            const { clubId } = req.params;
            const { reason } = req.body;

            const club = await Club.findById(clubId);
            if (!club) {
                return res.status(404).json({ success: false, message: "Club not found" });
            }

            // You could add a rejection reason field to the model if needed
            await Club.findByIdAndDelete(clubId);

            return this.sendSuccess(res, {}, "Club rejected and removed successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in rejecting club");
        }
    }

    // Membership Request Methods
    async requestMembership(req, res) {
        try {
            const { clubId } = req.params;
            const { requestMessage } = req.body;
            const userId = req.user._id;

            // Check if club exists and is approved
            const club = await Club.findById(clubId);
            if (!club) {
                return res.status(404).json({ success: false, message: "Club not found" });
            }

            if (!club.isApproved) {
                return res.status(400).json({ success: false, message: "Club is not yet approved" });
            }

            // Check if user is already a member
            if (club.members.includes(userId)) {
                return res.status(400).json({ success: false, message: "You are already a member of this club" });
            }

            // Check if there's already a pending request
            const existingRequest = await MembershipRequest.findOne({
                user: userId,
                club: clubId,
                status: 'pending'
            });

            if (existingRequest) {
                return res.status(400).json({ success: false, message: "You already have a pending request for this club" });
            }

            // Create membership request
            const membershipRequest = await MembershipRequest.create({
                user: userId,
                club: clubId,
                requestMessage: requestMessage || ""
            });

            await membershipRequest.populate(['user', 'club']);

            return this.sendSuccess(res, { request: membershipRequest }, "Membership request sent successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in requesting membership");
        }
    }

    async getPendingMembershipRequests(req, res) {
        try {
            const pendingRequests = await MembershipRequest.find({ status: 'pending' })
                .populate('user', 'userName email')
                .populate('club', 'clubName clubDescription')
                .sort({ createdAt: -1 });

            return this.sendSuccess(res, { requests: pendingRequests }, "Pending membership requests fetched successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in fetching pending membership requests");
        }
    }

    async approveMembershipRequest(req, res) {
        try {
            const { requestId } = req.params;

            const membershipRequest = await MembershipRequest.findById(requestId)
                .populate('user')
                .populate('club');

            if (!membershipRequest) {
                return res.status(404).json({ success: false, message: "Membership request not found" });
            }

            if (membershipRequest.status !== 'pending') {
                return res.status(400).json({ success: false, message: "This request has already been processed" });
            }

            // Update membership request
            membershipRequest.status = 'approved';
            membershipRequest.approvedBy = req.user._id;
            membershipRequest.processedAt = new Date();
            await membershipRequest.save();

            // Add user to club members
            await Club.findByIdAndUpdate(membershipRequest.club._id, {
                $addToSet: { members: membershipRequest.user._id }
            });

            return this.sendSuccess(res, { request: membershipRequest }, "Membership request approved successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in approving membership request");
        }
    }

    async rejectMembershipRequest(req, res) {
        try {
            const { requestId } = req.params;
            const { rejectionReason } = req.body;

            const membershipRequest = await MembershipRequest.findById(requestId);

            if (!membershipRequest) {
                return res.status(404).json({ success: false, message: "Membership request not found" });
            }

            if (membershipRequest.status !== 'pending') {
                return res.status(400).json({ success: false, message: "This request has already been processed" });
            }

            // Update membership request
            membershipRequest.status = 'rejected';
            membershipRequest.approvedBy = req.user._id;
            membershipRequest.rejectionReason = rejectionReason || "No reason provided";
            membershipRequest.processedAt = new Date();
            await membershipRequest.save();

            return this.sendSuccess(res, { request: membershipRequest }, "Membership request rejected successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in rejecting membership request");
        }
    }

    async getUserMembershipRequests(req, res) {
        try {
            const userId = req.user._id;

            const userRequests = await MembershipRequest.find({ user: userId })
                .populate('club', 'clubName clubDescription clubPhotos')
                .sort({ createdAt: -1 });

            return this.sendSuccess(res, { requests: userRequests }, "User membership requests fetched successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in fetching user membership requests");
        }
    }
}

module.exports = new ClubController();