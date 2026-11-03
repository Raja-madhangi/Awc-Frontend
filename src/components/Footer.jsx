import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone, PawPrint, ShieldAlert } from 'lucide-react';
import { AwcLogoMark } from './AwcLogo';
import { useRescue } from '../context/RescueContext';

const Footer = () => {
  const { openRescueModal } = useRescue();

  return (
    <footer className="bg-[#0f2419] text-[#efe6cf] pt-20 pb-10 mt-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-4 gap-12 pb-14 border-b border-[#efe6cf]/10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3.5 mb-5">
              <AwcLogoMark size={50} className="shadow-lg drop-shadow" />
              <div>
                <div className="font-serif-display text-2xl font-bold text-[#efe6cf]">Animal Welfare Club</div>
                <div className="eyebrow text-[10.5px] text-[#e89670] tracking-wider font-semibold">PSG COLLEGE OF TECHNOLOGY</div>
              </div>
            </div>
            <p className="font-serif-display italic text-2xl leading-snug max-w-md text-[#efe6cf]/85 mb-6">
              Every paw, every feather, every fragile heartbeat — they matter to us.
            </p>
            <button
              type="button"
              onClick={openRescueModal}
              className="inline-flex items-center gap-2 bg-[#e89670] hover:bg-[#d8825c] text-[#1e3a2a] px-4 py-2 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <ShieldAlert size={14} /> Save Animal (Emergency Rescue)
            </button>
          </div>

          <div>
            <div className="eyebrow text-[#efe6cf]/50 mb-4">Explore</div>
            <ul className="space-y-3 text-[15px]">
              <li><Link to="/about" className="hover:text-white opacity-80 hover:opacity-100 transition-opacity">About</Link></li>
              <li><Link to="/activities" className="hover:text-white opacity-80 hover:opacity-100 transition-opacity">Activities</Link></li>
              <li><Link to="/gallery" className="hover:text-white opacity-80 hover:opacity-100 transition-opacity">Gallery</Link></li>
              <li><Link to="/team" className="hover:text-white opacity-80 hover:opacity-100 transition-opacity">The People</Link></li>
              <li><Link to="/join" className="hover:text-white opacity-80 hover:opacity-100 transition-opacity">Join AWC</Link></li>
              <li><Link to="/admin/login" className="hover:text-[#e89670] opacity-60 hover:opacity-100 text-xs transition-opacity pt-1 block">Coordinator & Admin Login ↗</Link></li>
            </ul>
          </div>

        <div>
          <div className="eyebrow text-[#efe6cf]/50 mb-4">Reach us</div>
          
          <ul className="space-y-3 text-[15px] opacity-85 mb-5">
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-1 text-[#e89670] shrink-0" />
              <span>PSG College of Technology, Coimbatore 641004</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-[#e89670]" />
              <a href="mailto:awc@psgtech.ac.in" className="hover:underline">awc@psgtech.ac.in</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-[#e89670]" />
              <a href="tel:+919000012345" className="hover:underline">+91 90000 12345</a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram size={15} className="text-[#e89670]" />
              <a href="https://instagram.com/awc.psgtech" target="_blank" rel="noopener noreferrer" className="hover:underline">@awc.psgtech</a>
            </li>
          </ul>

          <div className="group relative rounded-xl overflow-hidden border border-[#efe6cf]/15 h-44 w-full shadow-lg bg-[#0a1811]">
            <iframe
              title="PSG College of Technology Map"
              src="https://maps.google.com/maps?q=PSG%20College%20of%20Technology,%20Peelamedu,%20Coimbatore&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0 opacity-80 hover:opacity-100 transition-all duration-300"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <a 
                href="https://maps.google.com/?q=PSG+College+of+Technology+Peelamedu+Coimbatore" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#1e3a2a] text-[#efe6cf] text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-md border border-[#efe6cf]/20 hover:bg-[#284d3a] transition-colors"
              >
                Open in Maps ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[12.5px] opacity-60">
        <div>© {new Date().getFullYear()} Animal Welfare Club, PSG Tech. Built with quiet care.</div>
        <div className="eyebrow">Voices for the voiceless</div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
