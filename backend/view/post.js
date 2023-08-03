const express = require('express')
const postControllers = require('../controller/postControllers')
const verifyJWT = require('../middleware/verifyJWT')

api = express.Router()

api.get('/', postControllers.handleGetAllPosts)
api.get('/mostread', postControllers.handleGetMostRead)
api.get('/user/:id', postControllers.handleGetUserPosts)
api.get('/:id', postControllers.handleGetPostById)

api.use(verifyJWT)
api.post('/create', postControllers.handleCreatePost)
api.put('/update/:id', postControllers.handleUpdatePost)
api.delete('/delete/:id', postControllers.handleDeletePost)
api.post('/like/:id', postControllers.handlePostLike)

module.exports = api