export function AboutPage() {
  return (
    <section className="stack-wide about-page">
      <div className="about-hero card">
        <p className="hero-kicker">Our Juice Promise</p>
        <h1>About Fruzoos</h1>
        <p>
          Fruzoos is a fresh juice storefront focused on natural ingredients, balanced recipes,
          and reliable doorstep delivery.
        </p>
      </div>

      <h2>What We Believe</h2>
      <p>
        Every bottle should taste fresh, feel light, and deliver clean fruit nutrition without
        artificial colors or syrups.
      </p>
      <p>
        Our team curates seasonal produce, presses in small batches, and keeps pricing transparent
        so healthy juice can fit into everyday routines.
      </p>

      <div className="card-grid">
        <article className="card">
          <h3>Fresh Sourcing</h3>
          <p>Partnered fruit vendors and quality checks at every intake.</p>
        </article>
        <article className="card">
          <h3>Daily Production</h3>
          <p>Cold-chain conscious prep and same-day dispatch on core routes.</p>
        </article>
        <article className="card">
          <h3>Customer First</h3>
          <p>Simple ordering, clear inventory visibility, and dependable support.</p>
        </article>
      </div>
    </section>
  )
}
