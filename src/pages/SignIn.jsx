import React, {useState} from 'react'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { Link, useNavigate, useLocation} from 'react-router-dom'
import { useAuth } from '../context/AuthContext' 

 function SignIn() {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
 
const {signIn,error, loading} = useAuth();
const navigate = useNavigate();
const location = useLocation();
function handleSubmit(e){
  e.preventDefault();

  const success = signIn(email, password);

  if(success){
    setEmail("");
    setPassword("");
    setShowPassword(false)
 
  const redirectTo = location.state?.pathname || "/";
  navigate(redirectTo, {replace: true})
  }
}

   return (
     <div className='min-h-screen bg-linear-to-b from-coffee-cream to-white flex items-center justify-center mb-4 px-4'> 
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='font-bold text-coffee-brown text-4xl'>WelCome Back☕</h1>
          <p className='text-gray-600 mb-3'>Sign in to your account</p>
        </div>
        <div className='bg-white rounded-lg border border-coffee-caramel p-8 shadow-lg'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-sm font-semibold text-coffee-brown mb-2'>
                Emai address:
              </label>
              <div className='relative '>
                <label>
                  <FiMail className='absolute left-3 top-4.5 text-gray-600'></FiMail>
                  <input type="email"
                  value={email}
                  onChange={(e)=> setEmail(e.target.value)}
                  placeholder='you@example.com'
                  className='border border-coffee-caramel w-full py-2.5 focus:outline-none focus:ring-2 focus:ring-coffee-caramel rounded pl-8' />

                </label>
              </div>

            </div>
 
            <div>
              <label className='block text-sm font-semibold text-coffee-brown mb-2'>
                Password:
              </label>
              <div className='relative '>
                <label>
                  <FiLock className='absolute left-3 top-4.5 text-gray-600'></FiLock>
              
                  <input type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e)=> setPassword(e.target.value)}
                  placeholder='••••••••'
                  className='border border-coffee-caramel w-full py-2.5 focus:outline-none focus:ring-2 focus:ring-coffee-caramel rounded pl-8' />

                </label>

                <button
                  type='button'
                  onClick={()=> setShowPassword(!showPassword)}
                  className='absolute right-3 top-4 text-gray-500'>
                  {showPassword ? <FiEyeOff /> : <FiEye />}              
              </button>
              </div>
            </div>

            <div className='flex items-center justify-between text-sm'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input type="checkbox" className='accent-coffee-caramel'/> Remember me 
              </label>
              <Link className="text-coffee-orange hover:text-coffee-brown font-medium">Forgot Password</Link>
            </div>
             {error && <p className='text-red-500 text-sm'>{error}</p>}
             <button type="submit" 
             disabled={loading}
             className='w-full bg-coffee-orange py-3 text-white font-bold rounded hover:bg-coffee-brown transition'> 
            {loading ? "Signing in..." : "Sign In"}
             </button>
          </form>
          <div className='mt-3 pt-3 border-b-gray-200 border-t text-center'>
            <p className='text-gray-600'>Don't have an account?

              <Link to="/signup" className='text-coffee-orange font-bold mt-2 hover:text-coffee-brown'>
              Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
     </div>
   )
 }
 
 export default SignIn