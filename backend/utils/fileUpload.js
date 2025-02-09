import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: 'dvecae8nn', 
    api_key: '126387173356484', 
    api_secret: 'rpn1YONPpLrc9lIGLnbA0itSL_c' 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath)
            return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
        console.log('File uploaded successfully', response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.error('Error uploading file to Cloudinary:', error);
        return null;
    }
};

export { uploadOnCloudinary };