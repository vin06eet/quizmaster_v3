import User from '../models/user.model.js'

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

export {
    getUser,
    updateUser,
    deleteUser,
    displayAllUser
}
