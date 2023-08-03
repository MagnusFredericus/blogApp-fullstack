const config = require('../../../../config/config')
const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize(
    config.sqlConfig.DB,
    config.sqlConfig.USER,
    config.sqlConfig.PASSWORD, {
        host: config.sqlConfig.HOST,
        dialect: config.sqlConfig.dialect,
        // port: config.sqlConfig.PORT,
        define: {
            timestamps: false
        },
        pool: {
            max: config.sqlConfig.pool.max,
            min: config.sqlConfig.pool.min,
            acquire: config.sqlConfig.pool.acquire,
            idle: config.sqlConfig.pool.idle
        }
    }
)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

//Models
db.User = require('./sequelizeuser')(sequelize, DataTypes)
db.Friendship = require('./friendship')(sequelize, DataTypes)
db.FriendshipInvitation = require('./friendshipinvitation')(sequelize, DataTypes)
db.Post = require('./sequelizepost')(sequelize, DataTypes)
db.PostLike = require('./postlike')(sequelize, DataTypes)
db.Comment= require('./sequelizecomment')(sequelize, DataTypes)
db.CommentLike = require('./commentlike')(sequelize, DataTypes)

//Relationships
db.User.hasMany(db.Post, {foreignKey: 'user_id'})
db.User.hasMany(db.PostLike, {foreignKey: 'user_id'})
db.User.hasMany(db.Comment, {foreignKey: 'user_id'})
db.User.hasMany(db.CommentLike, {foreignKey: 'user_id'})
db.User.belongsToMany(db.User, {
    as: 'invitation',
    through: db.FriendshipInvitation,
    foreignKey: 'invited_id',
    otherKey: 'user_id'
})
db.User.belongsToMany(db.User, {
    as: 'friend',
    through: db.Friendship,
    foreignKey: 'friend_id',
    otherKey: 'user_id'
})

db.Post.hasMany(db.Comment, {foreignKey: 'post_id'})
db.Post.belongsTo(db.User, {foreignKey: 'user_id'})
db.Comment.belongsTo(db.User, {foreignKey: 'user_id'})
db.Comment.belongsTo(db.Post, {foreignKey: 'post_id'})
db.PostLike.belongsTo(db.User, {foreignKey: 'user_id'})
db.CommentLike.belongsTo(db.User, {foreignKey: 'user_id'})

//Export
module.exports = db