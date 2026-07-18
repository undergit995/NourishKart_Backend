  
  let jwt = require("jsonwebtoken");
  
  
  function decoded(token, res){
    try{
        let decodedToken = jwt.verify(token, process.env.JWTKEY);
        if(!decodedToken){
            return res.status(400).json({
                message:"Invalid token"
            })
        }
        return decodedToken;
    }
    catch(err){
        return res.status(500).json({
            message: err.message
        })
    
    }
  }
  module.exports = decoded;