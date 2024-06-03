export function validateUser (req, res, next) {
    const { user } = req.headers
    if (!user) {
        return res.sendStatus(401)
    }
    
    next()
}