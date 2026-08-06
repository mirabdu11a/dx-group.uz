import './App.scss'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Portfolio from './pages/Portfolio'
import PortfolioDetail from './pages/PortfolioDetail'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import ContactSection from './components/ContactSection'
import Location from './components/Location'
import { ToastContainer } from 'react-toastify'
import ScrollToTop from './components/ScrollToTop'

function App() {

  return (
    <>
      <Navbar/>
      <ScrollToTop/>
      <ToastContainer/>
      <Routes>
        <Route index element={<Home/>}/>
        <Route path='/about' element={<About />} />
        <Route path='/products' element={<Products />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        <Route path='/portfolio' element={<Portfolio />} />
        <Route path='/portfolio/:id' element={<PortfolioDetail />} />
        <Route path='/contact' element={<Contact />} />
      </Routes>
      <ContactSection/>
      <Location/>
      <Footer/>
    </>
  )
}

export default App
