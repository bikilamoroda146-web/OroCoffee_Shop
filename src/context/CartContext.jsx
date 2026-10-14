import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider ({children}){
const [cartItems, setCartItems] = useState(()=>{
    const savedCart = localStorage.getItem("cart");

    return savedCart ? JSON.parse(savedCart) : [];
});

useEffect(()=>{

    localStorage.setItem("cart", JSON.stringify(cartItems))
}, [cartItems])

function addToCart(product){
setCartItems((privItems)=>{

    const existingItem = privItems.find(
        (item) => item.id === product.id 
    )
    if(existingItem){
       return privItems.map((item)=>
    item.id === product.id
    ? {...item, quantity: item.quantity + 1}: item)
    }else{
 return [...privItems,
    {...product, quantity: 1}
 ]
    }
})

}
function increasingQuantity(productId){
setCartItems((privItems)=>
privItems.map((item)=>
item.id === productId
? {...item, quantity: item.quantity +1}: item
))
}
function decreaseQuantity (productId){
    setCartItems((privItems)=>
    privItems.map((item)=>
    item.id === productId
? {...item, quantity: item.quantity -1} : item)
.filter((item)=> item.quantity > 0)
)
}
function removeFromCart(productId){
    setCartItems((privItems)=>
    privItems.filter((item)=> item.id !== productId))
}

function clearCart(){
    setCartItems([]);
}


const cartTotal = cartItems.reduce(
    (sum, item)=>
        sum + item.price * item.quantity,0
)
const cartCount = cartItems.reduce(
    (sum, item)=>
    sum + item.quantity, 0
);
return(
<CartContext.Provider 
value={{ 
    cartItems,
    addToCart,
    cartCount,
    increasingQuantity,
    decreaseQuantity,
    removeFromCart, 
    clearCart,
    cartTotal
    }}>
  {children}
</CartContext.Provider>
    )
}
export function useCart(){
    return useContext(CartContext)
}