const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const config = require('./config/config')
const db = require('./model/database')

const app = express()

app.use(cors(config.corsOptions()))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())

// app.use(function(req, res, next) {
//     let jwt = req.cookies.jwt
//     console.log('======')
//     console.log(`method: ${req.method} - url: ${req.url}`)
//     console.log(jwt)
//     console.log('======')
//     next()
// })

app.use('/auth', require('./view/auth'))
app.use('/user', require('./view/user'))
app.use('/post', require('./view/post'))
app.use('/comment', require('./view/comment'))

app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'build')))
app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})
app.use(require('./middleware/errorHandler'))

if(require.main === module) {
    db.syncDB({'force':false}).then(() => {
        app.listen(config.PORT, () => {
            console.log(`Server running on port ${config.PORT}`)
        })
    })    
} else {
    app.init = async() => {
        return await db.syncDB({'force':false}).then(() => {
            return app.listen(config.PORT, () => {
                console.log(`Server running on port ${config.PORT}`)
            })
        })
    }
    
    module.exports = {
        app: app,
        db: db
    }
}