export function AboutPage() {
  return (
    <section className="stack-wide about-page">
      <article className="about-hero card stack-wide">
        <p className="about-kicker">About Var Vadhu Khoj</p>
        <h1>Finding the right life partner, with trust and clarity.</h1>
        <p className="about-lead">
          Var Vadhu Khoj is built to make matchmaking more meaningful. We focus on authentic profiles,
          transparent preferences, and respectful communication so families and individuals can make confident
          decisions.
        </p>
      </article>

      <div className="card-grid about-value-grid">
        <article className="card about-value-card">
          <h3>Verified Quality</h3>
          <p>Clear profile details, richer biodata, and improved visibility for complete and genuine profiles.</p>
        </article>
        <article className="card about-value-card">
          <h3>Smart Discovery</h3>
          <p>Discover compatible matches faster with focused preferences, filters, and shortlist tools.</p>
        </article>
        <article className="card about-value-card">
          <h3>Respectful Connections</h3>
          <p>Send and manage interests with a simple flow designed for clarity, comfort, and privacy.</p>
        </article>
      </div>

      <article className="card stack-wide">
        <h2>How Var Vadhu Khoj works</h2>
        <div className="toolbar-grid about-steps">
          <div className="about-step">
            <strong>Create a complete profile</strong>
            <p>Add your details, preferences, photos, and biodata to improve match quality.</p>
          </div>
          <div className="about-step">
            <strong>Discover relevant matches</strong>
            <p>Browse profiles using clear information and shortlisting to stay organized.</p>
          </div>
          <div className="about-step">
            <strong>Express interest confidently</strong>
            <p>Connect through structured interest actions and track responses easily.</p>
          </div>
        </div>
      </article>

      <article className="card stack-wide">
        <h2>Our promise</h2>
        <p>
          We aim to keep the experience straightforward, safe, and culturally relevant—so every step from
          discovery to connection feels simple and dependable.
        </p>
      </article>
    </section>
  )
}
