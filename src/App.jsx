
import './App.css'
import NavBar from './componnents/NavBar'
import Footer from './componnents/Footer'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import  Menu  from './pages/Menu'
import Checkout from './pages/Checkout'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
function App() {

  return (
    <>
      <NavBar />
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/cart" element={<Cart />} />
  <Route path ="/menu" element={<Menu />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path='/signin' element={<SignIn />} />
  <Route path='/signup' element={<SignUp />} />
  <Route path='/profile' element={<Profile />} />
</Routes>
      <Footer />
     
    </>
  )
}

export default App
