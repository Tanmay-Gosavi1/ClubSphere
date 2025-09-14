const jwt = require('jsonwebtoken')

// Authentication middleware
class AuthMiddleware {
    static async auth(req, res, next) {
        try {
            const authHeader = req.headers.authorization || req.headers.Authorization

            if (!authHeader) {
                return res.status(401).json({ success: false, message: "Token not found!" })
            }

            const token = authHeader.split(" ")[1]
            if (!token) {
                return res.status(401).json({ success: false, message: "Token missing!" })
            }

            const decode = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decode
            next()
        } catch (error) {
            console.log(error)
            return res.status(401).json({ success: false, message: "Authorization failed" })
        }
    }

    static authorizeRoles (...allowedRoles){
        return (req, res, next) => {
            try {
                if (!req.user || !allowedRoles.includes(req.user.role)) {
                    return res.status(403).json({ success: false, message: "Access denied" })
                }
                next()
            } 
            catch (error) {
                console.log(error)
                return res.status(500).json({ success: false, message: "Authorization failed" })
            }
        }
    }
}
module.exports = AuthMiddleware