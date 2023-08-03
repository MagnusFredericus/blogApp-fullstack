const express = require('express')
const commentControllers = require('../controller/commentControllers')
const verifyJWT = require('../middleware/verifyJWT')

api = express.Router()

api.get('/:id', commentControllers.handleGetComments)

api.use(verifyJWT)
api.post('/create/:id', commentControllers.handleCreateComment)
api.put('/update/:id', commentControllers.handleUpdateComment)
api.delete('/delete/:id', commentControllers.handleDeleteComment)
api.post('/like/:id', commentControllers.handleLikeComment)

module.exports = api