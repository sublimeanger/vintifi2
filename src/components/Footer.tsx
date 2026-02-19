import React from "react";

const footerLinks = {
  Product: [
    { label: "Photo Studio", href: "#features" },
    { label: "Price Check", href: "#features" },
    { label: "Listing AI", href: "#features" },
    { label: "Trends", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact", href: "mailto:hello@vintifi.com" },
  ],
};

const Footer: React.FC = () => {
  const scrollTo = (href: string) => {
    if (href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }
    if (href.startsWith("#") && href.length > 1) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      className="pt-16 pb-8"
      style={{ background: "hsl(230 20% 6%)" }}
    >
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand + tagline */}
          <div className="col-span-2">
            <span className="font-display font-bold text-2xl text-white mb-3 block tracking-tight">
              Vintifi
            </span>
            <p
              className="text-sm font-body max-w-xs leading-relaxed"
              style={{ color: "hsla(0, 0%, 100%, 0.50)" }}
            >
              AI photo studio for Vinted sellers. Turn phone photos into sales.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([column, links]) => (
            <div key={column}>
              <h4
                className="font-body text-[13px] font-semibold uppercase tracking-[0.06em] mb-4"
                style={{ color: "hsla(0, 0%, 100%, 0.40)" }}
              >
                {column}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-sm font-body transition-colors duration-200"
                      style={{ color: "hsla(0, 0%, 100%, 0.60)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "hsla(0, 0%, 100%, 1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "hsla(0, 0%, 100%, 0.60)")}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider (§7.10) */}
        <div
          className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "hsla(0, 0%, 100%, 0.08)" }}
        >
          <p
            className="text-[13px] font-body"
            style={{ color: "hsla(0, 0%, 100%, 0.35)" }}
          >
            © {new Date().getFullYear()} Vintifi. All rights reserved.
          </p>
          <p
            className="text-[13px] font-mono"
            style={{ color: "hsla(0, 0%, 100%, 0.20)" }}
          >
            Built for Vinted sellers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
