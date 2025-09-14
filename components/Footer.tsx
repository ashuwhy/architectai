import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span>
              © {currentYear}{' '}
              <a 
                href="https://ashuwhy.com" 
                target="_blank" 
                rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 relative group transition-colors duration-200 no-underline"
              >
                Ashutosh Sharma
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </a>
              {' '}| This is an assignment by I am beside you all
            </span>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
