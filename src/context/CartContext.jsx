import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

function loadCart() {
    try {
        const savedCart = localStorage.getItem("cart");
        if (!savedCart) return { cartItems: [], cartError: "" };

        const parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) {
            return { cartItems: [], cartError: "Saved cart data is invalid and could not be loaded." };
        }

        const hasInvalidItem = parsedCart.some((item) => (
            !item
            || (typeof item.id !== "string" && typeof item.id !== "number")
            || typeof item.name !== "string"
            || !Number.isFinite(Number(item.price))
            || Number(item.price) < 0
            || !Number.isInteger(Number(item.quantity))
            || Number(item.quantity) <= 0
        ));
        if (hasInvalidItem) {
            return { cartItems: [], cartError: "One or more saved cart items are invalid. Please add your items again." };
        }

        return { cartItems: parsedCart, cartError: "" };
    } catch (error) {
        console.error("Error loading saved cart", error);
        return { cartItems: [], cartError: "Saved cart data could not be read. Please add your items again." };
    }
}

export function CartProvider ({children}){
const [cartState, setCartState] = useState(loadCart);
const { cartItems, cartError } = cartState;

useEffect(()=>{
    localStorage.setItem("cart", JSON.stringify(cartItems))
}, [cartItems])

function addToCart(product){
setCartState((state)=>{
    const privItems = state.cartItems;

    const existingItem = privItems.find(
        (item) => item.id === product.id 
    )
    if(existingItem){
       return { cartItems: privItems.map((item)=>
    item.id === product.id
    ? {...item, quantity: item.quantity + 1}: item), cartError: "" }
    }else{
 return { cartItems: [...privItems,
    {...product, quantity: 1}
 ], cartError: "" }
    }
})

}
function increasingQuantity(productId){
setCartState((state)=>({
    ...state,
    cartError: "",
    cartItems: state.cartItems.map((item)=>
item.id === productId
? {...item, quantity: item.quantity +1}: item
)}))
}
function decreaseQuantity (productId){
    setCartState((state)=>({
    ...state,
    cartError: "",
    cartItems: state.cartItems.map((item)=>
    item.id === productId
? {...item, quantity: item.quantity -1} : item)
.filter((item)=> item.quantity > 0)
}))
}
function removeFromCart(productId){
    setCartState((state)=>({
        ...state,
        cartError: "",
        cartItems: state.cartItems.filter((item)=> item.id !== productId),
    }))
}

function clearCart(){
    setCartState({ cartItems: [], cartError: "" });
}


const cartTotal = cartItems.reduce(
    (sum, item)=> sum + Number(item.price) * Number(item.quantity),0
)
const cartCount = cartItems.reduce(
    (sum, item)=> sum + Number(item.quantity), 0
);
return(
<CartContext.Provider 
value={{ 
    cartItems,
    cartError,
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