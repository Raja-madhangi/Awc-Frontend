import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { LOGO } from '../mock';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/activities', label: 'Activities' },
  { to: '/events', label: 'Events' },
  { to: '/queries', label: 'Queries' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/team', label: 'Team' },
  { to: '/join', label: 'Get Involved' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const onHome = location.pathname === '/';

  const dashPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav
          className={`flex items-center gap-2 md:gap-4 pl-2 pr-2 py-1.5 rounded-full border transition-all duration-500 ${
            scrolled || !onHome
              ? 'bg-[#efe6cf]/95 border-[#1e3a2a]/15 backdrop-blur-md shadow-[0_10px_40px_-20px_rgba(30,58,42,0.35)]'
              : 'bg-[#efe6cf]/85 border-[#1e3a2a]/10 backdrop-blur-md'
          }`}
        >
          <Link to="/" className="flex items-center gap-2 pl-1 pr-2 py-1">
            <img src={LOGO} alt="AWC" className="w-11 h-11 rounded-full object-cover ring-1 ring-[#1e3a2a]/10" />
            <div className="leading-tight hidden sm:block">
              <div className="font-serif-display text-[15px] text-[#1e3a2a]">Animal Welfare Club</div>
              <div className="eyebrow text-[9px] text-[#1e3a2a]/60">PSG COLLEGE OF TECHNOLOGY</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-[13.5px] transition-colors ${
                    isActive ? 'text-[#1e3a2a] bg-[#1e3a2a]/8' : 'text-[#1e3a2a]/75 hover:text-[#1e3a2a]'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <Link to={dashPath} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] text-[#1e3a2a] hover:bg-[#1e3a2a]/8">
                <LayoutDashboard size={14} /> {user.role === 'admin' ? 'Admin' : 'Dashboard'}
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] text-[#1e3a2a]/75 hover:text-[#1e3a2a]">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:inline-flex items-center gap-1.5 bg-[#1e3a2a] hover:bg-[#284d3a] text-[#efe6cf] px-4 py-2.5 rounded-full text-[13.5px] transition-colors">
              <User size={14} /> Login
            </Link>
          )}

          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-10 h-10 rounded-full border border-[#1e3a2a]/20 flex items-center justify-center text-[#1e3a2a]"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-[#efe6cf] pt-24 px-6">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) => `py-4 border-b border-[#1e3a2a]/15 font-serif-display text-2xl ${isActive ? 'text-[#1e3a2a]' : 'text-[#1e3a2a]/70'}`}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to={dashPath} className="py-4 border-b border-[#1e3a2a]/15 font-serif-display text-2xl text-[#1e3a2a]">{user.role === 'admin' ? 'Admin panel' : 'My dashboard'}</Link>
                <button onClick={() => { logout(); navigate('/'); }} className="mt-4 inline-flex items-center justify-center gap-2 border border-[#1e3a2a]/40 text-[#1e3a2a] px-5 py-3 rounded-full">Logout</button>
              </>
            ) : (
              <Link to="/login" className="mt-6 inline-flex items-center justify-center gap-2 bg-[#1e3a2a] text-[#efe6cf] px-5 py-3 rounded-full">Login / Sign up</Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
