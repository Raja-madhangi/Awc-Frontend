import React, { useMemo, useState, useEffect } from 'react';
import { gallery as fallbackGallery } from '../mock';
import { API } from '../context/AuthContext';
import axios from 'axios';

const Gallery = () => {
  const [cat, setCat] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/gallery`)
      .then((r) => {
        if (r.data && Array.isArray(r.data) && r.data.length > 0) {
          setItems(r.data);
        } else {
          setItems(fallbackGallery);
        }
      })
      .catch(() => setItems(fallbackGallery))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = ['All'];
    items.forEach((it) => {
      if (it.category && !cats.includes(it.category)) {
        cats.push(it.category);
      }
    });
    return cats;
  }, [items]);

  const filtered = useMemo(
    () => (cat === 'All' ? items : items.filter((g) => g.category === cat)),
    [cat, items]
  );

  return (
    <div className="pt-32">
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="eyebrow hairline text-[#1e3a2a]/60">The archive</div>
        <h1 className="font-serif-display text-[48px] md:text-[84px] leading-[1] mt-6 text-[#1e3a2a]">
          Campus <span className="italic-serif text-[#e89670]">dispatch logs.</span>
        </h1>
        <p className="mt-6 text-[16px] md:text-[17.5px] leading-relaxed text-[#1e3a2a]/75 max-w-2xl">
          Real campus animal care reports, feeding logs, emergency interventions, and rescue milestones recorded by our PSG Tech student team.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-[13px] border transition-colors ${
                cat === c
                  ? 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a]'
                  : 'bg-transparent text-[#1e3a2a] border-[#1e3a2a]/25 hover:bg-[#1e3a2a]/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-28">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((g, i) => (
            <article 
              key={g.id || i} 
              className="bg-[#efe6cf]/80 hover:bg-[#efe6cf] transition-all rounded-3xl border border-[#1e3a2a]/15 p-5 md:p-6 flex flex-col justify-between shadow-sm hover:shadow-md group overflow-hidden"
            >
              <div>
                {g.image && (
                  <div className="rounded-2xl overflow-hidden aspect-[16/10] mb-4 bg-[#1e3a2a]/5 border border-[#1e3a2a]/10">
                    <img 
                      src={g.image} 
                      alt={g.caption || 'AWC Campus archive'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs mb-3 pb-2.5 border-b border-[#1e3a2a]/10">
                  <span className="bg-[#1e3a2a]/10 text-[#1e3a2a] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px]">
                    {g.category || 'Archive Log'}
                  </span>
                  <span className="text-[#1e3a2a]/60 text-[11px] font-mono">
                    LOG #{String(i + 1).padStart(3, '0')}
                  </span>
                </div>

                <h3 className="font-serif-display text-xl text-[#1e3a2a] leading-snug group-hover:text-[#284d3a] transition-colors">
                  {g.caption || 'Campus Rescue Entry'}
                </h3>

                <p className="mt-2.5 text-[14px] text-[#1e3a2a]/75 leading-relaxed">
                  {g.description || (
                    g.category === 'Rescue'
                      ? 'Emergency first-aid administered, stabilized by student volunteers, and coordinated with local partner vets.'
                      : g.category === 'Dogs'
                      ? 'Routine health checkup, anti-rabies vaccination, and regular food provision near campus hostels.'
                      : 'Campus student community initiative ensuring clean water bowls, shade canopies, and safe coexistence.'
                  )}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#1e3a2a]/10 flex items-center justify-between text-[11.5px] text-[#1e3a2a]/60">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Verified Record
                </span>
                <span className="font-serif-display text-xs text-[#e89670] font-semibold">
                  PSG TECH AWC
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
