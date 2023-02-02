const auth = (req, res, next) => {
    if (req.session.userId) {
        console.log(req.session.userId)
        console.log('middleware meddling...')
        next()
    } else {
        res.status(200).json({"msg": "user not authenticated"})
    }
}

module.exports = auth; 
