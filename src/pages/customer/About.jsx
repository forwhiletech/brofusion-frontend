import { heroImages } from '../../data/staticData';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import SmartImage from '../../components/common/SmartImage';

const VALUES = [
  ['Considered design', 'Every piece is edited down to what matters: proportion, fabric and fit.'],
  ['Honest materials', 'Natural fibres and responsibly sourced fabrics, with transparent pricing.'],
  ['Made to last', 'Quality construction so your wardrobe works harder and longer.'],
];

export default function About() {
  return (
    <>
      <section className="about-hero">
        <SmartImage src={heroImages.about} alt="" loading="eager" />
        <div className="hero-shade" />
        <div className="container"><span className="eyebrow">Our story</span><h1>Clothing for the way<br />you actually live</h1></div>
      </section>
      <div className="container page-pad">
        <Breadcrumb items={[{ label: 'About' }]} />
        <div className="row g-5 align-items-center my-2">
          <div className="col-lg-6"><h2 className="display-s">A modern wardrobe of considered essentials</h2></div>
          <div className="col-lg-6"><p className="lead-p">BRO FUSION was founded on a simple idea: great clothes should be easy to wear, easy to love and easy to keep. We design timeless silhouettes in soft, honest fabrics, and we sell them at fair prices.</p><p className="lead-p">From heavyweight tees to tailored coats, each style goes through months of fit testing before it reaches you.</p></div>
        </div>
        <div className="stats-row">
          <div><b>250k+</b><span>Happy customers</span></div><div><b>1,200</b><span>Styles designed</span></div><div><b>4.7★</b><span>Average rating</span></div><div><b>14 days</b><span>Easy returns</span></div>
        </div>
        <div className="row g-4 mt-2">
          {VALUES.map(([t, d]) => <div className="col-md-4" key={t}><div className="panel h-100"><h5>{t}</h5><p className="mb-0 text-muted">{d}</p></div></div>)}
        </div>
        <div className="text-center my-5"><Button to="/shop" size="lg">Explore the collection</Button></div>
      </div>
    </>
  );
}
