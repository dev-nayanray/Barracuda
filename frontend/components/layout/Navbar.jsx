'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Navbar Component
 * Responsive navigation with mobile menu and smooth animations
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Navigation items
  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Advantages', href: '#advantages' },
    { label: 'Partners', href: '#partners' },
    { label: 'Advertisers', href: '#advertisers' },
    { label: 'Contact', href: '#contact' },
  ];

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Update active section
      const sections = navItems.map(item => item.href.slice(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 100) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll handler
  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    const targetId = href.slice(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled 
          ? 'bg-background/90 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
        }
      `}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-background" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl blur opacity-30" />
            </div>
            <span className="text-2xl font-display font-bold gradient-text">
              Barracuda
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className={`
                  relative text-sm font-medium transition-colors duration-200
                  ${activeSection === item.href.slice(1)
                    ? 'text-primary-500'
                    : 'text-text-muted hover:text-text'
                  }
                `}
              >
                {item.label}
                {activeSection === item.href.slice(1) && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Become a Partner
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-text hover:text-primary-500 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className={`
                      block px-4 py-3 rounded-xl text-base font-medium
                      transition-colors duration-200
                      ${activeSection === item.href.slice(1)
                        ? 'bg-primary-500/20 text-primary-500'
                        : 'text-text-muted hover:bg-surface-200 hover:text-text'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Mobile CTA */}
                <div className="pt-4 px-4">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      setIsMobileMenuOpen(false);
                    }}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Become a Partner
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Navbar;

