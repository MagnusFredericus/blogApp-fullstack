const jwt = require("jsonwebtoken")
const config = require('../config/config')
const db = require('../model/database')

const ACCESS_TOKEN_EXPIRES_IN = '1d'
const REFRESH_TOKEN_EXPIRES_IN = '1d'
const REFRESH_TOKEN_MAX_AGE = 24*60*60*1000

const register = async(req, res) => {
    const { email, password } = req.body

    if(!email) {
        return res.status(400).json({'message':'Email required'})
    }
    if(!password) {
        return res.status(400).json({'message':'Password required'})
    }
    
    try {
        let duplicate = await db.getUserByEmail(email)
        if(duplicate.hasModel) {
            return res.status(409).json({
                'message':'Email not available'
            })
        }
    } catch(e) {
        if(e.cause === 'email') {
            return res.status(422).json({'message':'Invalid email'})
        }
        return res.sendStatus(500)
    }

    try {
        let user = await db.createUser(email, password)
        if(user.hasModel) {
            return res.status(201).json(await user.toJSON())
        }
    } catch(e) {
        if(e.cause === 'password') {
            return res.status(422).json({'message':'Invalid password'})
        }
        return res.sendStatus(500)
    }
}

const login = async(req, res) => {
    const { email, password } = req.body
    if(!email) {
        return res.status(400).json({'message':'Email required'})
    }
    if(!password) {
        return res.status(400).json({'message':'Password required'})
    }

    let user = {}
    try {
        user = await db.getUserByEmail(email)
        if(!user.hasModel) {
            return res.status(404).json({
                'message':'User email not found'
            })
        }
    } catch(e) {
        return res.sendStatus(500)
    }

    let match = false
    try{
        match = await user.checkPassword(password)
    } catch(e) {
        return res.sendStatus(500)
    }

    if(match) {
        const accessToken = jwt.sign(
            {'id': user.id},
            config.ACCESS_TOKEN_SECRET,
            {expiresIn: ACCESS_TOKEN_EXPIRES_IN}
        )

        const refreshToken = jwt.sign(
            {'id': user.id},
            config.ACCESS_TOKEN_SECRET,
            {expiresIn: REFRESH_TOKEN_EXPIRES_IN}
        )

        try{
            user = await user.update({refreshToken})
        } catch(e) {
            return res.sendStatus(500)
        }

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: REFRESH_TOKEN_MAX_AGE
        })
        return res.status(200).json({accessToken})
    } else {
        return res.status(401).json({'message':'Unauthorized'})
    }
}

const logout = async(req, res) => {
    let user = req.user
    const cookies = req.cookies //postman is not sending cookies with " Secure; HttpOnly; " option for some reason

    if(!cookies?.jwt) {
        return res.sendStatus(204)
    }

    try {
        user = await user.update({'refreshToken':''})
    } catch(e) {
        return res.sendStatus(500)
    }

    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true
    })
    return res.sendStatus(200)
}

//the way this function is implemented has the following consequence:
//many fast requests to refresh() will logout the user, because these
//requests will use the same refreshToken, but during the processing
//of the first request, the refreshToken will be updated, the use of
//the old one by a subsequence request will not find a user in the database
//with the same refreshToken, which will trigger an update to '' (empty string)
//of the refresh token, this will block the user to use refresh() and after the
//accessToken expires the user will be looged out
//This is a race condition and happens
const refresh = async(req, res) => {
    const cookies = req.cookies
    console.log('========================================================')
    console.log(cookies?.jwt || 'x')
    console.log('========================================================')
    if(!cookies?.jwt) {
        return res.sendStatus(401)
    }
    const refreshToken = cookies.jwt
    let user = {}
    try {
        user = await db.getUserByRefreshToken(refreshToken)
    } catch(e) {
        return res.sendStatus(500)
    }

    if(!(user.hasModel)) {
        jwt.verify(
            refreshToken,
            config.ACCESS_TOKEN_SECRET,
            async(error, decoded) => {
                if(error) {
                    return res.sendStatus(403)
                }
                try {
                    let user = await db.getUserById(decoded.id)
                    user = await user.update({'refreshToken':'a'})
                    return res.sendStatus(403)
                } catch(e) {
                    return res.sendStatus(500)
                }
                
            }
        )
    } else {
        jwt.verify(
            refreshToken,
            config.ACCESS_TOKEN_SECRET,
            async(error, decoded) => {
                if(error) {
                    try {
                        user = await user.update({'refreshToken':'b'})
                    } catch(e) {
                        return res.sendStatus(404)
                    }
                }

                if(error || user.id != decoded.id) {
                    return res.sendStatus(403)
                }

                const accessToken = jwt.sign(
                    {'id': user.id},
                    config.ACCESS_TOKEN_SECRET,
                    {expiresIn: ACCESS_TOKEN_EXPIRES_IN}
                )
        
                const newRefreshToken = jwt.sign(
                    {'id': user.id},
                    config.ACCESS_TOKEN_SECRET,
                    {expiresIn: REFRESH_TOKEN_EXPIRES_IN}
                )

                try {
                    user = await user.update({'refreshToken':newRefreshToken})
                } catch(e) {
                    return res.sendStatus(500)
                }

                res.cookie('jwt', newRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    maxAge: REFRESH_TOKEN_MAX_AGE
                })
                return res.status(200).json({accessToken})
            }
        )
    }
}

module.exports = {
    register,
    login,
    logout,
    refresh
}