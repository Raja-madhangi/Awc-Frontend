import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { aboutValues } from '../mock';
import aboutImg from '../assets/images/about_shelter_dogs_1784629418108.jpg';

const About = () => (
  <div className="pt-32 pb-0">
    <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 pb-20">
      <div className="eyebrow hairline text-[#1e3a2a]/60">Since 2016</div>
      <h1 className="font-serif-display text-[52px] md:text-[92px] leading-[1] mt-6 text-[#1e3a2a] max-w-4xl">
        A quiet decade of <span className="italic-serif text-[#e89670]">showing up.</span>
      </h1>
    </section>

    <section className="max-w-6xl mx-auto px-6 lg:px-10">
      <div className="rounded-3xl overflow-hidden aspect-[16/8] shadow-lg border border-[#1e3a2a]/5">
        <img
          src={aboutImg}
          alt="PSG College of Technology Animal Welfare Club - Rescued street dogs in shelter yard"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          referrerPolicy="no-referrer"
        />
      </div>
    </section>

    <section className="max-w-4xl mx-auto px-6 lg:px-10 py-24 md:py-32 space-y-8 text-[19px] md:text-[21px] leading-[1.8] text-[#1e3a2a]/85 font-serif-display">
      <p>
        The Animal Welfare Club of PSG College of Technology is a community of compassionate minds united by one mission: being a strong, gentle voice for those who cannot speak for themselves. Founded in 2016 by a small group of visionary students and a single rescued puppy, we have grown into a dedicated force of volunteers, caregivers, and advocates working tirelessly day and night.
      </p>
      <p>
        For us, animal welfare is not a part-time interest; it is an active daily responsibility. Every single morning at dawn, our teams set out for campus-wide feeding rounds, ensuring that every resident stray is nourished. When a distress call rings, our emergency rescue volunteers jump into action with first-aid kits and a fleet of scooters, transporting injured or sick animals directly to trusted veterinary partners for immediate medical care.
      </p>
      <p>
        Our commitment goes far beyond temporary aid. We organize professional anti-rabies vaccination drives, sterilization campaigns to manage the stray population humanely, and active adoption networks that find loving forever homes for rescued puppies and kittens. We believe that coexistence is built on education, which is why we actively host awareness sessions, street theatres, and interactive dialogues across the campus.
      </p>
      <p>
        We are not a charity. We are a family of students who show up with warmth, dedication, and a lifetime promise that no animal in our reach will ever be left to suffer alone.
      </p>
    </section>

    <section className="bg-[#efe6cf]/60 border-y border-[#1e3a2a]/10 py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <div className="eyebrow hairline text-[#e89670]">Our Mission</div>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#1e3a2a] mt-4 mb-6">
              To alleviate suffering and inspire gentle coexistence.
            </h2>
            <p className="text-[16px] md:text-[17px] leading-relaxed text-[#1e3a2a]/80">
              Our mission is to establish a safe, humane, and compassionate environment for stray animals on and around campus. Through dedicated feeding rounds, swift medical rescue, widespread adoption efforts, and sterilization drives, we protect and improve lives daily, while educating community members on the values of peaceful coexistence.
            </p>
          </div>
          <div>
            <div className="eyebrow hairline text-[#e89670]">Our Vision</div>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#1e3a2a] mt-4 mb-6">
              A community where every life is respected and cared for.
            </h2>
            <p className="text-[16px] md:text-[17px] leading-relaxed text-[#1e3a2a]/80">
              Our vision is to build a harmonious campus and a broader society where animals and humans coexist without conflict, fear, or neglect. We envision a future where animal care is an inherent part of community life, stray populations are managed humanely, and empathy is the leading guiding principle for all.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-[#e8dfc4]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32">
        <h2 className="font-serif-display text-[42px] md:text-[64px] text-[#1e3a2a] mb-14 max-w-3xl">
          What we <span className="italic-serif">stand for.</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {aboutValues.map((v, i) => (
            <div key={v.title} className="p-8 md:p-10 bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/10">
              <div className="eyebrow text-[#1e3a2a]/55">{String(i + 1).padStart(2, '0')}</div>
              <h3 className="font-serif-display text-3xl md:text-4xl text-[#1e3a2a] mt-4">{v.title}</h3>
              <p className="mt-4 text-[15.5px] leading-relaxed text-[#1e3a2a]/75">{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="max-w-5xl mx-auto px-6 lg:px-10 py-28 md:py-36 text-center">
      <div className="eyebrow hairline hairline-r text-[#1e3a2a]/60 inline-block">Ready to show up with us?</div>
      <div className="mt-10">
        <Link to="/join" className="inline-flex items-center gap-2 bg-[#1e3a2a] text-[#efe6cf] px-6 py-3.5 rounded-full text-[14.5px] hover:bg-[#284d3a] transition-colors">
          Join AWC <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  </div>
);

export default About;
