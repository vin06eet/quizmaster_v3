import User from '../models/user.model.js'
import mongoose from 'mongoose'

const getUser = async (req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user)
            return res.status(404).json({message: 'User not found'})
        res.status(200).json({user})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const updateUser = async (req, res)=>{
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if(!user)
            return res.status(404).json({message: 'User not found'})
        res.status(200).json({user})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const deleteUser = async (req, res)=>{
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user)
            return res.status(404).json({message: 'User not found'})
        res.status(200).json({user})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const displayAllUser = async (req, res)=>{
    try {
        const users = await User.find({})
        if(!users)
            return res.status(404).json({message: 'User not found'})
        res.status(200).json({users})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const markAsRead = async (req, res) => {
    try {
        const userID = req.user._id;
        const announceID = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userID))
            return res.status(400).json({ error: "Invalid user ID" });
        if (!mongoose.Types.ObjectId.isValid(announceID))
            return res.status(400).json({ error: "Invalid announcement ID" });
        const user = await User.findById(userID);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const announcement = user.announcements.find(a => a._id.toString() === announceID);
        if (!announcement)
            return res.status(404).json({ error: "Announcement not found" });
        announcement.read = true;
        await user.save(); 
        res.status(200).json({ message: "Marked as read successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markAllAsRead = async (req, res)=>{
    try {
        const userID = req.user._id
        if(!mongoose.Types.ObjectId.isValid(userID))
            return res.status(404).json({error: "Invalid user ID"})
        const user = await User.findById(userID)
        if(!user)
            return res.status(404).json({error: "User not found"})
        user.announcements.forEach(announcement => {
            announcement.read = true;
        })
        user.markModified("announcements");
        await user.save();
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const deleteNotif = async (req, res) => {
    try {
        const userID = req.user._id;
        const announceID = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userID))
            return res.status(400).json({ error: "Invalid user ID" });
        if (!mongoose.Types.ObjectId.isValid(announceID))
            return res.status(400).json({ error: "Invalid announcement ID" });
        const user = await User.findById(userID);
        if (!user) 
            return res.status(404).json({ error: "User not found" });
        const updatedUser = await User.findByIdAndUpdate(
            userID,
            { $pull: { announcements: { _id: announceID } } }, 
            { new: true }
        );
        if (!updatedUser) 
            return res.status(404).json({ error: "Announcement not found" });
        res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getUser,
    updateUser,
    deleteUser,
    displayAllUser,
    markAsRead,
    markAllAsRead,
    deleteNotif
}
