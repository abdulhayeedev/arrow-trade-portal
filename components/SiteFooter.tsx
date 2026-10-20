const SITE = "https://arrowengineering.com";

const PRODUCTS = [
  { label: "Anti-Vibration Mounts", path: "/products/anti-vibration-mounts/" },
  { label: "Bearings", path: "/products/bearings/" },
  { label: "Flexible Couplings", path: "/products/flexible-couplings/" },
  { label: "Torque Limiters", path: "/products/torque-limiters/" },
  { label: "Engineering Consumables", path: "/products/engineering-consumables/" },
  { label: "Boring and Keying", path: "/products/boring-and-keying/" },
];

const SHOP_INFO = [
  { label: "About Us", path: "/about-us/" },
  { label: "Careers", path: "/jobs/" },
  { label: "Privacy Policy", path: "/privacy-policy/" },
  { label: "Quality Policy", path: "/quality-policy/" },
  { label: "Refunds and Returns Policy", path: "/refunds-and-returns-policy/" },
  { label: "Terms and Conditions", path: "/terms-and-conditions/" },
];

const SERVICES = [
  { label: "Bespoke Engineering", path: "/bespoke-engineering/" },
  { label: "3D Printing", path: "/3d-printing/" },
  { label: "Job Gallery", path: "/job-gallery/" },
];

const MAP_QUERY = "Arrow Engineering Components Limited, 72 Liverpool Street, Manchester M5 4LT";

const linkClass = "text-[13px] text-[#6B7280] transition-colors hover:text-[#FF4438]";
const headingClass = "mb-4 text-[13px] font-bold text-[#14171F]";
const chipClass =
  "inline-flex h-7 items-center justify-center rounded-md border border-[#E5E5E7] bg-white px-2 text-[10.5px] font-bold leading-none";

function LinkList({ items }: { items: { label: string; path: string }[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.path}>
          <a href={`${SITE}${item.path}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

const socialClass =
  "flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E5E7] text-[#6B7280] transition-colors hover:border-[#FF4438] hover:text-[#FF4438]";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#E5E5E7] bg-white">
      <div className="mx-auto max-w-[1180px] px-14 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[280px_1.3fr_1fr_1fr_0.8fr] lg:gap-8">
          {/* Logo + map */}
          <div>
            <img
              src={`${SITE}/wp-content/uploads/2026/06/ISO-logo-1-1.png`}
              alt="ISO 9001:2015 Registered Company"
              width={200}
              loading="lazy"
              className="h-auto w-[200px]"
            />
            <p className="mb-4 mt-2 text-[13px] leading-relaxed text-[#6B7280]">
              Arrow Engineering Components Ltd is an <strong className="text-[#374151]">ISO 9001:2015</strong>{" "}
              certified company, committed to quality management and customer satisfaction.
            </p>
            <iframe
              title="Arrow Engineering Components Location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`}
              width={300}
              height={200}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-[200px] w-full max-w-[300px] rounded-lg border border-[#E5E5E7]"
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-[12.5px] font-semibold text-[#FF4438] hover:underline"
            >
              Open in Google Maps &rarr;
            </a>
          </div>

          {/* Contact */}
          <div>
            <h3 className={headingClass}>Contact</h3>
            <ul className="flex flex-col gap-2.5 text-[13px] leading-relaxed text-[#6B7280]">
              <li>
                <strong className="text-[#374151]">Call us:</strong>{" "}
                <a href="tel:01617376969" className="transition-colors hover:text-[#FF4438]">
                  0161 737 6969
                </a>
              </li>
              <li>
                <strong className="text-[#374151]">Email:</strong>{" "}
                <a href="mailto:sales@arrowengineering.com" className="break-words transition-colors hover:text-[#FF4438]">
                  sales@arrowengineering.com
                </a>
              </li>
              <li>
                <strong className="text-[#374151]">Address:</strong> Arrow Engineering Components Limited, 72
                Liverpool Street, Manchester, M5 4LT
              </li>
              <li>
                <strong className="text-[#374151]">Company Number:</strong> 02235902
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className={headingClass}>Products</h3>
            <LinkList items={PRODUCTS} />
          </div>

          {/* Shop information */}
          <div>
            <h3 className={headingClass}>Shop Information</h3>
            <LinkList items={SHOP_INFO} />
          </div>

          {/* Services */}
          <div>
            <h3 className={headingClass}>Services</h3>
            <LinkList items={SERVICES} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-[#E5E5E7] pt-6">
          <div className="flex flex-wrap items-center gap-5">
            <p className="text-[12.5px] text-[#6B7280]">
              &copy; {new Date().getFullYear()}{" "}
              <strong className="text-[#374151]">Arrow Engineering Components</strong>. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <a href="https://x.com/arrowengineering" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X" className={socialClass}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2H21.5l-7.5 8.57L22 22h-6.828l-5.356-7.03L3.5 22H.244l8.02-9.163L2 2h6.828l4.86 6.41L18.244 2zm-2.394 18h1.89L8.15 4h-2.03l9.73 16z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/arrowengineeringcomponents" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className={socialClass}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.5 9.95v-7.05H8v-2.9h2.5V9.5c0-2.47 1.47-3.83 3.72-3.83 1.08 0 2.2.2 2.2.2v2.4h-1.24c-1.23 0-1.62.77-1.62 1.55v1.88H17l-.4 2.9h-2.02v7.05A10 10 0 0 0 22 12" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/arrow-engineering-components-ltd" target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn" className={socialClass}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8h5v14H0V8zm7.5 0h4.78v1.92h.07c.67-1.27 2.3-2.6 4.73-2.6 5.06 0 6 3.33 6 7.66V22h-5v-6.88c0-1.64-.03-3.75-2.28-3.75-2.29 0-2.64 1.78-2.64 3.63V22h-5V8z" />
                </svg>
              </a>
              <a href="mailto:sales@arrowengineering.com" aria-label="Email us" className={socialClass}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2 4h20v16H2V4zm10 7L2 6v2l10 5 10-5V6l-10 5z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-semibold text-[#9AA2B1]">Secure payments</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={chipClass} title="Mastercard">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24" width="28" height="18" aria-hidden="true">
                  <circle cx="14" cy="12" r="7" fill="#EB001B" />
                  <circle cx="24" cy="12" r="7" fill="#F79E1B" />
                  <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00" />
                </svg>
              </span>
              <span className={`${chipClass} italic text-[#1A1F71]`} title="Visa">VISA</span>
              <span className={`${chipClass} text-[#006FCF]`} title="American Express">AMEX</span>
              <span className={`${chipClass} text-[#635BFF]`} title="Stripe">stripe</span>
              <span className={`${chipClass} text-[#14171F]`} title="Apple Pay">Apple Pay</span>
              <span className={`${chipClass} text-[#5F6368]`} title="Google Pay">Google Pay</span>
              <span className={`${chipClass} text-[#0079BE]`} title="Diners Club">DINERS</span>
              <span className={chipClass} title="JCB">
                <svg viewBox="0 0 38 24" width="28" height="18" aria-hidden="true">
                  <rect x="2" y="3" width="9" height="18" rx="2" fill="#003087" />
                  <rect x="14" y="3" width="9" height="18" rx="2" fill="#CC0000" />
                  <rect x="26" y="3" width="9" height="18" rx="2" fill="#009A44" />
                </svg>
              </span>
              <span className={`${chipClass} text-[#14171F]`} title="Discover">
                DISCOVER
                <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" className="ml-1">
                  <circle cx="8" cy="8" r="8" fill="#FF6600" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}