import  jwt from "jsonwebtoken";
import { config } from "dotenv";
config()

const verify = (req,res,next)=>{
    try{
   const token = req.headers.authorization.split[' '][1]

   jwt.verify(token,process.env.PRIVATE_KEY,(error,decoded)=>{
    if(error)
        throw error
    req.details = decoded
    next()
   })
}
catch(err){
    return res.status(500).json({message:'Authorize first'})
}
}

export default verify