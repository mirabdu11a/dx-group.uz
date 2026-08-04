import HeaderCarousel from '../components/Header'
import SectionAbout from '../components/SectionAbout'
import ProductsSection from '../components/ProductsSection'
import Premushestva from '../components/Premushestva'
import CallSection from '../components/CallSection'
import Partners from '../components/Partners'
import Feadbacks from '../components/Feadbacks'


export default function Home() {
  return (
    <>
      <HeaderCarousel/>
      <ProductsSection/>
      <SectionAbout/>
      <Premushestva/>
      <CallSection/>
      <Partners/>
      <Feadbacks/>
    </>
  )
}
