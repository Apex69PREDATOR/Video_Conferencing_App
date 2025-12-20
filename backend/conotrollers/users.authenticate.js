import {userModel} from '../schemas/User.model.js'
import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
config()

const login = async (req,res)=>{
    try{
    const {id,password} = req.body
     const existUser = await userModel.findOne({$or:[{username:id},{email:id}]})
    
     if(existUser){
        if(await bcrypt.compare(password,existUser.password)){

            let existUserObj = existUser.toObject()
            delete existUserObj.password
            const token  = jwt.sign(existUserObj,process.env.PRIVATE_KEY,{expiresIn:'2d'})
            return res.status(200).json({message:'authentication successfull',token,existUserObj})
        }

        return res.status(401).json({message:'password is incorrect'})
     }

     return res.status(404).json({message:'account not found'})
    }
    catch(e){
        return res.status(500).json({message:'some error occured'})
    }

}

const register = async (req,res)=>{
    try{
     const {name,username,password,cp,email} = req.body

     if(password!==cp)
        return res.status(400).json({message:"password & confirm passward must be same"})

     const existUser = await userModel.findOne({$or:[{username},{email}]})

     if(existUser){
        
       return res.status(302).json({message:"username or email taken!"})
     }
     const hashedPassword = await bcrypt.hash(password,10)
     const newUser = new userModel({
        username,
        name,
        password:hashedPassword,
        email
     })

     await newUser.save()
     return res.status(200).json({message:'account creation successfull'})
    }
    catch(e){
        return res.status(500).json({message:'some error occured'})
    }
}


export {register,login}

