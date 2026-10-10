import React, {useState} from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiMenu, FiX, FiUser } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
function NavBar() {
    const [open, setOpen] = useState(false);
    const {cartCount} = useCart();
    const {user, signOut} = useAuth();
    const navigate = useNavigate();
    const linkClass = ({ isActive }) =>
        isActive ? "text-orange-500 font-semibold border-b-2" : "text-gray-700 hover:text-orange-500"

function handleSignOut() {
    signOut();
    setOpen(false); // Close the menu if it's open
    navigate("/");
}

    return (
        <header className="bg-coffee-cream border-b border-coffee-orange">
            <div className="max-w-6xl mx-auto p-4">
                <div className="flex items-center justify-between">

                    <Link className="flex items-center gap-2" to="/">
                        <span className="text-2xl">☕</span>
                        <span className="font-bold text-lg text-coffee-brown tracking-tight">Oro</span>
                        <span className="text-coffee-orange font-bold">Coffee Shop</span>
                    </Link>
                    <nav className="md:flex hidden gap-2">
                        <NavLink to="/" className={linkClass}>
                            Home
                        </NavLink>
                        <NavLink to="menu" className={linkClass}>
                            Menu
                        </NavLink>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/cart" className="text-coffee-brown relative hover:text-coffee-orange">
                            <FiShoppingCart size={24} />
                            {
                                cartCount > 0 && <span className="absolute -top-2 right-2h-5 px-1 rounded-full bg-red-600 text-white font-bold  flex items-center justify-center text-sm"
                                >{cartCount}</span>
                            }
                        
</Link>
                        
                        <div className="md:flex hidden gap-3 items-center">
                            {
                                user ? (
                                    <div>
                                    <Link to="/profile" title={user.name}
                                    className="w-9 h-9 rounded-full bg-coffee-orange text-white flex items-center justify-items-center font-bold overflow-hidden hover:bg-coffee-brown" >
                                        {
                                            user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover"/> 
                                            :(user.name?.[0].toUpperCase() || <FiUser />)
                                        }
                                    </Link>
                                    <button onClick={handleSignOut} className="border-red-500 border-2 px-4 py-1 rounded-xl text-red-500 hover:bg-red-200">
                                Sign Out
                            </button>
                                    </div>
                                ): (
                                    <div>
                                        <Link to="/signin">
                                        <button className="bg-coffee-orange px-4 py-1 rounded-xl hover:bg-coffee-brown text-white">
                                Sign in
                            </button>
                                        </Link>
                                        <Link to="/signup">
                                        <button className="px-4 py-1 rounded-xl border-2 border-coffee-orange text-coffee-orange hover:bg-coffee-orange hover:text-white">
                                Sign Up
                                        </button>
                                        </Link>
                                    </div>
                                )
                            }
                        
                        </div>
                        <button className="md:hidden flex justify-center text-coffee-brown"
                         onClick={() => setOpen(!open)}>
                            {
                                open ? <FiX size={24} /> : <FiMenu size={24} />
                            }


                        </button>
                    </div>
                </div>
            </div>
<div>
    {
        open && (
            <div className="md:hidden">
               <nav className="flex flex-col p-4 gap-4">
                        <NavLink to="/" className={linkClass} onClick={()=>setOpen(false)}>
                            Home
                        </NavLink>
                        <NavLink to="menu" className={linkClass} onClick={()=>setOpen(false)}>
                            Menu
                        </NavLink>
                         {
                            user ? (
                                <div>
                                    <Link to="/profile" onClick={()=>setOpen(false)} className="flex items-center text-coffee-brown font-semibold" >
                                    <span className="w-8 h-8 rounded-full bg-coffee-orange text-white flex items-center justify-center font-bold overflow-hidden">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} className="w-full h-full object-cover"/>
                                        ) : (
                                            user.name?.[0].toUpperCase() || <FiUser />
                                        )}
                                    </span>
                                    My profile
                                    </Link>
                                </div>
                            ): (
                                <div>
                                        <Link to="/signin" onClick={()=>setOpen(false)}>
                                        <button className="bg-coffee-orange px-4 py-1 rounded-xl hover:bg-coffee-brown text-white">
                                Sign in
                            </button>
                                        </Link>
                                        <Link to="/signup" onClick={()=>setOpen(false)}>
                                        <button className="px-4 py-1 rounded-xl border-2 border-coffee-orange text-coffee-orange hover:bg-coffee-orange hover:text-white">
                                Sign Up
                                        </button>
                                        </Link>
                                </div>
                            )
                         }
                    </nav>
                     
                           
                        
            </div>
        )
    }
</div>
        </header >
    );
}
export default NavBar;