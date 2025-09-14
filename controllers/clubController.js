const Club = require("../models/Club")
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
                clubPhotos: photoUrls
            })
            if(!club){
                return res.status(500).json({success : false , message : "Error in creating club"})
            }

            return this.sendSuccess(res, { club }, "Club created successfully");
        } catch (error) {
            return this.sendError(res, error, "Error in creating club");
        }
    }

    async getAllClubs (req , res){
        try {
            const result = await Club.find({})
            if(!result){
                return res.status(404).json({success : false , message : "No clubs found"})
            }
            return this.sendSuccess(res, { result }, "Clubs fetched successfully");
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
}

module.exports = new ClubController();