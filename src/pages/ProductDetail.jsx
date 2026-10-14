import React from 'react'
import { useParams, Link } from 'react-router-dom'
import products from '../Data/products'
import AddToCart from '../componnents/AddToCart'
import { FiArrowDownLeft } from 'react-icons/fi'

function ProductDetail() {
    const {id} = useParams();


    const product = products.find((p)=>p.id === Number(id));

if(!product){
    return(
        <div className='max-w-2xl mx-auto py-20 text-center'>
            <h1 className='text-3xl font-bold text-coffee-brown mb-2'>Product not found </h1>
            <p className='text-gray-500 mb-2'>We couldn't find coffee your'e looking for.</p>

            <Link to='/menu' className='inline-block px-6 py-3 bg-coffee-orange text-white font-bold rounded-lg'>Back to menu</Link>
        </div>
    )
}

  return (
    <div className='bg-coffee-cream min-h-screen py-12 px-4'>
<div className='max-w-4xl mx-auto'>
    <Link to="/menu" className='inline-flex items-center text-coffee-brown font-semibold mb-5 hover:text-coffee-orange'>
     <FiArrowDownLeft /> Back to Menu
     </Link>

     <div className='bg-white border border-coffee-orange rounded-lg p-4 overflow-hidden grid md:grid-cols-2'>
        <img src={product.image} alt={product.name} className='w-full h-full object-cover rounded-lg'/>
        <div className='p-8'>
            <h1 className='text-3xl font-extrabold text-coffee-brown mb-2'>{product.name}</h1>
            <p className='text-gray-100 mb-4'>{product.description}</p>
            <p className='text-3xl font-bold text-coffee-orange mb-4'>${product.price.toFixed(2)}</p>
            <AddToCart product={product} />
        </div>
     </div>
</div>
    </div>
  )
}

export default ProductDetail