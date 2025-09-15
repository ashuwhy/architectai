import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border/30 bg-background/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-center text-xs text-muted-foreground/60">
            <span>
              © {currentYear}{' '}
              <a 
                href="https://ashuwhy.com" 
                target="_blank" 
                rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 relative group transition-colors duration-200 no-underline"
              >
                Ashutosh Sharma
                <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </a>
              {' '}| This is an assignment by{' '}
              <a 
                href="https://www.imbesideyou.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 relative group transition-colors duration-200 no-underline"
              >
                I'm beside you
                <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </a>
            </span>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
