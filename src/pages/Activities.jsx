import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { activities as fallbackActivities } from '../mock';
import { API } from '../context/AuthContext';
import axios from 'axios';

const Activities = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/activities`)
      .then((r) => {
        if (r.data && Array.isArray(r.data) && r.data.length > 0) {
          setItems(r.data);
        } else {
          setItems(fallbackActivities);
        }
      })
      .catch(() => setItems(fallbackActivities))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32">
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 pb-14">
        <div className="eyebrow hairline text-[#1e3a2a]/60">Our activities</div>
        <h1 className="font-serif-display text-[52px] md:text-[92px] leading-[1] mt-6 text-[#1e3a2a] max-w-4xl">
          Kindness, <span className="italic-serif text-[#e89670]">on repeat.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-[17px] md:text-[18px] leading-relaxed text-[#1e3a2a]/75">
          Not campaigns. Not one-off drives. A rhythm — daily, weekly, seasonal — that turns compassion from a feeling into an infrastructure.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24 md:pb-32">
        <div className="space-y-24 md:space-y-32">
          {items.map((a, i) => (
            <article key={a.num || a.id} className={`grid md:grid-cols-12 gap-8 md:gap-14 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}>
              <div className="md:col-span-6">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-[#1e3a2a]/10">
                  <img 
                    src={a.image || '/assets/images/feed_campus.png'} 
                    alt={a.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                    onError={(e) => { e.currentTarget.src = '/assets/images/feed_campus.png'; }}
                  />
                </div>
              </div>
              <div className="md:col-span-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-serif-display text-4xl text-[#e89670]">{a.num || `0${i + 1}`}</span>
                  <span className="eyebrow text-[#1e3a2a]/60">{a.tag}</span>
                </div>
                <h2 className="font-serif-display text-[40px] md:text-[56px] leading-[1.05] mt-5 text-[#1e3a2a]">{a.title}</h2>
                <p className="mt-6 text-[16px] md:text-[17.5px] leading-relaxed text-[#1e3a2a]/78 max-w-lg">{a.description}</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/events?event=${encodeURIComponent(a.title)}`}
                    className="inline-flex items-center gap-1.5 bg-[#1e3a2a] text-[#efe6cf] px-5 py-2.5 rounded-full text-[13px] font-medium hover:bg-[#284d3a] transition-colors shadow-sm cursor-pointer"
                  >
                    Event Form & Register <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    to={`/queries?activity=${encodeURIComponent(a.title)}`}
                    className="inline-flex items-center gap-1.5 border border-[#1e3a2a]/30 text-[#1e3a2a] px-4 py-2.5 rounded-full text-[13px] font-medium hover:bg-[#1e3a2a]/8 transition-colors shadow-sm cursor-pointer"
                  >
                    Report / Query <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Activities;
