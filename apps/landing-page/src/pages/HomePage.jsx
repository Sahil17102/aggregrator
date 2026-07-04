import {
  ArrowForwardRounded,
  AutorenewRounded,
  BarChartRounded,
  BusinessRounded,
  CheckCircleRounded,
  DescriptionRounded,
  FormatQuoteRounded,
  Inventory2Rounded,
  KeyboardArrowDownRounded,
  LocalShippingRounded,
  LocationOnRounded,
  PaidRounded,
  SearchRounded,
  SecurityRounded,
  ShieldRounded,
  ShoppingBagRounded,
  StorefrontRounded,
  SyncRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

const logoItems = [
  { name: "DTDC", src: "/partner-logos/dtdc.avif" },
  { name: "XpressBees", src: "/partner-logos/xpressbees.png" },
  { name: "Ekart", src: "/partner-logos/ekart.webp" },
  { name: "Shadowfax", src: "/partner-logos/shadowfax.png" },
  { name: "Amazon", src: "/partner-logos/amazon.png" },
  { name: "Flipkart" },
  { name: "Shopify", src: "/partner-logos/shopify.webp" },
  { name: "WooCommerce", src: "/partner-logos/woocommerce.webp" },
  { name: "OpenCart" },
  { name: "Meesho" },
  { name: "BlueDart", src: "/partner-logos/blue-dart.png" },
  { name: "Delhivery", src: "/partner-logos/delhivery.png" },
];

const fallbackLogos = {
  Amazon: "A",
  Flipkart: "F",
  Shopify: "S",
  WooCommerce: "woo",
  OpenCart: "OC",
  Meesho: "m",
};

const proofStats = [
  ["25+", "Courier Partners"],
  ["29,000+", "Pincodes Nationwide"],
  ["1.5L+", "Businesses Annually"],
  ["220+", "Countries Globally"],
];

const heroEvents = [
  {
    icon: <CheckCircleRounded />,
    title: "Order #8472 delivered",
    text: "BlueDart - Mumbai",
    className: "ship-home__event--one",
  },
  {
    icon: <Inventory2Rounded />,
    title: "Shipment picked up",
    text: "Delhivery - Delhi NCR",
    className: "ship-home__event--two",
  },
  {
    icon: <AutorenewRounded />,
    title: "In transit to Bangalore",
    text: "DTDC - Express",
    className: "ship-home__event--three",
  },
  {
    icon: <LocationOnRounded />,
    title: "Out for delivery",
    text: "XpressBees - Pune",
    className: "ship-home__event--four",
  },
];

const whyCards = [
  {
    icon: <TrendingUpRounded />,
    title: "Lightning-Fast Setup",
    text: "Connect your store and start shipping in minutes - no technical setup needed.",
  },
  {
    icon: <BarChartRounded />,
    title: "Cheapest Shipping Rates",
    text: "Access discounted courier rates across India with zero hidden fees.",
  },
  {
    icon: <ShieldRounded />,
    title: "Multi-Courier Network",
    text: "Seamlessly choose from 25+ courier partners and ship to every pincode.",
  },
];

const processSteps = [
  {
    icon: <StorefrontRounded />,
    title: "Connect Your Store",
    text: "Link your Shopify, Amazon, or WooCommerce store in one click.",
  },
  {
    icon: <LocalShippingRounded />,
    title: "Add Couriers",
    text: "Choose from 25+ courier partners or use our negotiated rates.",
  },
  {
    icon: <SyncRounded />,
    title: "Sync Orders",
    text: "Orders sync automatically from all your sales channels.",
  },
  {
    icon: <DescriptionRounded />,
    title: "Generate Labels",
    text: "Create shipping labels in bulk with one click, ready to go.",
  },
  {
    icon: <BarChartRounded />,
    title: "Ship & Track",
    text: "Ship out orders and track every package in real-time.",
  },
];

const platformTools = [
  {
    icon: <SyncRounded />,
    title: "Smart Order Routing",
    text: "Automatically assign the best courier based on speed, cost, and serviceability.",
  },
  {
    icon: <PaidRounded />,
    title: "COD Management",
    text: "Track cash-on-delivery remittances and reconcile payments effortlessly.",
  },
  {
    icon: <BarChartRounded />,
    title: "Real-Time Analytics",
    text: "Monitor delivery performance, shipping costs, and RTO rates on a live dashboard.",
  },
  {
    icon: <SecurityRounded />,
    title: "NDR Management",
    text: "Reduce returns with automated non-delivery report handling and buyer confirmation.",
  },
  {
    icon: <DescriptionRounded />,
    title: "Automated Labels",
    text: "Generate compliant shipping labels in bulk - no manual entry required.",
  },
  {
    icon: <BusinessRounded />,
    title: "Multi-Warehouse",
    text: "Manage inventory across multiple warehouse locations from one place.",
  },
];

const testimonials = [
  {
    quote:
      "Ship Aggregator cut our shipping costs by 30% and brought all our courier partners under one roof. The dashboard is a game changer.",
    name: "Priya Sharma",
    role: "Founder, LoomCraft",
    initial: "P",
  },
  {
    quote:
      "We went from manually managing 5 courier accounts to one dashboard. Order processing time dropped from hours to minutes.",
    name: "Rahul Mehra",
    role: "Operations Lead, UrbanBite",
    initial: "R",
  },
  {
    quote:
      "The smart routing feature alone saved us lakhs. Ship Aggregator picks the fastest, cheapest courier for every order automatically.",
    name: "Ananya Desai",
    role: "E-commerce Manager, StyleNest",
    initial: "A",
  },
];

const faqs = [
  "What services does Ship Aggregator provide?",
  "How can I track my shipment?",
  "What areas do you cover for delivery?",
  "What are your delivery timelines?",
  "Do you provide COD shipping?",
  "Is my shipment insured?",
  "How can I contact customer support?",
  "What are the packaging guidelines?",
];

function SectionIntro({ eyebrow, title, accent, text, dark = false }) {
  return (
    <div className={`ship-home__intro ${dark ? "ship-home__intro--dark" : ""}`}>
      <span className="ship-home__eyebrow">{eyebrow}</span>
      <h2>
        {title} <span>{accent}</span>
      </h2>
      <p>{text}</p>
    </div>
  );
}

function LogoCard({ item }) {
  return (
    <div className="ship-home__logo-card">
      <span className="ship-home__logo-fallback">{fallbackLogos[item.name] || item.name.slice(0, 2)}</span>
      {item.src ? (
        <img
          alt={`${item.name} logo`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          src={item.src}
        />
      ) : null}
      <strong>{item.name}</strong>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="ship-home">
      <section className="ship-home__hero ship-home__dark-grid">
        <div className="ship-home__container ship-home__hero-grid">
          <div className="ship-home__hero-copy">
            <div className="ship-home__status-pill">
              <span />
              Customized Supply Chain Solutions
            </div>
            <h1>
              Ship Smarter.
              <br />
              Ship Faster.
              <br />
              Ship <span>Safer.</span>
            </h1>
            <p>
              Connect multiple couriers, track orders in real-time, and cut shipping costs - all
              from one powerful dashboard.
            </p>
            <div className="ship-home__actions">
              <RouterLink className="ship-home__button ship-home__button--primary" to="/signup">
                Get Started Free <ArrowForwardRounded />
              </RouterLink>
              <RouterLink className="ship-home__button ship-home__button--ghost" to="/tracking">
                <SearchRounded /> Track Shipment
              </RouterLink>
            </div>
            <div className="ship-home__stats">
              {proofStats.map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ship-home__hero-visual" aria-hidden="true">
            <div className="ship-home__route-panel">
              {heroEvents.map((event) => (
                <div className={`ship-home__event ${event.className}`} key={event.title}>
                  <span>{event.icon}</span>
                  <div>
                    <strong>{event.title}</strong>
                    <small>{event.text}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ship-home__marquee-section">
        <p>POWERING 25+ INTEGRATIONS</p>
        <div className="ship-home__marquee">
          <div className="ship-home__marquee-track">
            {[...logoItems, ...logoItems].map((item, index) => (
              <LogoCard item={item} key={`${item.name}-${index}`} />
            ))}
          </div>
        </div>
        <div className="ship-home__marquee ship-home__marquee--reverse">
          <div className="ship-home__marquee-track">
            {[...logoItems.slice().reverse(), ...logoItems.slice().reverse()].map((item, index) => (
              <LogoCard item={item} key={`${item.name}-reverse-${index}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="ship-home__section">
        <div className="ship-home__container">
          <SectionIntro
            accent="ship with confidence"
            eyebrow="WHY SHIP AGGREGATOR"
            text="We built this to make shipping simpler, cheaper, and smarter for every seller across India."
            title="Everything you need to"
          />
          <div className="ship-home__card-grid ship-home__card-grid--three">
            {whyCards.map((card) => (
              <article className="ship-home__feature-card" key={card.title}>
                <span>{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ship-home__process ship-home__dark-grid">
        <div className="ship-home__container">
          <SectionIntro
            accent="5 simple steps"
            dark
            eyebrow="HOW IT WORKS"
            text="One smooth path from connecting your store to delivering every order on time."
            title="From store to doorstep in"
          />
          <div className="ship-home__timeline">
            {processSteps.map((step, index) => (
              <span key={step.title}>{index + 1}</span>
            ))}
          </div>
          <div className="ship-home__process-grid">
            {processSteps.map((step) => (
              <article className="ship-home__process-card" key={step.title}>
                <span>{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ship-home__section ship-home__section--compact">
        <div className="ship-home__container">
          <SectionIntro
            accent="entire ecosystem"
            eyebrow="INTEGRATIONS"
            text="Plug into your favourite sales channels and courier partners with one-click integrations."
            title="Connect with your"
          />
          <div className="ship-home__integration-layout">
            <div>
              <div className="ship-home__integration-heading">
                <ShoppingBagRounded />
                <div>
                  <h3>Sales Channels</h3>
                  <p>Sell everywhere, manage here</p>
                </div>
              </div>
              <div className="ship-home__logo-grid">
                {logoItems.slice(4, 10).map((item) => (
                  <LogoCard item={item} key={item.name} />
                ))}
              </div>
            </div>
            <div>
              <div className="ship-home__integration-heading ship-home__integration-heading--orange">
                <LocalShippingRounded />
                <div>
                  <h3>Courier Partners</h3>
                  <p>Ship with the best, automatically</p>
                </div>
              </div>
              <div className="ship-home__logo-grid">
                {logoItems.slice(10).concat(logoItems.slice(0, 4)).map((item) => (
                  <LogoCard item={item} key={item.name} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ship-home__section ship-home__section--light">
        <div className="ship-home__container">
          <SectionIntro
            accent="every shipping need"
            eyebrow="PLATFORM"
            text="From smart routing to NDR management - everything a modern D2C brand needs under one roof."
            title="Powerful tools for"
          />
          <div className="ship-home__card-grid">
            {platformTools.map((tool) => (
              <article className="ship-home__tool-card" key={tool.title}>
                <span>{tool.icon}</span>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ship-home__section ship-home__section--light">
        <div className="ship-home__container">
          <SectionIntro
            accent="1.5 Lakh+ businesses"
            eyebrow="TESTIMONIALS"
            text="Don't just take our word for it - hear from sellers who transformed their shipping."
            title="Loved by"
          />
          <div className="ship-home__testimonial-grid">
            {testimonials.map((item) => (
              <article className="ship-home__testimonial-card" key={item.name}>
                <FormatQuoteRounded />
                <p>"{item.quote}"</p>
                <div>
                  <span>{item.initial}</span>
                  <strong>{item.name}</strong>
                  <small>{item.role}</small>
                  <b>★★★★★</b>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ship-home__section">
        <div className="ship-home__container ship-home__faq-container">
          <SectionIntro
            accent="Questions"
            eyebrow="FAQS"
            text="Everything you need to know about our shipping and logistics services."
            title="Frequently Asked"
          />
          <div className="ship-home__faq-list">
            {faqs.map((question, index) => (
              <button className="ship-home__faq-item" key={question} type="button">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{question}</strong>
                <KeyboardArrowDownRounded />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="ship-home__cta ship-home__dark-grid">
        <div className="ship-home__container">
          <h2>Ready to transform your shipping?</h2>
          <p>
            Join 1.5 Lakh+ businesses already shipping smarter with Ship Aggregator. Set up your
            account in under 5 minutes.
          </p>
          <div className="ship-home__actions ship-home__actions--center">
            <RouterLink className="ship-home__button ship-home__button--primary" to="/signup">
              Start Shipping Free <ArrowForwardRounded />
            </RouterLink>
            <RouterLink className="ship-home__button ship-home__button--ghost" to="/">
              Explore Platform
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  );
}
