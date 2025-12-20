import { useState,useEffect,useRef } from "react"
import mobile from "/mobile.png"
import {Link} from "react-router-dom"
const LandingPageMain = () => {
  const [dist,Cdist] = useState("")
  const animate1 = useRef(false)
  useEffect(()=>{
    let interval
    if(!animate1.current){
      let m = "Cover a distance by Apna Video call"
      let i=0
      interval = setInterval(async ()=>{
          if(i>=m.length){
            clearInterval(interval)
            return
          }
         else{
          Cdist(prev=>(prev + m[i]))
          await new Promise(resolve=>setTimeout(resolve,30))
          i++
         }
      },50)
      animate1.current=true
    }

    // return () => clearInterval(interval);

  },[])
  return (
    <div className='w-full h-[90vh] p-4 text-white'>
       
       <div className="images w-full h-[88%] flex md:flex-row flex-col items-center px-[1.2rem] gap-[10rem]">
            <div><h1 className="font-semibold text-[3rem]"><span className="text-orange-400">Connect</span> with your loved Ones</h1>
     <p className="py-2 font-medium text-[1.2rem]">{dist}</p>
     <Link className="block p-2 px-4 bg-orange-600 rounded-2xl font-semibold w-fit text-[1.2rem] mt-[0.5rem]" to={'/auth'}>Get Started</Link>
     </div>
     <img src={mobile}  className="h-[80%] w-auto" alt="" />
       </div>
      
    </div>
  )
}

export default LandingPageMain
