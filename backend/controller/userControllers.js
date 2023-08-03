const db = require('../model/database')

const hadleGetAllUsers = async(req, res) => {
    try {
        let users = await db.getAllUsers()
        if(users.length > 0) {
            let usersJSON = await Promise.all(
                users.map(user => user.toJSON())
            )
            return res.status(200).json(usersJSON)
        } else {
            return res.sendStatus(204)
        }
    } catch(e) {
        return res.sendStatus(500)
    }
}

const handleGetFriends = async(req, res) => {
    let user = req.user
    try {
        let friends = await user.friends
        if(friends.length > 0) {
            let friendsJSON = await Promise.all(
                friends.map(friend => {return friend.toJSON()}
            ))
            return res.status(200).json(friendsJSON)
        }
        return res.sendStatus(204)
    } catch(e) {
        return res.sendStatus(500)
    }
}

const handleGetUserById = async(req, res) => {
    const id = req.params.id

    try {
        let user = await db.getUserById(id)
        if(user.hasModel) {
            return res.status(200).json(await user.toJSON())
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

const handleUpdateUser = async(req, res) => {
    const { name, lastName, bio } = req.body
    if(!(name || lastName || bio)) {
        return res.status(400).json({
            'message':'name and/or lastName required in request body'
        })
    }

    let data = {}
    if(name) data.name = name
    if(lastName) data.lastName = lastName
    if(bio) data.bio = bio

    let user = req.user
    try {
        user = await user.update(data)
        return res.status(200).json(await user.toJSON())
    } catch(e) {
        if(e.cause === 'name') {
            return res.status(422).json({'message':'valid name required'})
        }
        if(e.cause === 'lastName') {
            return res.status(422).json({'message':'valid lastName required'})
        }
        if(e.cause === 'bio') {
            return res.status(422).json({'message':'valid biography required'})
        }
        return res.sendStatus(500)
    }
}

const handleAddFriend = async(req, res) => {
    const id = req.params.id

    let user = req.user
    try {
        let bool = await user.addFriend(id)
        if(bool) {
            return res.sendStatus(201)
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({'message':'id must be an integer'})
        }
        if(e.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                'message':'invited user id not found'
            })
        }
        return res.sendStatus(500)
    }
}

const handleGetFriendshipInvitations = async(req, res) => {
    let user = req.user
    try {
        let users = await user.friendshipInvitations()
        if(users.length > 0) {
            let userJSON = await Promise.all(
                users.map(user => {return user.toJSON()})
            )
            return res.status(200).json(userJSON)
        }
        return res.sendStatus(204)
    } catch(e) {
        return res.sendStatus(500)
    }
}

const handleAcceptFriend = async(req, res) => {
    const id = req.params.id

    let user = req.user
    try {
        let bool = await user.acceptFriend(id)
        if(bool) {
            return res.sendStatus(201)
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({'message':'id must be an integer'})
        }
        return res.sendStatus(500)
    }
}

const handleRejectFriend = async(req, res) => {
    const id = req.params.id

    let user = req.user
    try {
        let bool = await user.rejectFriend(id)
        if(bool) {
            return res.sendStatus(200)
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({'message':'id must be an integer'})
        }
        return res.sendStatus(500)
    }
}

const handleRemoveFriend = async(req, res) => {
    const id = req.params.id

    let user = req.user
    try {
        let bool = await user.removeFriend(id)
        if(bool) {
            return res.sendStatus(200)
        }
        return res.sendStatus(304)
    } catch(e) {
        if(e.cause === 'id') {
            return res.status(422).json({'message':'id must be an integer'})
        }
        return res.sendStatus(500)
    }    
}

module.exports = {
    hadleGetAllUsers,
    handleGetFriends,
    handleGetUserById,
    handleUpdateUser,
    handleAddFriend,
    handleGetFriendshipInvitations,
    handleAcceptFriend,
    handleRejectFriend,
    handleRemoveFriend
}