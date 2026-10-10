 import React, {useState} from 'react'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
 import { useAuth } from '../context/AuthContext'
 function SignUp() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {signup, loading, error} = useAuth();
  const navigate = useNavigate();

  function handleSubmit (e){
      e.preventDefault();

      if(password !== confirmPassword){
        alert("password don't match")
        return 
      }

      const result = signup(email, password, name);

      if(result.success){
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("")
        setShowPassword(false)
        setShowConfirmPassword(false)

        navigate("/");
      }
  }

   return (
     <div className='min-h-screen bg-linear-to-b from-coffee-cream to-white flex items-center justify-center mb-4 px-4'> 
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='font-bold text-coffee-brown text-4xl'>Join Us☕ </h1>
          <p className='text-gray-600 mb-3'>Sign up your account</p>
        </div>
        <div className='bg-white rounded-lg border border-coffee-caramel p-8 shadow-lg'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-sm font-semibold text-coffee-brown mb-2'>
                Full name
              </label>
              <div className='relative '>
                <label>
                  <FiUser className='absolute left-3 top-4.5 text-gray-600'></FiUser>
                  <input type="text"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}                  
                  placeholder='Enter your name'
                  className='border border-coffee-caramel w-full py-3 focus:outline-none focus:ring-2 focus:ring-coffee-caramel rounded pl-8' />

                </label>
              </div>

            </div>
            <div>
              <label className='block text-sm font-semibold text-coffee-brown mb-2'>
                Emai address
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
             <div>
              <label className='block text-sm font-semibold text-coffee-brown mb-2'>
                Confirm Password
              </label>
              <div className='relative '>
                <label>
                  <FiLock className='absolute left-3 top-4.5 text-gray-600'></FiLock>
                  <input type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e)=> setConfirmPassword(e.target.value)}
                  placeholder='••••••••'
                  className='border border-coffee-caramel w-full py-2.5 focus:outline-none focus:ring-2 focus:ring-coffee-caramel rounded pl-8' />

                </label>
                 <button
                type='button'
                onClick={()=> setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-4 text-gray-500'>
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}              
                </button>
              </div>
            </div>
          
          {error && <p className='text-red-500 text-sm'>{error}</p>}
             <button type="submit" 
             disabled={loading}
             className='w-full bg-coffee-orange py-3 text-white font-bold rounded hover:bg-coffee-brown transition'> 
            {loading ? "creating Account..." : "Sign Up"}
             </button>
          </form>
          <div className='mt-3 pt-3 border-b-gray-200 border-t text-center'>
            <p className='text-gray-600'>Already have an account?

              <Link to="/signin" className='text-coffee-orange font-bold mt-2 hover:text-coffee-brown'>
              Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
     </div>
   )
 }
 
 export default SignUp