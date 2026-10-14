 import React, { useMemo } from 'react'
import { FiSearch } from 'react-icons/fi'
import products from '../Data/products'
import AddToCart from '../componnents/AddToCart' 
import { Link } from 'react-router-dom'
 function Menu() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const filteredProduct = useMemo (()=>{
    return products.filter((product)=>
    product.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()));
  },[searchQuery])
   return (
     <div className='bg-coffee-cream'>
        <div className='max-w-6xl px-4 py-10 '>
            <div className='mb-12'>
              <h1 className='text-4xl font-bold text-coffee-orange'>Our Menu ☕</h1>
              <p className='text-lg text-gray-500'>Discouver our premium selection of coffee</p>
            </div>

            <div className='mb-8 relative'>
              <FiSearch className='absolute left-5 top-4 text-gray-500' size={20} />
              <input type="text"
              placeholder='search for coffee...'
              value={searchQuery}
              onChange={(e)=>setSearchQuery(e.target.value)}
              className='w-full pl-12 pr-4 py-3 border-2 border-coffee-orange' />

            </div>
            <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4'>
              {
                filteredProduct.map((product)=>(
                  <div key={product.id} className='bor border-coffee-orange rounded-2xl bg-white overflow-hidden'>
                    <img src={product.image} alt={product.name} className='w-full object-cover' />
                    <div className='p-4'>
                      <h3 className='font-bold text-coffee-brown'>{product.name}</h3>
                      <p className='text-sm text-gray-500 mt-2'>{product.description}</p>
                      <p className='text-coffee-orange font-bold mt-2'>${product.price}</p>
                      <div className='mt-2'>
                        <AddToCart product={product} />
                         <Link className='mt-3 block text-center bg-coffee-caramel px-3 py-2 rounded-2xl text-coffee-brown text-sm hover:bg-coffee-orange
                        ' to={`/product/${product.id}`}>
                        View details
                        </Link>
                      </div>

                    </div>
                  </div>

                ))
              }

            </div>
            </div>        
     </div> 
   )
 }
 
 export default Menu
 