const db = require('../model/database')

const handleGetAllPosts = async(req, res) => {
    try {
        let posts = await db.getAllPosts()
        if(posts.length > 0) {
            let postsJSON = await Promise.all(
                posts.map(post => {return post.toJSON()})
            )
            return res.status(200).json(postsJSON)
        }
        return res.sendStatus(204)
    } catch(e) {
        return res.sendStatus(500)
    }
}

const handleGetMostRead = async(req, res) => {
    try {
        let posts = await db.getAllPosts()
        if(posts.length > 0) {
            posts.sort((a,b) => (b.views - a.views))
            let mostRead = posts.slice(0,10)
            let mostReadJSON = await Promise.all(
                mostRead.map(post => post.toJSON())
            )
            return res.status(200).json(mostReadJSON)
        }
        return res.sendStatus(204)
    } catch(e) {
        return res.sendStatus(500)
    }
}

const handleGetUserPosts = async(req, res) => {
    const id = req.params.id

    try {
        let posts = await db.getPostsByUser(id)
        if(posts.length > 0) {
            let postsJSON = await Promise.all(
                posts.map(post => {return post.toJSON()})
            )
            return res.status(200).json(postsJSON)
        }
        return res.sendStatus(204)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({'message':'id must be an integer'})
        }
        return res.sendStatus(500)
    }
}

const handleGetPostById = async(req, res) => {
    const id = req.params.id

    try {
        let post = await db.getPostByIdUpdateViews(id)
        if(post.hasModel) {
            return res.status(200).json(await post.toJSON())
        }
        return res.sendStatus(204)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({'message':'id must be an integer'})
        }
        return res.sendStatus(500)
    }
}

const handleCreatePost = async(req, res) => {
    const { title, content } = req.body
    if(!title || !content) {
        return res.status(400).json({
            'message':'title and content required in request body'
        })
    }

    let user = req.user
    data = {
        'userId': user.id,
        'title': title, 
        'content': content
    }

    try {
        let post = await user.createPost(data)
        if(post.hasModel) {
            return res.status(200).json(await post.toJSON())
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'title') {
            return res.status(422).json({'message':'valid title required'})
        }
        if(e.cause === 'content') {
            return res.status(422).json({'message':'valid content required'})
        }
        return res.sendStatus(500)
    }
}

const handleUpdatePost = async(req, res) => {
    const user = req.user
    const id = req.params.id
    const { title, content } = req.body

    if(!(title || content)) {
        return res.status(400).json({
            'message':'valid request body required'
        })
    }

    let data = {}
    if(title) data.title = title
    if(content) data.content = content

    //could make just 1 call to db
    try {
        let post = await db.getPostById(id)
        if(post.hasModel) {
            if(user.id === post.userId) {
                post = await post.update(data)
                return res.status(200).json(await post.toJSON())    
            } else {
                return res.sendStatus(403)
            }
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'title') {
            return res.status(400).json({'message':'valid title required'})
        }
        if(e.cause === 'content') {
            return res.status(400).json({'message':'valid content required'})
        }
        return res.sendStatus(500)
    }
}

const handleDeletePost = async(req, res) => {
    const user = req.user
    const id = req.params.id

    try {
        let post = await db.getPostById(id)
        if(post.hasModel) {
            if(user.id === post.userId) {
                await post.delete()
                return res.sendStatus(200)
            } else {
                return res.sendStatus(403)
            }
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({'message':'id must be an integer'})
        }
        return res.sendStatus(500)
    }
}

const handlePostLike = async(req, res) => {
    const id = req.params.id

    let user = req.user
    try {
        let totalLikes = await user.likePost(id)
        if(!isNaN(totalLikes)) {
            return res.status(201).json({'totalLikes': totalLikes})
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({'message':'id must be an integer'})
        }
        if(e.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({'message':'it is only possible to like a post one time'})
        }
        return res.sendStatus(500)
    }
}

module.exports = {
    handleGetAllPosts,
    handleGetMostRead,
    handleGetUserPosts,
    handleGetPostById,
    handleCreatePost,
    handleUpdatePost,
    handleDeletePost,
    handlePostLike,
}