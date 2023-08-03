const jwt = require('jsonwebtoken')
const User = require('../model/SQLDatabase/sequelize/userImplementation')
const config = require('../config/config')
const db = require('../model/database')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if(!authHeader) {
        return res.sendStatus(401)
    }

    const token = authHeader
    jwt.verify(
        token,
        config.ACCESS_TOKEN_SECRET,
        async(e, decoded) => {
            if(e) {
                return res.sendStatus(403)
            }
            try {
                req.user = await db.getUserById(decoded.id)
            } catch(e) {
                return res.sendStatus(500)
            }
            next()
        }
    )
}

module.exports = verifyJWT