import { useState,useContext } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {  ThemeProvider } from '@mui/material/styles';
import { Snackbar,createTheme } from '@mui/material';
import { AuthContext } from '../Context/AuthContext';
import httpStatus from 'http-status'

const defaultTheme = createTheme()


function Authenticaion() {
    const {register,authorize,delay} = useContext(AuthContext)
  const [formState,setFormState] = useState(0)
const [error,setError]  =  useState("")
const [message,setMessage]  =  useState("")
const [open,setOpen]  =  useState(false)
const [name,setName] = useState("")
const [alertColor,setAlertColor] = useState("bg-red-200")
const [username,setUserName] = useState("")
const [email,setMail] = useState("")
const [password,setPassword] = useState("")
const [cp,setCp] = useState("")

const handleAuth = async()=>{
  try{
    let res
     if(formState===0){
        res = await authorize(username,password)

     }
     else if(formState===1){
      res  = await register(name,username,email,password,cp)
  }

  setMessage(res.message)

  if(res.status === 200){
    delay()
    setAlertColor('bg-green-200')
  }

  setOpen(true)
}
  catch(err){
      setError(err.response.data.message)
  }

}
  return (
     <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: `url(https://picsum.photos/1000/800)`,
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height:'100vh',
                        width:'55vw'
                    }}
                />
                <Grid item sx={{width:'45vw',backgroundColor:'rgba(252,205,76,0.1)'}} className='shadow-2xl' xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>


                        <div>
                            <Button variant={formState === 0 ? "contained" : ""} onClick={()=>{setFormState(0)}}>
                                Sign In
                            </Button>
                            <Button variant={formState === 1 ? "contained" : ""} onClick={()=>{setFormState(1)}}>
                                Sign Up
                            </Button>
                        </div>

                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            {formState === 1 ? <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Full Name"
                                name="username"
                                autoFocus
                                defaultValue={name}
                                onChange={(e)=>setName(e.target.value)}
                            /> : <></>}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label={`${!formState?'Username or Email id':'Username'}`}
                                name="username"
                                defaultValue={username}
                                autoFocus
                                onChange={(e)=>setUserName(e.target.value)}

                            />

                            {formState?<TextField
                            margin='normal'
                            required
                            fullWidth
                            id='email'
                            label="Email Id"
                            defaultValue={email}
                            name='email'
                                onChange={(e)=>setMail(e.target.value)}
                            />:<></>}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                defaultValue={password}
                                onChange={(e)=>setPassword(e.target.value)}
                            />

                            {formState?<TextField
                            margin='normal'
                            required
                            fullWidth
                            id='confirm'
                            type='password'
                            label="Type password again"
                            name='cpassword'
                            defaultValue={cp}
                                onChange={(e)=>setCp(e.target.value)}
                            />:<></>}

                            <p style={{ color: "red" }}>{error}</p>

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}

                                onClick={handleAuth}

                            >
                                {formState === 0 ? "Login " : "Register"}
                            </Button>

                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                className={`${alertColor}`}
                open={open}
                autoHideDuration={4000}
                message={message}
            />

        </ThemeProvider>
  );
}

export default Authenticaion