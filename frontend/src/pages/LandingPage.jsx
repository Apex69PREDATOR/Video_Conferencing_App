import LandingPageMain from "../Components/LandingPageMain"

const LandingPage = () => {
  return (
    <div className='landingpageContainer h-[100vh] w-[100vw]'>
      <nav className='flex justify-between text-white'>
        <div className='navHeader text-[1.8rem] font-medium'>Apna Video Call</div>
        <div className='flex items-center text-[1.2rem] gap-[1.6rem] [&>*]:cursor-pointer [&>*]:font-medium' style={{marginRight:'1rem'}}>
            <p>Join as guest</p>
            <p>Register</p>
            <div className='bg-orange-600 p-2 px-6 rounded-md' role='button'>Login</div>
        </div>
      </nav>
      <LandingPageMain/>
    </div>
  )
}

export default LandingPage
