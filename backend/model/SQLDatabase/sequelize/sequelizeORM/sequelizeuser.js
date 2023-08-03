const bcrypt = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            isEmail:true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                return 'write only property'
            },
            set(value) {
                this.setDataValue('password', this.generatePasswordHasg(value))
            }
        },
        refreshToken: {
            field: 'refresh_token',
            type: DataTypes.STRING,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            type: DataTypes.DATE
        }
    }, {
        tableName:'users'
    })

    User.prototype.generatePasswordHasg = function(password) {
        return bcrypt.hashSync(password, 10)
    }

    User.prototype.checkPassword = function(guess) {
        return bcrypt.compareSync(guess, this.getDataValue('password'))
    }
    
    return User
}