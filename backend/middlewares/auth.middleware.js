import jwt from 'jsonwebtoken'

const authenticate = async (req, res, next) => {
    // const token = req.header('Authorization')?.replace('Bearer', '').trim()
    const token = req.cookies.token
    if(!token)
        return res.status(400).json({message: "Access Denied"})
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        req.user = decoded
        next()
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export default authenticate