import { Link } from 'react-router-dom'
import bottelOrange from '../assets/images/BottelOrange.png'
import bottelMosambi from '../assets/images/BottelMosambi.png'

export function HomePage() {
  return (
    <div className="happyjuice-home">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />

      <div>
        <section className="hero section-wrap">
          <div className="hero-copy reveal">
            <p className="eyebrow">Freshly Pressed Daily</p>
            <h1>
              Fresh Juice.
              <br />
              Real Fruit.
              <br />
              Fuel Your Brain.
            </h1>
            <p className="lead">
              Crafted from hand-picked fruits with no concentrates, no shortcuts, and no artificial
              flavor. Just bold, clean taste delivered fresh.
            </p>
            <div className="hero-cta">
              <Link to="/catalog" className="btn">Explore Flavors</Link>
              <a href="#story" className="link-arrow">How We Make It</a>
            </div>
            <ul className="stats" aria-label="Product highlights">
              <li><strong>100%</strong> fruit juice</li>
              <li><strong>12h</strong> from farm to bottle</li>
              <li><strong>0g</strong> added sugar</li>
            </ul>
          </div>

          <div className="hero-media reveal reveal-delay-1">
            <div className="home-bottle-stack" aria-hidden="true">
              <img src={bottelOrange} alt="" className="home-bottle home-bottle-center" />
              <img src={bottelMosambi} alt="" className="home-bottle home-bottle-left" />
              <img src={bottelOrange} alt="" className="home-bottle home-bottle-right" />
            </div>
            <div className="vitamin-rocket" aria-label="Vitamin level boost animation">
              <div className="vitamin-rocket-icon" aria-hidden="true">
                <span className="vitamin-rocket-body">🚀</span>
                <span className="vitamin-rocket-flame" />
              </div>
              <span className="vitamin-rocket-text">Vitamin Boost</span>
              <div className="vitamin-meter" aria-hidden="true">
                <span className="vitamin-meter-fill" />
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="features section-wrap">
          <article className="feature-card reveal reveal-delay-1">
            <h2>Cold Pressed</h2>
            <p>
              Preserves flavor and nutrients with gentle extraction instead of heat-intensive processing.
            </p>
          </article>
          <article className="feature-card reveal reveal-delay-2">
            <h2>Farm Traceable</h2>
            <p>
              Every bottle can be traced to partner orchards and harvest windows for peak freshness.
            </p>
          </article>
          <article className="feature-card reveal reveal-delay-3">
            <h2>Small Batch</h2>
            <p>
              Mixed and bottled in short runs to keep quality high and delivery consistently fresh.
            </p>
          </article>
        </section>

        <section id="menu" className="menu section-wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Choose Your Zest</p>
            <h2>Flavor Collection</h2>
          </div>
          <div className="menu-grid">
            <article className="menu-item menu-item-orange reveal reveal-delay-1">
              <h3>Classic Orange</h3>
              <p>Clean citrus bite with naturally sweet finish.</p>
              <span>INR 120</span>
            </article>
            <article className="menu-item menu-item-mosambi reveal reveal-delay-2">
              <h3>Mosambi Light</h3>
              <p>Refreshing sweet-lime flavor for daily hydration.</p>
              <span>INR 90</span>
            </article>
            <article className="menu-item menu-item-mixed reveal reveal-delay-3">
              <h3>Mixed Fruit Punch</h3>
              <p>Layered fruit blend with smooth full-bodied taste.</p>
              <span>INR 150</span>
            </article>
          </div>
        </section>

        <section id="story" className="story section-wrap">
          <div className="story-copy reveal">
            <p className="eyebrow">From Grove to Glass</p>
            <h2>We Bottle Mornings.</h2>
            <p>
              Fruits are sourced early and pressed by midday. That rapid cycle captures peak aroma,
              crisp flavor, and natural body in every bottle.
            </p>
          </div>
          <div className="quote-box reveal reveal-delay-1">
            <p>
              "The first sip tastes like peeling fresh fruit in the morning sun."
            </p>
            <span>Customer Review</span>
          </div>
        </section>

        <section id="contact" className="cta section-wrap reveal">
          <h2>Start Your Fresh Routine Today</h2>
          <Link to="/catalog" className="btn">Get Delivery</Link>
        </section>
      </div>
    </div>
  )
}
