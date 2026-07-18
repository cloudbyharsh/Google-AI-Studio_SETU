import React, { useState } from "react";
import { Menu, X, ShieldCheck, HelpCircle, Sparkles, UserCheck, Home, MessageSquare } from "lucide-react";
import RotatingMandala from "./RotatingMandala";

interface HeaderProps {
  onHomeClick: () => void;
  onFindPractitionerClick: () => void;
  onOpenKundli: () => void;
  onOpenVerification: () => void;
  onOpenHelp: () => void;
  onContactClick: () => void;
}

export default function Header({
  onHomeClick,
  onFindPractitionerClick,
  onOpenKundli,
  onOpenVerification,
  onOpenHelp,
  onContactClick,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (callback: () => void) => {
    callback();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-sandalwood/10 px-4 sm:px-6 py-4 transition-all duration-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Triggering Home */}
        <button
          onClick={onHomeClick}
          className="flex items-center gap-3 sm:gap-4 group text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-maroon rounded-lg p-1"
          aria-label="SETU Home"
        >
          <div className="w-10 h-10 overflow-hidden border border-gold/20 flex items-center justify-center bg-warm-ivory rounded-full shrink-0">
            <RotatingMandala
              size={36}
              color="#C4922A" /* Gold */
              secondaryColor="#610000" /* Kumkum Maroon */
              speed="slow"
            />
          </div>
          <div>
            <span className="font-brand text-xl sm:text-2xl font-semibold text-maroon tracking-widest block leading-none italic uppercase">
              SETU
            </span>
            <span className="text-[9px] font-sans font-bold tracking-[0.25em] text-gold uppercase block mt-1">
              TRADITION & TRUST
            </span>
          </div>
        </button>

        {/* Desktop Simple Web Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-sans font-bold uppercase tracking-wider text-sandalwood/80">
          <button
            onClick={onHomeClick}
            className="hover:text-maroon transition-colors cursor-pointer p-2 focus:outline-none focus:ring-1 focus:ring-maroon rounded"
          >
            Home
          </button>
          <button
            onClick={onFindPractitionerClick}
            className="hover:text-maroon transition-colors cursor-pointer p-2 focus:outline-none focus:ring-1 focus:ring-maroon rounded"
          >
            Find a Practitioner
          </button>
          <button
            onClick={onOpenKundli}
            className="hover:text-maroon transition-colors cursor-pointer flex items-center gap-1.5 p-2 focus:outline-none focus:ring-1 focus:ring-maroon rounded"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            Free Kundli
          </button>
          <button
            onClick={onOpenVerification}
            className="hover:text-maroon transition-colors cursor-pointer flex items-center gap-1 p-2 focus:outline-none focus:ring-1 focus:ring-maroon rounded"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal" />
            Verification
          </button>
          <button
            onClick={onOpenHelp}
            className="hover:text-maroon transition-colors cursor-pointer flex items-center gap-1 p-2 focus:outline-none focus:ring-1 focus:ring-maroon rounded"
          >
            <HelpCircle className="w-3.5 h-3.5 text-gold" />
            Help
          </button>
          <button
            onClick={onContactClick}
            className="hover:text-maroon transition-colors cursor-pointer p-2 focus:outline-none focus:ring-1 focus:ring-maroon rounded"
          >
            Contact Us
          </button>
        </nav>

        {/* Traditional reassurance label (desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-sandalwood/10 rounded-full text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-sandalwood/80 bg-warm-ivory">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
          <span>Founder Verified</span>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-sandalwood hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-sandalwood/10 bg-warm-ivory rounded-xl p-4 shadow-card-default space-y-2 animate-fadeIn">
          <button
            onClick={() => handleNavClick(onHomeClick)}
            className="w-full text-left py-3 px-4 text-xs font-sans font-bold uppercase tracking-wider text-sandalwood hover:text-maroon hover:bg-ivory rounded-lg transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4 text-maroon" />
            Home
          </button>
          <button
            onClick={() => handleNavClick(onFindPractitionerClick)}
            className="w-full text-left py-3 px-4 text-xs font-sans font-bold uppercase tracking-wider text-sandalwood hover:text-maroon hover:bg-ivory rounded-lg transition-all flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-teal" />
            Find a Practitioner
          </button>
          <button
            onClick={() => handleNavClick(onOpenKundli)}
            className="w-full text-left py-3 px-4 text-xs font-sans font-bold uppercase tracking-wider text-sandalwood hover:text-maroon hover:bg-ivory rounded-lg transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            Free Kundli Report
          </button>
          <button
            onClick={() => handleNavClick(onOpenVerification)}
            className="w-full text-left py-3 px-4 text-xs font-sans font-bold uppercase tracking-wider text-sandalwood hover:text-maroon hover:bg-ivory rounded-lg transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-teal" />
            How Verification Works
          </button>
          <button
            onClick={() => handleNavClick(onOpenHelp)}
            className="w-full text-left py-3 px-4 text-xs font-sans font-bold uppercase tracking-wider text-sandalwood hover:text-maroon hover:bg-ivory rounded-lg transition-all flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-gold" />
            Help & Trust Policies
          </button>
          <button
            onClick={() => handleNavClick(onContactClick)}
            className="w-full text-left py-3 px-4 text-xs font-sans font-bold uppercase tracking-wider text-sandalwood hover:text-maroon hover:bg-ivory rounded-lg transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-maroon" />
            Contact Us
          </button>
        </div>
      )}
    </header>
  );
}
