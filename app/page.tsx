import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedReview from './components/FeaturedReview'
import LatestReviews from './components/LatestReviews'
import FeaturedEssay from './components/FeaturedEssay'
import LatestEssays from './components/LatestEssays'
import Genres from './components/Genres'
import FilmStrip from './components/FilmStrip'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedReview />
        <LatestReviews />
        <FeaturedEssay />
        <FilmStrip />
        <Genres />
        <LatestEssays />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
