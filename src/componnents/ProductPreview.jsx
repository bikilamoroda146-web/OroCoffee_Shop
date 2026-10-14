import React from 'react'

import { Link } from 'react-router-dom'
import products from '../Data/products'
import AddToCart from '../componnents/AddToCart'
function ProductPreview() {
  return (
    <section className='py-14 md:py-18 bg-white'>
        <div className='max-w-6xl mx-auto px-10'>
            <div>
                <h2 className='mb-6 text-4xl md:text-5xl text-coffee-orange font-extrabold'> Popular picks</h2>
            </div>
            {/* Single card */}

            <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {products.map((product)=>(
            <div  
            key={product.id}
            className='p-4 rounded-2xl border border-coffee-caramel bg-white overflow-hidden shadow-md hover:shadow-xl transition-all'>
                <div className='relative overflow-hidden h-48'>
                    <Link>
                    <img src={product.image} alt="" className='rounded-2xl w-full h-full object-cover hover:scale-110 transition-transform duration-300' />
                    </Link>
                </div>
                <div className='p-4'>
                    <h2 className='font-extrabold  text-xl text-coffee-orange'>{product.name}</h2>
                    <p className='text-sm text-gray-500'>{product.description}</p>
                    <div className='flex justify-between items-center'>
                        <span className='text-coffee-orange font-bold '>{product.price}</span>
                        <AddToCart product={product}/>

                    </div>
                    <div >
                        <Link className='mt-3 block text-center bg-coffee-caramel px-3 py-2 rounded-2xl text-coffee-brown text-sm hover:bg-coffee-orange
                        ' to={`/product/${product.id}`}>
                        View details
                        </Link>
                    </div>
                </div>
            </div>
                ))}
            
        </div>
        </div>
    </section>
  )
}

export default ProductPreview