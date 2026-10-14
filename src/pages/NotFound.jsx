import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiCoffee,} from 'react-icons/fi'

function NotFound() {
  return (
    <div className='min-h-[70vh] flex items-center justify-center px-5'>
      <div className='text-center'> 
      <FiCoffee size={64} className='mx-auto block text-coffee-orange mb-4'/>
      <h1 className='text-6xl font-extrabold text-coffee-orange mb-4'>404</h1>
      <h2 className='text-2xl text-coffee-brown font-bold mb-3'>Page Not Found</h2>
      <div className='flex flex-col sm:flex-row mb-4  gap-3 justify-center'>
        <Link to="/menu" className='px-6 py-3 bg-coffee-orange text-white font-bold rounded-lg hover:bg-coffee-brown'>Order More</Link>
        
        <Link className='px-6 py-3 bg-coffee-orange text-white font-bold rounded-lg hover:bg-coffee-brown'>Back to Home</Link>
        
      </div>
    </div>  
    
    </div>
  )
}

export default NotFound