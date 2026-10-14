
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
import ProtectedRouter from './componnents/ProtectedRouter'
import ProductDetail from './pages/ProductDetail'
import NotFound from './pages/NotFound'
function App() {

  return (
    <>
      <NavBar />
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/cart" element={<Cart />} />
  <Route path ="/menu" element={<Menu />} />
  <Route path="/checkout" element={
    <ProtectedRouter>
      <Checkout />
    </ProtectedRouter>
  } />
  <Route path='/signin' element={<SignIn />} />
  <Route path='/signup' element={<SignUp />} />
  <Route path='/profile' element={
    <ProtectedRouter>
      <Profile />
    </ProtectedRouter>
  } />
   <Route path='*' element={<NotFound />} />
  <Route path='product/:id' element={<ProductDetail />} />
</Routes>
      <Footer />
     
    </>
  )
}

export default App
