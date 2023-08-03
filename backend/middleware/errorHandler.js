const errorHandler = (err, req, res, next) => {
    return res.status(500).json({'message':'internal error'})
}

module.exports = errorHandler