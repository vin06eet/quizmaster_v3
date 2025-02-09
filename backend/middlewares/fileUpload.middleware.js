import { uploadOnCloudinary } from "../utils/fileUpload.js";

const uploadImage = async (req, res, next) => {
    try {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path)
        if(!cloudinaryResponse)
            return res.status(400).json({error: 'Failed to upload on cloudinary'})
        req.fileUrl = cloudinaryResponse.url
        next()
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {uploadImage}