import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpRight, ArrowRight, ChevronDown, Quote, ShieldAlert, Phone } from 'lucide-react';
import { homeActivities, gallery, testimonials, stats as fallbackStats } from '../mock';
import { API } from '../context/AuthContext';
import { useRescue } from '../context/RescueContext';
import Reveal from '../components/Reveal';

const useCounter = (target, duration = 1800) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return [val, ref];
};

const Stat = ({ value, suffix, label }) => {
  const [n, r] = useCounter(value);
  return (
    <div ref={r} className="flex flex-col">
      <div className="font-serif-display ticker text-5xl md:text-6xl lg:text-7xl text-[#1e3a2a]">
        {n.toLocaleString()}{suffix}
      </div>
      <div className="eyebrow text-[#1e3a2a]/60 mt-3">{label}</div>
    </div>
  );
};

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const [stats, setStats] = useState(fallbackStats);
  const { openRescueModal } = useRescue();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    axios.get(`${API}/content/stats`).then((r) => { if (r.data.value) setStats(r.data.value); }).catch(()=>{});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="pt-0">
      {/* Hero with parallax */}
      <section className="relative h-screen min-h-[720px] w-full overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.0002})` }}>
          <img src="https://wild-hearts-alliance.lovable.app/assets/hero-dog-BxwzzUus.jpg" alt="A rescued street dog at golden hour" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2419]/85 via-[#0f2419]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f2419]/70" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-center text-[#efe6cf]" style={{ transform: `translateY(${scrollY * -0.12}px)`, opacity: Math.max(0, 1 - scrollY / 700) }}>
          <div className="fade-up max-w-2xl">
            <h1 className="font-serif-display text-[68px] md:text-[92px] leading-[0.95]">
              Voices for<br />
              <span className="italic-serif text-[#e89670]">the</span> <span>voiceless.</span>
            </h1>
            <p className="mt-7 text-[17px] md:text-[18px] text-[#efe6cf]/85 leading-relaxed max-w-lg">
              A student-led rescue movement at PSG College of Technology. Every paw, every feather, every fragile heartbeat — they matter to us.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={openRescueModal}
                className="inline-flex items-center gap-2.5 bg-[#e89670] hover:bg-[#d8825c] text-[#1e3a2a] px-6 py-3.5 rounded-full text-[14.5px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-[#e89670]/40"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <ShieldAlert size={18} />
                <span>Save Animal (Report Rescue)</span>
              </button>
              <Link to="/join" className="inline-flex items-center gap-2 bg-[#efe6cf] text-[#1e3a2a] px-6 py-3.5 rounded-full text-[14.5px] font-medium hover:bg-white transition-colors">
                Join us <ArrowRight size={16} />
              </Link>
              <Link to="/activities" className="inline-flex items-center gap-2 border border-[#efe6cf]/60 text-[#efe6cf] px-6 py-3.5 rounded-full text-[14.5px] hover:bg-[#efe6cf]/10 transition-colors">
                Explore our work
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#efe6cf]/80 flex flex-col items-center gap-2">
          <div className="eyebrow">Scroll</div>
          <ChevronDown size={18} className="float-arrow" />
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-[#1e3a2a]/15">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 100} className="lg:pl-8 pt-8 lg:pt-0 first:pt-0 first:lg:pl-0">
              <Stat {...s} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 24/7 Rescue Emergency Banner */}
      <section className="bg-[#1e3a2a] text-[#efe6cf] py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e89670] text-[#1e3a2a] flex items-center justify-center shrink-0 font-bold shadow-md">
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow text-[#e89670] uppercase font-bold tracking-wider text-[11px]">24/7 Campus Animal Helpline</span>
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">LIVE RESPONSE</span>
              </div>
              <h3 className="font-serif-display text-2xl md:text-3xl mt-1">
                Found an animal in distress on campus?
              </h3>
              <p className="text-sm text-[#efe6cf]/80 mt-1 max-w-xl">
                Upload a picture, share the campus location & contact number. Our trained volunteer rescue team will dispatch first-aid kits and emergency veterinary care.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={openRescueModal}
              className="inline-flex items-center gap-2 bg-[#e89670] hover:bg-[#d8825c] text-[#1e3a2a] px-6 py-3.5 rounded-full text-sm font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShieldAlert size={18} />
              <span>Save Animal Now</span>
            </button>
            <a
              href="tel:+919442212345"
              className="inline-flex items-center gap-2 border border-[#efe6cf]/30 hover:bg-[#efe6cf]/10 text-[#efe6cf] px-5 py-3.5 rounded-full text-sm font-semibold transition-colors"
            >
              <Phone size={16} />
              <span>Call Helpline</span>
            </a>
          </div>
        </div>
      </section>

      {/* Our promise */}
      <section className="border-t border-[#1e3a2a]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28 md:py-36">
          <Reveal>
            <div className="text-center max-w-4xl mx-auto">
              <div className="eyebrow hairline hairline-r text-[#1e3a2a]/60 inline-block">Our promise</div>
              <h2 className="font-serif-display text-[42px] md:text-[64px] leading-[1.05] mt-6 text-[#1e3a2a]">
                We show up <span className="italic-serif">every morning</span> — with warm meals, warm hands, and the quiet resolve that no living being should hurt <span className="italic-serif text-[#e89670]">alone.</span>
              </h2>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Field notes / activities */}
      <section className="bg-[#e8dfc4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
              <div>
                <div className="eyebrow hairline text-[#1e3a2a]/60">Field notes</div>
                <h2 className="font-serif-display text-[44px] md:text-[64px] leading-[1.02] mt-5 text-[#1e3a2a] max-w-3xl">
                  Compassion, delivered <span className="italic-serif">on the ground.</span>
                </h2>
              </div>
              <Link to="/activities" className="inline-flex items-center gap-1.5 text-[#1e3a2a] link-underline text-[14.5px]">
                All activities <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {homeActivities.map((a, i) => (
              <Reveal key={a.title} delay={i * 120}>
                <article className="h-full bg-[#efe6cf] rounded-3xl border border-[#1e3a2a]/15 p-8 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#1e3a2a]/10 mb-5">
                      <span className="font-serif-display text-3xl font-bold text-[#e89670]">0{i + 1}</span>
                      <span className="eyebrow text-[#1e3a2a]/70 text-[11px] font-semibold">{a.tag}</span>
                    </div>
                    <h3 className="font-serif-display text-2xl text-[#1e3a2a]">{a.title}</h3>
                    <p className="text-[15px] text-[#1e3a2a]/75 mt-4 leading-relaxed">{a.description}</p>
                  </div>
                  <div className="mt-8 pt-5 border-t border-[#1e3a2a]/10">
                    <Link to="/activities" className="inline-flex items-center gap-1.5 text-[#1e3a2a] font-semibold text-xs hover:text-[#e89670] transition-colors">
                      Learn more about our work <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Hotspots & Routine Coverage */}
      <section className="border-t border-[#1e3a2a]/10 bg-[#efe6cf]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
              <div>
                <div className="eyebrow hairline text-[#1e3a2a]/60">Campus Hotspots & Coverage</div>
                <h2 className="font-serif-display text-[44px] md:text-[64px] leading-[1.02] mt-5 text-[#1e3a2a] max-w-3xl">
                  Every corner guarded <span className="italic-serif">with care.</span>
                </h2>
                <p className="mt-4 text-[16px] text-[#1e3a2a]/75 max-w-2xl">
                  Daily volunteer routes, water stations, and 24/7 rescue check posts across PSG Tech hotspots.
                </p>
              </div>
              <Link to="/gallery" className="inline-flex items-center gap-1.5 text-[#1e3a2a] link-underline text-[14.5px]">
                View dispatch logs <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Reveal delay={0}>
              <div className="bg-white/60 rounded-3xl border border-[#1e3a2a]/15 p-7 flex flex-col justify-between h-full shadow-sm">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#1e3a2a]/60 pb-3 border-b border-[#1e3a2a]/10 mb-4">
                    <span className="font-bold text-[#e89670]">HOTSPOT 01</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">ACTIVE ROUTINE</span>
                  </div>
                  <h4 className="font-serif-display text-2xl text-[#1e3a2a]">Hostel Q Block</h4>
                  <p className="text-[14.5px] text-[#1e3a2a]/75 mt-3 leading-relaxed">
                    Dedicated morning warm meal distribution point, anti-tick inspection, and clean refillable fresh water bowls.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#1e3a2a]/10 text-xs text-[#1e3a2a]/60 flex items-center gap-2">
                  <span>🍲 Daily 6:00 AM</span> • <span>👥 Hostel Volunteer Wing</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="bg-white/60 rounded-3xl border border-[#1e3a2a]/15 p-7 flex flex-col justify-between h-full shadow-sm">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#1e3a2a]/60 pb-3 border-b border-[#1e3a2a]/10 mb-4">
                    <span className="font-bold text-[#e89670]">HOTSPOT 02</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">RESIDENT CANINE WING</span>
                  </div>
                  <h4 className="font-serif-display text-2xl text-[#1e3a2a]">Hostel A, B, C & D Blocks</h4>
                  <p className="text-[14.5px] text-[#1e3a2a]/75 mt-3 leading-relaxed">
                    Care zone for resident hostel dogs. Monthly anti-rabies vaccination, nutrition logs, and student foster checks.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#1e3a2a]/10 text-xs text-[#1e3a2a]/60 flex items-center gap-2">
                  <span>💉 Monthly Vax</span> • <span>🩺 Health Monitoring</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="bg-white/60 rounded-3xl border border-[#1e3a2a]/15 p-7 flex flex-col justify-between h-full shadow-sm">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#1e3a2a]/60 pb-3 border-b border-[#1e3a2a]/10 mb-4">
                    <span className="font-bold text-[#e89670]">HOTSPOT 03</span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">HIGH TRANSIT ZONE</span>
                  </div>
                  <h4 className="font-serif-display text-2xl text-[#1e3a2a]">PSG Tech Parking</h4>
                  <p className="text-[14.5px] text-[#1e3a2a]/75 mt-3 leading-relaxed">
                    Safety vigilance zone to avoid vehicular injuries. Shaded resting corners created to protect strays from extreme heat.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#1e3a2a]/10 text-xs text-[#1e3a2a]/60 flex items-center gap-2">
                  <span>⚠️ Vehicle Caution</span> • <span>🌿 Canopy Resting Area</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="bg-white/60 rounded-3xl border border-[#1e3a2a]/15 p-7 flex flex-col justify-between h-full shadow-sm">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#1e3a2a]/60 pb-3 border-b border-[#1e3a2a]/10 mb-4">
                    <span className="font-bold text-[#e89670]">HOTSPOT 04</span>
                    <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">OPEN CANOPY</span>
                  </div>
                  <h4 className="font-serif-display text-2xl text-[#1e3a2a]">Sports Ground</h4>
                  <p className="text-[14.5px] text-[#1e3a2a]/75 mt-3 leading-relaxed">
                    Wide green ground feeding perimeter. Regularly visited for stray bird hydration pots and friendly student socialization.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#1e3a2a]/10 text-xs text-[#1e3a2a]/60 flex items-center gap-2">
                  <span>🕊️ Bird Baths</span> • <span>🐕 Open Green Area</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="bg-white/60 rounded-3xl border border-[#1e3a2a]/15 p-7 flex flex-col justify-between h-full shadow-sm">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#1e3a2a]/60 pb-3 border-b border-[#1e3a2a]/10 mb-4">
                    <span className="font-bold text-[#e89670]">HOTSPOT 05</span>
                    <span className="bg-red-100 text-red-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">EMERGENCY CORRIDOR</span>
                  </div>
                  <h4 className="font-serif-display text-2xl text-[#1e3a2a]">Hostel Road & South Gate</h4>
                  <p className="text-[14.5px] text-[#1e3a2a]/75 mt-3 leading-relaxed">
                    Main rescue transit lane. Equipped with emergency first-aid kit storage and quick ambulance/vet clinic dispatch link.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#1e3a2a]/10 text-xs text-[#1e3a2a]/60 flex items-center gap-2">
                  <span>🚑 SOS Dispatch</span> • <span>📦 First-Aid Stash</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="bg-[#1e3a2a] text-[#efe6cf] rounded-3xl p-7 flex flex-col justify-between h-full shadow-md">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#efe6cf]/70 pb-3 border-b border-[#efe6cf]/15 mb-4">
                    <span className="font-bold text-[#e89670]">24/7 HELPLINE</span>
                    <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/30">REPORT NOW</span>
                  </div>
                  <h4 className="font-serif-display text-2xl text-white">Spotted distress elsewhere?</h4>
                  <p className="text-[14px] text-[#efe6cf]/80 mt-3 leading-relaxed">
                    Our student team responds across all departments, labs, and gates within minutes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#efe6cf]/15">
                  <button
                    type="button"
                    onClick={openRescueModal}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#e89670] hover:bg-[#d8825c] text-[#1e3a2a] px-5 py-3 rounded-full text-xs font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                  >
                    <ShieldAlert size={15} /> Save Animal (Report Distress)
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0f2419] text-[#efe6cf]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <Reveal><div className="eyebrow hairline text-[#efe6cf]/70">Voices we’ve touched</div></Reveal>
          <div className="grid md:grid-cols-3 gap-10 md:gap-14 mt-14">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 130}>
                <div className="pt-8 border-t border-[#efe6cf]/15">
                  <Quote className="text-[#e89670]" size={26} />
                  <p className="font-serif-display text-[22px] md:text-[24px] leading-snug mt-5">{t.quote}</p>
                  <div className="eyebrow mt-6 text-[#efe6cf]">{t.name}</div>
                  <div className="text-[13px] text-[#efe6cf]/60 mt-1">{t.role}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#efe6cf]">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-28 md:py-40 text-center">
          <Reveal>
            <div className="eyebrow hairline hairline-r text-[#1e3a2a]/60 inline-block">Become one of us</div>
            <h2 className="font-serif-display text-[46px] md:text-[76px] leading-[1.02] mt-6 text-[#1e3a2a]">
              The kindest thing you can do this year <span className="italic-serif text-[#e89670]">starts here.</span>
            </h2>
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Link to="/join" className="inline-flex items-center gap-2 bg-[#1e3a2a] text-[#efe6cf] px-6 py-3.5 rounded-full text-[14.5px] hover:bg-[#284d3a] transition-colors">
                Join AWC <ArrowUpRight size={16} />
              </Link>
              <Link to="/team" className="inline-flex items-center gap-2 border border-[#1e3a2a]/40 text-[#1e3a2a] px-6 py-3.5 rounded-full text-[14.5px] hover:bg-[#1e3a2a]/5 transition-colors">
                Meet the team
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
