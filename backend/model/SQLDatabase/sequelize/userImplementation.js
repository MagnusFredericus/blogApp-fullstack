const db = require('../../database')
const orm = require('./sequelizeORM/sequelizeorm')
const userInterface = require('../../userInterface')
const Post = require('./postImplementation')
const Comment = require('./commentImplementation')

class User extends userInterface {
    #user = {}
    #hasModel = false

    get id() { return this.#user.id }
    get hasModel() { return this.#hasModel }
    get name() { return this.#user.name }
    get lastName() { return this.#user.last_name }
    get bio() { return this.#user.bio }
    get email() { return this.#user.email }
    get refreshToken() { return this.#user.refreshToken }
    get createdAt() { return this.#user.created_at }
    get updatedAt() { return this.#user.updated_at }

    constructor(sequelizeUser) {
        super()
        if(sequelizeUser instanceof orm.User) {
            this.#user = sequelizeUser
            this.#hasModel = true
        } else {
            this.#user = {}
            this.#hasModel = false
        }
    }

    //should be 1 call to db
    get friends() {
        return (async() => {
            try{
                let friendships = await orm.Friendship.findAll({
                    where: {
                        [orm.Sequelize.Op.or]: [
                            {'user_id': this.id},
                            {'friend_id': this.id}
                        ]
                    }
                })

                let idsSet = new Set()
                friendships.map(friendship => {
                    idsSet.add(friendship.user_id)
                    idsSet.add(friendship.friend_id)
                })
                idsSet.delete(this.id)

                let ids = [...idsSet]
                let sequelizeUsers = await orm.User.findAll({
                    where: {'id': ids}
                })
                
                let users = sequelizeUsers.map(
                    sequelizeUser => {return new User(sequelizeUser)}
                )
                return users
            } catch(e) {
                throw(e)
            }
        })()
    }

    get posts() {
        return (async() => {
            try {
                let sequelizePosts = await orm.Post.findAll({
                    where: {user_id: this.id}
                })
                let posts = sequelizePosts.map(sequelizePost => {
                    return new Post(sequelizePost)
                })
                return posts
            } catch(e) {

            }
        })()
    }

    async _update(data) {
        data['last_name'] = data['lastName']
        delete data['lastName']

        try {
            this.#user = await this.#user.update(data)
            return this
        } catch(e) {
            throw(e)
        }
    }

    async _delete() {
        try {
            await this.#user.destroy()
            this.#user = {}
            this.#hasModel = false
            return {}
        } catch(e) {
            throw(e)
        }
    }

    async _addFriend(id) {
        try {
            let friendshipInvitation = await orm.FriendshipInvitation.create({
                'user_id': this.id,
                'invited_id': id
            })
            if(friendshipInvitation instanceof orm.FriendshipInvitation) {
                return true
            }
            return false
        } catch(e) {
            throw(e)
        }
    }

    //should make just 1 call to db
    async friendshipInvitations() {
        try {
            let invitations = await orm.FriendshipInvitation.findAll({
                where: {'invited_id': this.id},
            })
            let ids = await invitations.map(
                invitation => {return invitation.user_id
            })
            let sequelizeUsers = await orm.User.findAll({
                where: {'id': ids}
            })
            let users = sequelizeUsers.map(
                sequelizeUser => {return new User(sequelizeUser)
            })
            return users
        } catch(e) {
            throw(e)
        }
    }

    async _acceptFriend(id) {
        try {
            let invitation = await orm.FriendshipInvitation.findOne({
                where: {'user_id': id}
            })
            if(invitation instanceof orm.FriendshipInvitation) {
                let friendship = await orm.Friendship.create({
                    'user_id': this.id,
                    'friend_id': id
                })
                if(friendship instanceof orm.Friendship) {
                    await invitation.destroy()
                    return true
                }
                return false
            }
        } catch(e) {
            throw(e)
        }
    }

    async _rejectFriend(id) {
        try {
            let invitation = await orm.FriendshipInvitation.findOne({
                where: {'user_id': id}
            })
            if(invitation instanceof orm.FriendshipInvitation) {
                await invitation.destroy()
                return true
            }
            return false
        } catch(e) {
            throw(e)
        }
    }

    async _removeFriend(id) {
        try {
	    let friendship = await orm.Friendship.findOne({
                where: {
                    [orm.Sequelize.Op.or]: [
                        {[orm.Sequelize.Op.and]: [
                            {'user_id': this.id},
                            {'friend_id': id}
                        ]},
                        {[orm.Sequelize.Op.and]: [
                            {'user_id': id},
                            {'friend_id': this.id}
                        ]}
                    ]
            }})

            if(friendship instanceof orm.Friendship) {
                await friendship.destroy()
                return true
            }
            return false
        } catch(e) {
            throw(e)
        }
    }

    async _createPost(data) {
        data['user_id'] = data['userId']
        delete data['userId']

        try {
            let sequelizePost = await this.#user.createPost(data)
            return new Post(sequelizePost)
        } catch(e) {
            throw(e)
        }
    }

    async _createComment(data) {
        data['user_id'] = data['userId']
        data['post_id'] = data['postId']
        delete data['userId']
        delete data['postId']

        try {
            let sequelizeComment = await this.#user.createComment(data)
            return new Comment(sequelizeComment)
        } catch(e) {
            throw(e)
        }
    }

    //could make 1 call to db
    async _likePost(id) {
        try {
            const result = await orm.sequelize.transaction(async(t) => {
                let sequelizePost = await orm.Post.findByPk(id)
                if(sequelizePost instanceof orm.Post) {
                    await orm.PostLike.create(
                        {'user_id': this.id, 'post_id': id},
                        {transaction: t}
                    )
                    sequelizePost = await sequelizePost.update(
                        {likes: sequelizePost.likes +1},
                        {transaction: t}
                    )
                    return sequelizePost.likes
                }
                return NaN
            })
            return result
        } catch(e) {
            throw(e)
        }
    }

    async _likeComment(id) {
        try {
            const bool = await orm.sequelize.transaction(async(t) => {
                let comment = await orm.Comment.findByPk(id)
                if(comment instanceof orm.Comment) {
                    await orm.CommentLike.create(
                        {'user_id': this.id, 'comment_id': id},
                        {transaction: t}
                    )
                    comment = await comment.update(
                        {likes: comment.likes +1},
                        {transaction: t}
                    )
                    return true
                }
                return false
            })
            return bool
        } catch(e) {
            throw(e)
        }
    }

    async _checkPassword(password) {
        return this.#user.checkPassword(password)
    }
}

module.exports = User
