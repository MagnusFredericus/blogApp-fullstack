const express = require('express')
const authControllers = require('../controller/authControllers')
const verifyJWT = require('../middleware/verifyJWT')

const api = express.Router()

api.post('/register', authControllers.register)
api.post('/login', authControllers.login)
api.get('/refresh', authControllers.refresh)

api.use(verifyJWT)
api.post('/logout', authControllers.logout)

module.exports = api