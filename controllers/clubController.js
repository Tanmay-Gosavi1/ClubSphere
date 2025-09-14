const Club = require("../models/Club")
const uploadToCloudinary = require("../utils/imageUpload")  

exports.createClub = async (req , res) => {
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

        return res.status(201).json({success : true , message : "Club created successfully" , club : club})
    } catch (error) {
        console.log("Error in creating club" , error)
        return res.status(500).json({success : false , message : "Error in creating club"})
    }
}

exports.getAllClubs = async (req , res) => {
    try {
        const result = await Club.find({})
        if(!result){
            return res.status(404).json({success : false , message : "No clubs found"})
        }
        return res.status(200).json({success : true , clubs : result})
    } catch (error) {
       console.log("Error in fetching clubs" , error) 
       return res.status(500).json({success : false , message : "Error in fetching clubs"}) 
    }
}

exports.editClub = async (req, res) => {
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

        return res.status(200).json({ success: true, message: "Club updated successfully", club });
    } catch (error) {
        console.log("Error in editing club", error);
        return res.status(500).json({ success: false, message: "Error in editing club" });
    }
}