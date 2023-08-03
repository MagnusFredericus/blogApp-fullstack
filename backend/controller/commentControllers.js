const db = require('../model/database')

const handleGetComments = async(req, res) => {
    const id = req.params.id

    try {
        //could call db only 1 time
        let post = await db.getPostById(id)
        if(post.hasModel) {
            let comments = await post.comments
            if(comments.length > 0) {
                let commentsJSON = await Promise.all(
                    comments.map(comment => comment.toJSON())
                )
                return res.status(200).json(commentsJSON)
            }
        }
        return res.sendStatus(204)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({
                'message':'id must be an integer'
            })
        }
        return res.sendStatus(500)
    }
}

const handleCreateComment = async(req, res) => {
    const postId = req.params.id
    const { content } = req.body
    
    if(!content) {
        return res.status(400).json({
            'message':'content required in request body'
        })
    }

    let user = req.user
    data = {
        'userId': user.id,
        'author': user.email,
        'postId': postId,
        'content': content
    }

    try {
        let comment = await user.createComment(data)
        if(comment.hasModel) {
            return res.status(200).json(await comment.toJSON())
        }
        return res.sendStatus(204)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({
                'message':'id must be an integer'
            })
        }
        if(e.cause === 'content') {
            return res.status(422).json({
                'message':'valid content required'
            })
        }
        if(e.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                'message':'cannot comment, post not found'
            })
        }
        return res.sendStatus(500)
    }
}

const handleUpdateComment = async(req, res) => {
    let user = req.user
    const id = req.params.id
    const { content } = req.body
    
    if(!content) {
        return res.status(400).json({
            'message':'content required in request body'
        })
    }

    try {
        let comment = await db.getCommentById(id)
        if(comment.hasModel) {
            if(user.id === comment.userId) {
                comment = await comment.update({content})
                return res.status(200).json(await comment.toJSON())
            } else {
                return res.sendStatus(403)
            }
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({
                'message':'id must be an integer'
            })
        }
        if(e.cause === 'content') {
            return res.status(422).json({
                'message':'valid content required'
            })
        }
        return res.sendStatus(500)
    }
}

const handleDeleteComment = async(req, res) => {
    let user = req.user
    const id = req.params.id

    try {
        let comment = await db.getCommentById(id)
        if(comment.hasModel) {
            if(user.id === comment.userId) {
                await comment.delete()
                return res.sendStatus(200)
            } else {
                return res.sendStatus(403)
            }
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({
                'message':'id must be an integer'
            })
        }
        return res.sendStatus(500)
    }
}

const handleLikeComment = async(req, res) => {
    let user = req.user
    const id = req.params.id

    try {
        const bool = await user.likeComment(id)
        if(bool) {
            return res.sendStatus(201)
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({'message':'id must be an integer'})
        }
        if(e.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({'message':'it is only possible to like a comment one time'})
        }
        return res.sendStatus(500)
    }
}

module.exports = {
    handleGetComments,
    handleCreateComment,
    handleUpdateComment,
    handleDeleteComment,
    handleLikeComment
}