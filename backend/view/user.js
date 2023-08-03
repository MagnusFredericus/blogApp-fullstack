const express = require('express')
const userControllers = require('../controller/userControllers')
const verifyJWT = require('../middleware/verifyJWT')

var api = express.Router()

api.get('/', userControllers.hadleGetAllUsers)
api.get('/friends', verifyJWT, userControllers.handleGetFriends)
api.get('/friendshipinvitations', verifyJWT, userControllers.handleGetFriendshipInvitations)
api.get('/:id', userControllers.handleGetUserById)

api.use(verifyJWT)
api.put('/update', userControllers.handleUpdateUser)
api.post('/addfriend/:id', userControllers.handleAddFriend)
api.post('/acceptfriend/:id', userControllers.handleAcceptFriend)
api.delete('/rejectfriend/:id', userControllers.handleRejectFriend)
api.delete('/removefriend/:id', userControllers.handleRemoveFriend)

module.exports = api