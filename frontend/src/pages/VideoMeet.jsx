import {useEffect, useRef, useState} from 'react'
import {TextField, Button, IconButton,Badge} from '@mui/material'
import {io} from 'socket.io-client'
import {CallEnd, Videocam,VideocamOff,Mic,MicOff,ScreenShare,StopScreenShare,Chat} from '@mui/icons-material'

const wsServer = import.meta.env.VITE_SERVER_URL;

const peerConfigConnections = {
    "iceServers": [
        {urls: ["stun:stun.l.google.com:19302"]}
    ]
}

const VideoMeet = () => {
    const socketRef = useRef()
    const socketIdRef = useRef()
    const localVideoRef = useRef()
    const connections = useRef({}) // Move connections to useRef to maintain consistency

    const [videoAvailable, setVideoAvailable] = useState(true)
    const [audioAvailable, setAudioAvailable] = useState(true)
    const [video, setVideo] = useState()
    const [audio, setAudio] = useState()
    const [screen, setScreen] = useState(false)
    const [screenAvailable, setScreenAvailable] = useState(false)
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const [newMessages, setNewMessages] = useState(0)
    const [askForUsername, setAskForUserName] = useState(true)
    const [username, setUsername] = useState("")
    const [videos, setVideos] = useState([])

    const getPermissions = async () => {
        try {
            let video_available = await navigator.mediaDevices.getUserMedia({video: true})
            setVideoAvailable(!!video_available)

            let audio_available = await navigator.mediaDevices.getUserMedia({audio: true})
            setAudioAvailable(!!audio_available)

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true)
            }

            let userStream = await navigator.mediaDevices.getUserMedia({
                video: videoAvailable,
                audio: audioAvailable
            })

            if (userStream) {
                window.localStream = userStream
            }

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = userStream
            }

        } catch (e) {
            console.error("Error getting permissions:", e)
            setVideoAvailable(false)
            setAudioAvailable(false)
            setScreenAvailable(false)
        }
    }

    const getUserStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: video,
                audio: audio
            })
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
            }
            
            window.localStream = stream
            return stream
        } catch (e) {
            console.error("Error getting user stream:", e)
            localVideoRef.current.srcObject.getTracks().forEach(t=>t.stop())
        window.localStream = null;
        }
    }

    useEffect(() => {
        if (video !== undefined || audio !== undefined) {
            getUserStream()
        }
    }, [video, audio])

    const getMedia = () => {
        setVideo(videoAvailable)
        setAudio(audioAvailable)
        connectToSocket()
    }

    const gotMessageFromServer = async (fromId, message) => {
        try {
          if(fromId===socketIdRef.current)
            return
          
            let data = JSON.parse(message)

            

            

            if (!connections.current[fromId]) {
                
                console.error("No connection found for:", fromId)
                return
            }

            if (data.ice) {
                await connections.current[fromId].addIceCandidate(new RTCIceCandidate(data.ice))
            } else if (data.sdp) {
                await connections.current[fromId].setRemoteDescription(new RTCSessionDescription(data.sdp))
                
                if (data.sdp.type === "offer") {
                    const answer = await connections.current[fromId].createAnswer()
                    await connections.current[fromId].setLocalDescription(answer)
                    socketRef.current.emit("signal", fromId, JSON.stringify({sdp: answer}))
                }
            }
        } catch (error) {
            console.error("Error handling server message:", error)
        }
    }

    const getUserMediaSuccess =async (stream)=>{
        try{
        window.localStream.getTracks().forEach(track=>track.stop())
        }
        catch(e){
            console.log(e);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream

        for(let id in Object.keys(connections.current)){
            connections.current[id].addStream(window.localStream);
            connections.current[id].createOffer().then(offer=>connections.current[id].setLocalDescription(offer)).then(()=>{
                socketRef.current.emit("signal",socketIdRef.current,{sdp:connections.current[id].localDescription})
            }).catch(e=>console.log(e))
        }

        //black silence

        if(!window.blackSilence){
                    window.blackSilence = (...args)=> new MediaStream([black(...args),silence()])
                }

        window.localStream = window.blackSilence();
        localVideoRef.current.srcObject = window.localStream



        stream.getTracks().forEach(track=>track.onEnded=()=>
        {
            setVideo(false)
            setAudio(false)

            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track=>track.stop()) 

            for(let id in Object.keys(connections.current)){
            connections.current[id].addStream(window.localStream);
            connections.current[id].createOffer().then(offer=>connections.current[id].setLocalDescription(offer)).then(()=>{
                socketRef.current.emit("signal",socketIdRef.current,{sdp:connections.current[id].localDescription})
            }).catch(e=>console.log(e))
        }
        })


    }

    let silence = ()=>{
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()

        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()

        return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false})
    }
    let black = ({width=640,height=480}={})=>{
        let canvas = Object.assign(document.createElement("canvas"),{width,height})
        canvas.getContext('2d').fillRect(0,0,width,height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0],{enabled:false})
    }

    const addMessage = (messageObj) => {
        // Implement your message handling logic here
        setMessages(prev => [...prev, messageObj])
    }

    const filterVideos = (fromId, diffTime) => {
        setVideos(videos => videos.filter(video => (video.socketId !== fromId)))
        // Clean up connection
        if (connections.current[fromId]) {
            connections.current[fromId].close()
            delete connections.current[fromId]
        }
    }

    const createPeerConnection = (socketId,joinedName) => {
        try {
            const peerConnection = new RTCPeerConnection(peerConfigConnections)
            
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socketRef.current.emit("signal", socketId, JSON.stringify({"ice": event.candidate}))
                }
            }

            peerConnection.ontrack = (event) => {
                // Use ontrack instead of onaddstream for modern browsers
                const stream = event.streams[0]
                
                setVideos(prevVideos => {
                    const videoExists = prevVideos.find(video => video.socketId === socketId)
                    
                    if (videoExists) {
                        return prevVideos.map(video => 
                            video.socketId === socketId 
                                ? {...video, stream: stream}
                                : video
                        )
                    } else {
                        return [
                            ...prevVideos,
                            {
                                socketId: socketId,
                                stream: stream,
                                autoplay: true,
                                playsinline: true,
                                userName : joinedName
                            }
                        ]
                    }
                })
            }

            // Add local stream to connection
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, window.localStream)
                })
            }
            else{
                if(!window.blackSilence){
                    window.blackSilence = (...args)=> new MediaStream([black(...args),silence()])
                }
                window.localStream = window.blackSilence()
                window.localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, window.localStream)
                })
            }

            connections.current[socketId] = peerConnection
            return peerConnection

        } catch (error) {
            console.error("Error creating peer connection:", error)
            return null
        }
    }

    const connectToSocket = () => {
        if (!username.trim()) {
            alert("Please enter a username")
            return
        }
        
        setAskForUserName(false)
        socketRef.current = io(wsServer)

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id
            socketRef.current.emit("join-call", {
                path: window.location.href,
                username: username
            })
        })

        socketRef.current.on('signal', gotMessageFromServer)
        socketRef.current.on("chat-message", addMessage)
        socketRef.current.on("user-left", filterVideos)

        socketRef.current.on("user-joined", async (socketId, isInitiator,joinedName) => {
            const peerConnection = createPeerConnection(socketId,joinedName)
            
            if (!peerConnection) {
                console.error("Failed to create peer connection for:", socketId)
                return
            }


            

            try {
                if(isInitiator){
                const offer = await peerConnection.createOffer()
                await peerConnection.setLocalDescription(offer)
                socketRef.current.emit("signal", socketId, JSON.stringify({sdp: offer}))
                }
            } catch (error) {
                console.error("Error creating offer:", error)
            }
        })
    }

    useEffect(() => {
        getPermissions()
        
        // Cleanup function
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
            
            // Close all peer connections
            Object.values(connections.current).forEach(connection => {
                connection.close()
            })
            
            // Stop local stream tracks
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    return (
        <main className='h-[100vh] w-[99vw]'>
            {askForUsername ? (
                <div>
                    <h2>Enter into lobby</h2>
                    <TextField 
                        value={username} 
                        variant='outlined' 
                        onChange={(e) => setUsername(e.target.value)} 
                        label='Username'
                    />
                    <Button variant='contained' onClick={getMedia}>Join</Button>
                    <video src="#" ref={localVideoRef} autoPlay muted playsInline></video>
                </div>
            ) : (
                <div className='relative h-full text-white overflow-auto p-4 bg-[rgba(1,4,48)]'> 
                    <div className="button-container flex gap-4 absolute bottom-[3%] left-[40%]">
                        <IconButton onClick={()=>setVideo(!video)}>
                            {video?<Videocam className='text-white bg-gray-800 rounded-full' sx={{fontSize:'3.2rem',padding:'5px'}}/>:<VideocamOff className='text-white bg-gray-800  rounded-full' sx={{fontSize:'3.2rem',padding:'5px'}}/>}
                        </IconButton>
                         <IconButton onClick={()=>setAudio(!audio)}>
                         {audio?<Mic className='text-white bg-gray-800 rounded-full' sx={{fontSize:'3.2rem',padding:'5px'}} />:<MicOff className='text-white bg-gray-800 rounded-full' sx={{fontSize:'3.2rem',padding:'5px'}}/>}
                        </IconButton>
                        <IconButton>
                         <CallEnd className='text-white bg-red-800 rounded-full' sx={{fontSize:'3.2rem',padding:'5px'}}/>
                        </IconButton>
                        <IconButton>
                            {screen ? <ScreenShare className='text-white bg-gray-800 rounded-xl' sx={{fontSize:'3.2rem',padding:'10px'}}/> : <StopScreenShare className='text-white bg-gray-800 rounded-xl' sx={{fontSize:'3.2rem',padding:'10px'}}/>}
                        </IconButton>
                        <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton>
                                <Chat className='text-white bg-gray-800 rounded-full' sx={{fontSize:'3.2rem',padding:'10px'}}/>
                            </IconButton>
                        </Badge>
                    </div>
                    <div className='absolute h-[30%] w-auto bottom-5 right-5'>
                        <h3>{username} (You)</h3>
                        <video className='w-full h-[90%] rounded-xl' ref={localVideoRef} autoPlay muted playsInline></video>

                    </div>
                    <div className='h-[70%] w-auto flex gap-4 overflow-auto'>
                        {videos.map((video) => (
                            <div className='h-full' key={video.socketId}>
                                <h2 id={video.socketId}>{video.userName}</h2>
                            <video 
                                className='rounded-xl h-[90%] mt-2'
                                data-socket={video.socketId}
                                autoPlay 
                                playsInline
                                ref={el => {
                                    if (el && video.stream) {
                                        el.srcObject = video.stream
                                    }
                                }}
                            />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}

export default VideoMeet