import React from "react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Changelog", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const Footer: React.FC = () => {
  const scrollTo = (href: string) => {
    if (href.startsWith("#") && href.length > 1) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      className="py-16 border-t border-white/8"
      style={{ background: "hsl(220 25% 7%)" }}
    >
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <span className="font-display font-bold text-2xl text-white mb-3 block">
              Vintifi
            </span>
            <p className="text-sm font-body text-white/40 max-w-xs leading-relaxed">
              AI-powered photos and smart listings for Vinted sellers. Turn phone photos into sales.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([column, links]) => (
            <div key={column}>
              <h4 className="font-body font-semibold text-white/70 text-sm mb-4 uppercase tracking-wider">
                {column}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-sm font-body text-white/35 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-white/25">
            © {new Date().getFullYear()} Vintifi. All rights reserved.
          </p>
          <p className="text-xs font-mono text-white/20">
            Built for Vinted sellers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
