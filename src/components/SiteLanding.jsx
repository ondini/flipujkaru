import Navbar from './Navbar.jsx';
import Hero from './Hero.jsx';
import TrustBar from './TrustBar.jsx';
import WhyUs from './WhyUs.jsx';
import Marketplace from './Marketplace.jsx';
import Verification from './Verification.jsx';
import HowItWorks from './HowItWorks.jsx';
import StudentReviews from './StudentReviews.jsx';
import ProfitCalculator from './ProfitCalculator.jsx';
import Education from './Education.jsx';
import Mission from './Mission.jsx';
import Pricing from './Pricing.jsx';
import PersonalService from './PersonalService.jsx';
import Faq from './Faq.jsx';
import Footer from './Footer.jsx';

/** Veřejný web (landing). */
export default function SiteLanding() {
  return (
    <>
      {/* Skrytý nadpis pro čtečky obrazovky */}
      <h1 className="sr-only">FlipujKáru — bazar prověřených aut a car-flipping akademie</h1>

      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <WhyUs />
        <Marketplace />
        <Verification />
        <HowItWorks />
        <StudentReviews />
        <ProfitCalculator />
        <Education />
        <Mission />
        <Pricing />
        <PersonalService />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
