import {createContext, useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


    const AuthContext = createContext({})


const AuthProvider = ({children}) => {
    const route = useNavigate()

    const [user,setUser] = useState(null)
     const client = axios.create({
            baseURL:`${import.meta.env.VITE_SERVER_URL}/api/users`
         })
         const delay = async ()=>{
          setTimeout(()=>route('/home'),1000)
         }
    const authorize = async (id,password)=>{
      try{
         let response = await client.post('/login',{
          id,password
         })

         localStorage.setItem(import.meta.env.VITE_ACCESS_TOKEN,response.data.token)
          return {message:response.data.message,status:response.status}
        }
        catch(err){
          throw err;
        }
    }
    const register = async (name,username,email,password,confirmPassword)=>{
      try{
        
         let response = await client.post('/register',{
          name,username,password,cp:confirmPassword,email
         })
         
          return {message:response.data.message,status:response.status}
        }
        catch(err){
          
          throw err
        }
    }

    const data = {authorize,register,user,setUser,delay}
  return (
    <AuthContext.Provider  value={data}>
        {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
export {AuthContext}
