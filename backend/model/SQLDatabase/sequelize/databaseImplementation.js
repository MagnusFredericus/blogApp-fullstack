const databaseInterface = require('../../databaseInterface')
const sequelizeORM = require('./sequelizeORM/sequelizeorm')
const User = require('./userImplementation')
const Post = require('./postImplementation')
const Comment = require('./commentImplementation')

class sequelizeDatabase extends databaseInterface {
    constructor() { 
        super() 
        this.User = User
        this.Post = Post
        this.Comment = Comment
    }
    

    //==== DATABASE ====
    async syncDB(config) {
        if(config.force) {
            return sequelizeORM.sequelize.sync({force:true})
        } else {
            return sequelizeORM.sequelize.sync({force:false})
        }
    }

    //==== USERS ====
    async _createUser(email, password) {
        try {
            let sequelizeUser = await sequelizeORM.User.create({
                'email':email,
                'password':password
            })
            return new this.User(sequelizeUser)
        } catch(e) {
            throw(e)
        }
    }

    async _getUserById(id) {
        try {
            let sequelizeUser = await sequelizeORM.User.findByPk(id)
            return new this.User(sequelizeUser)
        } catch(e) {
            throw(e)
        }
    }

    async _getUserByEmail(email) {
        try {
            let sequelizeUser = await sequelizeORM.User.findOne({
                where: {'email':email}
            })
            return new User(sequelizeUser)
        } catch(e) {
            throw(e)
        }
    }

    async _getUserByRefreshToken(refreshToken) {
        try{
            let sequelizeUser = await sequelizeORM.User.findOne({
                where:{refreshToken:refreshToken}
            })
            return new User(sequelizeUser)
        } catch(e) {

        }
    }

    async getAllUsers() {
        try{
            let sequelizeUsers = await sequelizeORM.User.findAll()
            if(sequelizeUsers.length > 0) {
                let users = sequelizeUsers.map(sequelizeUser => {
                    return new User(sequelizeUser)
                })
                return users
            }
            return []
        } catch(e) {
            throw(e)
        }
    }


    //==== POSTS ====
    async _getPostById(id) {
        try {
                let sequelizePost = await sequelizeORM.Post.findByPk(id)   
                return new Post(sequelizePost)
        } catch(e) {
            throw(e)
        }
    }

    async _getPostByIdUpdateViews(id) {
        try {
            const sequelizePost = await sequelizeORM.sequelize.transaction(async(t) => {
                let sequelizePost = await sequelizeORM.Post.findByPk(id)
                if(sequelizePost instanceof sequelizeORM.Post) {
                    sequelizePost = await sequelizePost.update(
                        {views: sequelizePost.views +1},
                        {transaction: t}
                    )
                }
                return sequelizePost
            })
            return new Post(sequelizePost)
        } catch(e) {
            throw(e)
        }
    }

    async _getPostsByUser(id) {
        try{
            let sequelizePosts = await sequelizeORM.Post.findAll({
                where: {'user_id': id}
            })
            let posts = sequelizePosts.map(sequelizePost => {
                return new Post(sequelizePost)
            })
            return posts
        } catch(e) {
            throw(e)
        }
    }

    async getAllPosts() {
        try {
            let sequelizePosts = await sequelizeORM.Post.findAll()
            let posts = sequelizePosts.map(sequelizePost => {
                return new Post(sequelizePost)
            })
            return posts
        } catch(e) {
            throw(e)
        }
    }

    async _getTotalPostLikeById(id) {
        try {
            let totalPostLike = await sequelizeORM.PostLike.count({
                where: {'post_id': id}
            })
            return totalPostLike
        } catch(e) {
            throw(e)
        }
    }


    //==== COMMENTS ====
    async _getCommentById(id) {
        try {
            const comment = await sequelizeORM.Comment.findByPk(id)
            return new Comment(comment)
        } catch(e) {
            throw(e)
        }
    }

    async _getTotalCommentById(id) {
        try {
            let sequelizeComment = await sequelizeORM.Comment.findByPk(id)
            let comment = new Comment(sequelizeComment)
            return comment
        } catch(e) {
            throw(e)
        }
    }
    
    async _getTotalCommentLikeById(id) {
        try {
            let totalCommentLike = await sequelizeORM.CommentLike.count({
                where: {'comment_id': id}
            })
            return totalCommentLike
        } catch(e) {
            throw(e)
        }
    }
}

module.exports = sequelizeDatabase