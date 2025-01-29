const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next)=> {

    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({error: "Token not found"});
    //extract the jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error: 'Unauthorized'});

    try{
        //verify the jwt token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        //attach the user information in request object
        req.user = decoded;
        next();

    }
    catch(err){
        console.error(err);
        res.status(401).json({error: 'Inavlid Token'});
    }
}

//function to generate jwt token
const generateToken = (userdata)=>{

    //generate a new jwt token using user data
    return jwt.sign(userdata,process.env.JWT_SECRET,{expiresIn:30000});
}

module.exports = {jwtAuthMiddleware,generateToken}