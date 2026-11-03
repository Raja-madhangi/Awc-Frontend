import React, { useState, useEffect } from 'react';
import { team as fallbackTeam } from '../mock';
import { API } from '../context/AuthContext';
import axios from 'axios';

const avatarColors = ['#e89670', '#1e3a2a', '#6b8e5a', '#c67b5c', '#3a5e48', '#a86c48', '#4a6d5a'];

const MemberCard = ({ m, i, big = false }) => (
  <div className={`p-7 md:p-8 bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/10 ${big ? 'md:col-span-2' : ''}`}>
    <div className={`rounded-xl overflow-hidden flex items-center justify-center font-serif-display text-[#efe6cf] text-[64px] md:text-[80px] ${big ? 'aspect-[16/7] min-h-[160px]' : 'aspect-square'}`} style={{ background: m.image ? 'transparent' : avatarColors[i % avatarColors.length] }}>
      {m.image ? (
        <img src={m.image} alt={m.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
      ) : (
        m.initials || (m.name ? m.name.split(' ').map(n => n[0]).join('') : 'AWC')
      )}
    </div>
    <div className="eyebrow text-[#1e3a2a]/55 mt-6">{m.role}</div>
    <h3 className="font-serif-display text-3xl mt-2 text-[#1e3a2a]">{m.name}</h3>
    <div className="mt-1 text-[14px] text-[#1e3a2a]/70">{m.dept}</div>
    {m.bio && <p className="mt-4 text-[14.5px] leading-relaxed text-[#1e3a2a]/75">{m.bio}</p>}
  </div>
);

const Team = () => {
  const [faculty, setFaculty] = useState(fallbackTeam.faculty);
  const [members, setMembers] = useState(fallbackTeam.members);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/team`)
      .then((r) => {
        if (r.data && Array.isArray(r.data) && r.data.length > 0) {
          const fac = r.data.find((m) => m.is_faculty === true || m.is_faculty === 'true');
          const mems = r.data.filter((m) => m.is_faculty !== true && m.is_faculty !== 'true');
          if (fac) setFaculty(fac);
          if (mems.length > 0) setMembers(mems);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32">
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 pb-16">
        <div className="eyebrow hairline text-[#1e3a2a]/60">The people</div>
        <h1 className="font-serif-display text-[46px] md:text-[84px] leading-[1] mt-6 text-[#1e3a2a] max-w-4xl">
          Ordinary students. <span className="italic-serif text-[#e89670]">Extraordinary hearts.</span>
        </h1>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-14">
        <div className="eyebrow text-[#1e3a2a]/55 mb-6">Faculty coordinator</div>
        <div className="grid md:grid-cols-2 gap-6">
          <MemberCard m={faculty} i={0} big />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-28">
        <div className="eyebrow text-[#1e3a2a]/55 mb-6">Core team · 2025–26</div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((m, i) => (
            <MemberCard key={m.name || m.id} m={m} i={i + 1} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Team;
