function verifyToken(req,res,next) {

    //console.log(req.headers)

    next() // Continue to the route

}

module.exports = verifyToken