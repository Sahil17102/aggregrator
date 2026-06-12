INSERT INTO static_pages (slug, title, content, created_at, updated_at)
VALUES (
  'about_us',
  'About Us - ChoiceMee Logistics',
  $$<h2>About ChoiceMee Logistics</h2>
<p><strong>ChoiceMee Logistics</strong> is a modern shipping operations platform built for ecommerce sellers who want faster dispatch, lower courier costs, and a smoother post-purchase experience.</p>

<h3>What We Do</h3>
<ul>
  <li>Compare courier partners from one clean operations workspace</li>
  <li>Automate shipping, billing, reconciliation, and support flows</li>
  <li>Track every shipment across B2C and B2B order journeys</li>
</ul>

<h3>Why Brands Choose Us</h3>
<ul>
  <li>One platform for shipping, finance visibility, and delivery follow-up</li>
  <li>Built for growing ecommerce teams that need better operational clarity</li>
  <li>Delightful branding and simple workflows that reduce panel fatigue</li>
</ul>

<h3>Contact</h3>
<p><strong>Email:</strong> ops@choicemee.com</p>
<p><strong>Website:</strong> www.choicemee.com</p>
<p><strong>Message:</strong> Ship smarter. Save more on every order.</p>$$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = NOW();
