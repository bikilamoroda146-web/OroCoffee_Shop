 import React from 'react';
 import { useState } from 'react';
 import {useCart} from'../context/CartContext'
 import { FiMapPin, FiMail, FiPhone, FiLoader, FiCheckCircle} from 'react-icons/fi';
 import { Link } from 'react-router-dom';

function Checkout() {
    const {cartCount, cartItems, clearCart}= useCart();
    const [orderPlaced, setOrderPlaced] = useState();

const [formData, setFormData] = useState({
    address: "",
    email: "",
    phone: "",
})
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

if(orderPlaced){
    return(
        <div className='max-w-lg mx-auto px-4 py-20 text-center'>
            <FiCheckCircle size={72} className='mx-auto text-green-500 mb-4'/>
            <h2 className='text-3xl font-bold text-coffee-orange mb-2'>Order placed successfull.</h2>
            <p className='text-gray-800 mb-2'>Thank you for your order. Your order in on the way</p>

            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <Link to="/menu" className='px-6 py-3 bg-coffee-orange text-white font-bold rounded-lg hover:bg-coffee-brown'>Order More</Link>
                <Link to="/" className='px-6 py-3 bg-coffee-orange text-white font-bold rounded-lg hover:bg-coffee-brown' >Back to Home</Link>
            </div>
        </div>
    )
}


const subtotal = cartItems.reduce(
    (sum, item)=> sum + item.price * item.quantity, 0

);
const shipping = subtotal >= 0 ? 8 : 5.00;
const task = subtotal * 0.1;
const total = subtotal + shipping + task;

function handleChange(e){
    const {name, value} = e.target;
    setFormData((prev) => ({
        ...prev,
        [name] : value
    }))
    if (error) setError("");
    }
    function validateForm(){
        if(!formData.address.trim()){
            return "Please enter your shipping address.";
        }
        if(!formData.email.trim()){
            return "please enter your email address.";
        }
        if(!formData.phone.trim()){
            return "please enter your phone number.";
        }
        return "";
    }
    function handlePlaceOrder(){
        const validationError = validateForm();
        if(validationError){
            setError(validationError);
            return;
        }
        setLoading(true);
        setTimeout(()=>{
            setLoading(false);
            clearCart();
            setOrderPlaced(true);
            setFormData({
                address: "",
                email: "",
                phone: "",

            })
        }, 2000);

    }


return (
    <div className='bg-linear-to-b from-coffee-cream to-white'>
        <div className='max-w-6xl mx-auto px-4'>
            <h1 className='text-4xl font-bold text-coffee-orange'>Checkout</h1>
            
            <div className='grid md:grid-cols-[70%_30%] gap-8'>
                <div className='md:grid-cols-2 space-y-6'>
                    <h2 className='text-2xl font-bold mb-2'>Order {cartCount}</h2>
                    <div className='space-y-4'>
                        { 
                            cartItems.map((item)=>(
                               <div key={item.id} className='flex flex-1 justify-between gap-4 border-b pb-3 border-gray-400'>
                                <div className='flex item-center gap-4 flex-1'>
                                      { item.image && (
                                        <img src={item.image} alt={item.name} 
                                        className='w-16 h-16 rounded-lg object-cover'
                                        />
                                      )} 
                                      <div>
                                        <p className='font-bold text-coffee-brown '>{item.name}</p>
                                        <p className='text-sm text-gray-600'>${item.price.toFixed(2)} * {item.quantity}</p>
                                        </div>                            
                                        </div>
                                         <p className='font-bold text-coffee-brown'>${(item.price * item.quantity).toFixed(2)}</p>
                               </div> 
                            ))
                        }
                    </div>
                <div className='bg-white rounded-lg border border-coffee-brown shadow-orange-50 p-4 mb-4'>
                    <h2 className='text-2xl text-coffee-brown flex items-center gap-2 font-bold sem:mb-2'>
                        <FiMapPin /> Shipping Details
                    </h2>
                
                <div className='space-y-2'>
                    <div>
                        <label className='block text-sm font-semibold text-coffee-brown mb-2'>Shipping Address</label>
                        <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleChange} 
                        type="text"
                        placeholder="123 Main Street, city, state 12345"
                        rows={3}
                        className='text-sm border border-coffee-caramel px-4 py-2 rounded-lg width-fullfocus:outline-none w-full'></textarea>
                    </div>

                    <div>
                        <label className='flex text-sm font-semibold text-coffee-brown items-center gap-2 mb-2'>
                            <FiMail />Email
                            </label>
                        <input 
                        name="email"
                        value={formData.email}
                        type="email"
                        onChange={handleChange} 
                        placeholder="you@example.com"
                        className='w-full border border-coffee-caramel px-4 py-2 rounded-lg text-sm focus:outline-none'></input>
                    </div>
                      <div>
                        <label className='flex text-sm font-semib                    </div>
old text-coffee-brown items-center gap-2 mb-2'>
                            <FiPhone />Phone number
                            </label>
                        <input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange} 
                        type="tel"
                        placeholder="(+251) 91234566"
                        className='w-full border border-coffee-caramel px-4 py-2 rounded-lg text-sm focus:outline-none'></input>
                    </div>
                       {
                        error && (
                            <span className='text-red-500'>{error}</span>
                        )
                    }
                </div>


               </div>
                 
                </div>

                <div>
                    <div className='bg-white border border-coffee-orange rounded-lg p-6 sticky top-20'>
                        <h2 className='text-2xl text-coffee-brown font-semibold mb-4'>Order Summary</h2>
                        <div className='flex justify-between'>
                            <span>SubTotal</span>
                            <span>${subtotal}</span>
                        </div>
                        <div className='flex justify-between mb-2'>
                            <span>Shipping</span>
                            <span>${shipping === 0 ? "Free": `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className='flex justify-between mb-2'>
                            <span>Tax</span>
                            <span>${task.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between mb-2 text-lg font-bold border-t border-gray-400'>
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button  onClick={handlePlaceOrder}
                        disabled={loading}
                         className='w-full py-3 bg-green-500 fontbold hover:bg-green-700 rounded-lg'>
                            {
                                loading ? (
                                    <span className='flex items-center justify-center gap-2'>
                                        <FiLoader className='animate-spin'/> place order...
                                    </span>
                                ): (
                                    "place order"
                                )
                            }

                        </button>
                        <Link to="/menu" className='block text-center mt-3 text-coffee-orange border p-3 rounded hover:bg-coffee-orange hover: text-coffee-brown font-bold'
                        >Continue Shopping</Link>
                    </div>
                 
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default Checkout