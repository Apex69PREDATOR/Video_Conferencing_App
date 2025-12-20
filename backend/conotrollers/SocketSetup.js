import { Server } from "socket.io";


const connections = {}
const messages = {}
const timeOnline = {}
const userNames = {}

const createWSserver = (server)=>{
    const io = new Server(server,{cors:{
        origin:"*",
        methods:["GET","POST"],
        allowedHeaders:"*",
        credentials:true
    }})
    
    console.log('ws server',`ws://localhost:5000${io.path()}`);
    
    io.on("connection",(socket)=>{
        console.log('new connection estabilished',socket.id);
        
        socket.on('join-call',({path,username})=>{
            console.log("new joiner",username);
                if(!connections[path])
                    connections[path] = []
                connections[path].push(socket.id)
                userNames[socket.id] = username

            timeOnline[socket.id] = new Date()
           
            //notify that a new user joined
            for(let i=0;i<connections[path].length;i++){

                let existingUser = connections[path][i];
                
                io.to(existingUser).emit("user-joined",socket.id,false,userNames[socket.id])
                if(existingUser!==socket.id) 
                io.to(socket.id).emit("user-joined",existingUser,true,userNames[existingUser])

            }

            //forward all previous messages
            if(messages[path])
                io.to(socket.id).emit("chat-message",{messagesAll:messages[path]})
        })

        socket.on('signal',(toId,message)=>{

            console.log(toId);
            
            
            io.to(toId).emit("signal",socket.id,message)
        })

        socket.on("chat-message",({data})=>{
             const [matchingRoom,found]=Object.entries(connections).reduce(([room,isFound],[roomKey,roomValue])=>{
                if(!isFound && roomValue.includes(socket.id)){
                      return [ roomKey,true]
                }
                return [room,isFound]
             },['',false])

        if(found){
            if(!messages[matchingRoom])
                messages[matchingRoom]=[]
            messages[matchingRoom].push({data,"socket-id-sender":socket.id})

            connections[matchingRoom].forEach(id=>{
                io.to(id).emit("chat-message",{message:{data,"socket-id-sender":socket.id}})
            })
            console.log('message',messages);
            
        }
        })

        socket.on("disconnect",()=>{
            var diffTime = Math.abs(timeOnline[socket.id]- Date.now())
             console.log("user left",diffTime);
             
            //find the room
            
            for (const [key,val] of Object.entries(connections)) {
                
                if(val.includes(socket.id)){
                    
                    for(let a=0;a<connections[key].length;a++){
                        io.to(connections[key][a]).emit("user-left",socket.id,diffTime)
                    }

                    const index=  connections[key].indexOf(socket.id)

                    connections[key].splice(index,1)

                    if(connections[key].length===0){
                        delete connections[key]
                        delete messages[key]
                    }

                    break
                }
            }
        })
    })

}

export default createWSserver