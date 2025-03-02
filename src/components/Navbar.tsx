import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Radio, Video, FileText, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
      isActive 
        ? 'bg-indigo-700/50 text-white' 
        : 'text-white/80 hover:bg-indigo-800/30 hover:text-white'
    }`;

  return (
    <nav className="bg-indigo-950/50 backdrop-blur-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Radio className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-xl font-bold text-white">WebRTC Connect</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/video-chat" className={navLinkClass}>
                <Video className="mr-2 h-4 w-4" />
                Video Chat
              </NavLink>
              <NavLink to="/text-chat" className={navLinkClass}>
                <Radio className="mr-2 h-4 w-4" />
                Text Chat
              </NavLink>
              <NavLink to="/file-transfer" className={navLinkClass}>
                <FileText className="mr-2 h-4 w-4" />
                File Transfer
              </NavLink>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-indigo-300 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-900/90 backdrop-blur-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink 
              to="/" 
              end 
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/video-chat" 
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              <Video className="mr-2 h-4 w-4" />
              Video Chat
            </NavLink>
            <NavLink 
              to="/text-chat" 
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              <Radio className="mr-2 h-4 w-4" />
              Text Chat
            </NavLink>
            <NavLink 
              to="/file-transfer" 
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText className="mr-2 h-4 w-4" />
              File Transfer
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;