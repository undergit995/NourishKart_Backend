
const jwt = require('jsonwebtoken');




function generateAccessToken(user) {


    let token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWTKEY,
        { expiresIn: "1d" }

    )
    return token;


}

function generateRefreshToken(user) {
    let token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWTKEY,
        { expiresIn: "7d" })

    return token
}

function regToken(email){
    let token = jwt.sign(
        {email},
        process.env.JWTKEY,
        {expiresIn:"1h"}
    )
    return token
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    regToken
}
