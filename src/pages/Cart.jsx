import React from 'react'
import { useCart } from '../context/CartContext'
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
function Cart() {
    const {cartItems, cartError, increasingQuantity, decreaseQuantity, removeFromCart, cartCount, cartTotal} = useCart();

    if(cartItems.length ===0){
        return(
            <div className='max-6xl mx-auto px-4 py-14 '>
                <h1 className='text-4xl text-center font-bold text-coffee-orange py-6 px-4'>Your cart is Empty</h1>
                {cartError && <p role="alert" className="mx-auto max-w-xl text-center text-sm text-red-700">{cartError}</p>}
                <Link to="/menu" className='mt-6 block border border-coffee-orange  py-3 px-4 text-coffee-orange text-lg rounded-lg text-center hover:bg-coffee-brown'>
                Continue shopping
                </Link> 
            </div>
        )
    }
  return (
    <div className='max-6xl mx-auto px-4 py-14 '>
        <h1 className='text-4xl text-center font-bold text-coffee-orange py-6 px-4'>Shopping Cart</h1>
           <div className='space-y-4 mb-8'>
            {
                cartItems.map(item =>(
                    <div key={item.id} className='flex flex-wrap items-center gap-4 border border-coffee-orange rounded-2xl bg-white p-4'>
                         <img src={item.image} alt={item.name}
                         className='w-24 h-24 shrink-0 object-cover rounded-lg' />
                         <div className='min-w-0 flex-1'>
                            <h3 className='font-bold text-lg text-coffee-brown'>{item.name}</h3>
                            <p className='text-sm text-gray-500'>{item.description}</p>
                            <p className='text-coffee-orange font-bold mt-2 text-lg'>{item.price.toFixed(2)}</p>
                         </div>
                         <div className='flex w-full items-center justify-end bg-gray-200 gap-2 p-1 rounded-lg sm:w-auto'>
                            
                            <button type='button' aria-label={`Decrease quantity of ${item.name}`} onClick={()=> decreaseQuantity(item.id)}
                            className='flex min-h-11 min-w-11 touch-manipulation items-center justify-center p-2 hover:bg-gray-400 rounded-lg transition'>
                              <FiMinus />
                            </button>
                            <span>{item.quantity}</span>
                            <button type='button' aria-label={`Increase quantity of ${item.name}`} onClick={()=> increasingQuantity(item.id)}
                            className='flex min-h-11 min-w-11 touch-manipulation items-center justify-center p-2 hover:bg-gray-400 rounded-lg transition'>
                              <FiPlus />
                            </button>
                            <button type='button' aria-label={`Remove ${item.name} from cart`} onClick={()=> removeFromCart(item.id)}
                            className='flex min-h-11 min-w-11 touch-manipulation items-center justify-center p-2 text-red-600 hover:bg-red-500 hover:text-white rounded-lg'>
                                <FiTrash2 />
                            </button>
                         </div>
                    </div>
                ))
            }
           </div>

           <div className='bg-coffee-cream border border-coffee-orange rounded-lg p-6 '>
            <div className='space-y-3 mb-4'>
                <div className='flex justify-between'>
                    <span className='text-gray-500'>Subtotal{cartCount} Items</span>
                    <span className='font-bold'>${cartTotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                    <span className='text-gray-500'>Shipping</span>
                    <span className='font-bold'>Free</span>
                </div>
                <div className='flex justify-between border-t border-coffee-orange pt-3'>
                    <span className='text-lg font-bold'>Total</span>
                    <span className='text-2xl font-bold text-coffee-orange'>${cartTotal.toFixed(2)} </span>
                </div>
            </div> 
            <Link to="/checkout" className='w-full block text-center px-6 py-3 bg-coffee-orange text-white rounded-lg font-bold hover:bg-coffee-brown transition'>
            Proceed to checkOut
            </Link>
            <Link to="menu" className='w-full border block border-coffee-orange bg-white px-6 py-3 mt-4 text-coffee-orange rounded-lg text-center font-bold hover:bg-coffee-cream ' >
            Continue to shopping
            </Link>
           </div>
    </div>
  )
}

export default Cart