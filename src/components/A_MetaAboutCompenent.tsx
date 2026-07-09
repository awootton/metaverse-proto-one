import React from 'react';


import {
  Globe,
  Map,
  Rocket,
  ExternalLink,
  //  Twitter, 
  ArrowRight,
  Info,
  Cuboid,
  createLucideIcon
} from 'lucide-react';

const Twitter = createLucideIcon('TwitterX', [
  ['path', { d: 'x.svg' }] // insert SVG path data here
]);

import "./A_MetaAboutCompenent.css"; // Import the CSS file for styling

// Optional: If using Next.js, import the image like this:
// import heroImage from './imagine_images/ypEdc.jpg';

interface MetaverseProtoAboutProps {
  /** Path or import for the hero background image */
  heroImageSrc?: string;
  /** Custom className for the root container */
  className?: string;
  /** Callback when user clicks the main Demo button (optional) */
  onLaunchDemo?: () => void;
}

export const MetaverseProtoAbout: React.FC<MetaverseProtoAboutProps> = ({
  heroImageSrc = '/imagine_images/ypEdc.jpg', // Adjust this path for your project (e.g. /assets/ or import)
  className = '',
  onLaunchDemo,
}) => {
  const handleLaunchDemo = () => {
    if (onLaunchDemo) {
      onLaunchDemo();
    } else {
      window.open('https://gotohere.com', '_blank');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // account for sticky nav
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition - bodyRect - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={`bg-[#050507] text-white overflow-x-hidden ${className}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050507]/95 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto">
          <div className="px-8 py-5 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 via-[#00f0ff] to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                {/* <Cuboid className="text-[#050507]" size={22} /> */}
              </div>
              <div>
                <span className="font-display text-2xl font-semibold tracking-tighter">Metaverse&nbsp;</span>
                <span className="font-display text-2xl font-semibold tracking-tighter text-white/60">Proto&nbsp;</span>
                <span className="font-display text-2xl font-semibold tracking-tighter text-white/60">One</span>
              </div>
            </div>

            {/* Nav Links */}
            {/* <div className="hidden md:flex items-center gap-x-9 text-sm font-medium">
              <button 
                onClick={() => scrollToSection('idea')} 
                className="nav-link text-white/80 hover:text-white px-1 transition-colors"
              >
                The Idea
              </button>
              <button 
                onClick={() => scrollToSection('demo')} 
                className="nav-link text-white/80 hover:text-white px-1 transition-colors"
              >
                Live Demo
              </button>
              <button 
                onClick={() => scrollToSection('next')} 
                className="nav-link text-white/80 hover:text-white px-1 transition-colors"
              >
                What's Next
              </button>
              <button 
                onClick={() => scrollToSection('journey')} 
                className="nav-link text-white/80 hover:text-white px-1 transition-colors"
              >
                Follow the Build
              </button>
            </div> */}

            <div className="flex items-center gap-x-3">
              <a
                href="https://gotohere.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-x-2 px-5 py-2.5 text-sm font-semibold rounded-3xl border border-white/20 hover:bg-white/5 transition-colors"
              >
                <Globe size={16} className="mr-1.5" />
                <span>Launch Demo</span>
              </a>
              <a
                href="https://x.com/alan_t_wootton"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-x-2 px-5 py-2.5 text-sm font-semibold bg-white text-[#050507] rounded-3xl hover:bg-white/90 transition-all active:scale-[0.985]"
              >
                <Twitter size={18} />
                <span className="hidden sm:inline">Follow on X</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[100dvh] flex items-center justify-center pt-8 pb-16 border-b border-white/10 overflow-hidden">
        {/* Background Image + Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImageSrc}
            alt="Abstract metaverse spatial grid with glowing property cubes"
            className="w-full h-full object-cover opacity-60"
            width="400" height="auto"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-[#050507]/90 to-[#050507]"></div>
          <div className="absolute inset-0 metaverse-grid opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-x-2 px-4 py-1.5 rounded-3xl bg-white/5 border border-white/10 text-xs font-mono tracking-[3px] mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 font-medium">PROTO RELEASE • JULY 2026</span>
          </div>

          <div className="inline-flex items-center gap-x-2 px-4 py-1.5 rounded-3xl bg-white/5 border border-white/10 text-xs font-mono tracking-[3px] mb-6">
              &nbsp;
          </div>

          <div className="inline-flex items-center gap-x-2 px-4 py-1.5 rounded-3xl bg-white/5 border border-white/10 text-xs font-mono tracking-[3px] mb-6">
            <b>6/8/26</b> new release and article about tunneling spaces to servers. There was a duck involved. &nbsp;
            <a href="https://x.com/alan_t_wootton/status/2075097973042913747" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">
              See the article for details.
            </a>
            <p>X-Ray mode is now happening.  &nbsp; It's "shift control =" to see the outlines and addresses of everything.</p>
          </div>

          <h1 className="font-display text-7xl md:text-8xl lg:text-[92px] leading-[0.92] tracking-[-5.5px] font-semibold mb-4">
            How to buy property<br />
            in <span className="bg-gradient-to-r from-[#00f0ff] to-[#a855f7] bg-clip-text text-transparent">The Metaverse</span>.
          </h1>

          <p className="max-w-2xl mx-auto text-3xl md:text-4xl text-white/90 tracking-tight mb-3">
            Just buy a domain name<br />of the right format.
          </p>

          <p className="text-xl md:text-2xl text-cyan-400 font-medium mb-10">
            Like, for real. New demo released today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLaunchDemo}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-x-3 px-10 py-4 bg-white hover:bg-white/95 text-[#050507] font-semibold text-lg rounded-3xl transition-all active:scale-[0.985] shadow-xl shadow-white/10"
            >
              <span>Explore the Demo</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>

            <a
              href="https://x.com/alan_t_wootton/status/2074578390208983408?s=20"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-x-3 px-8 py-4 border border-white/30 hover:bg-white/5 text-white font-semibold text-lg rounded-3xl transition-all"
            >
              <Twitter size={20} />
              <span>Read the full announcement</span>
            </a>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-x-2 text-xs uppercase tracking-[2px] text-white/50">
              <div className="h-px w-8 bg-white/30"></div>
              <span>SCROLL TO LEARN MORE</span>
              <div className="h-px w-8 bg-white/30"></div>
            </div>
          </div>
        </div>
      </header>

      {/* The Idea Section */}
      <section id="idea" className="max-w-screen-2xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-x-4 mb-6">
            <div className="px-4 py-1 rounded-2xl bg-white/5 text-xs font-mono tracking-widest border border-white/10">
              THE CORE IDEA
            </div>
          </div>

          <h2 className="font-display text-[2.75rem] leading-[1.05] font-bold tracking-[-1.5px] mb-8">
            A pragmatic path to<br />virtual land ownership.
          </h2>

          <div className="prose prose-invert prose-lg max-w-none text-white/90">
            <p className="text-xl leading-relaxed">
              There's no shortage of people debating the best way to buy virtual property in the metaverse.
            </p>
            <p className="text-xl leading-relaxed mt-5">
              What I have is a <span className="font-semibold text-white">solid, working demonstration</span> of it happening — right now.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {/* Key point 1 */}
            <div className="glass rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-9 h-9 flex-shrink-0 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
                  <Globe className="text-cyan-400" size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-xl mb-2">Domain Names = Real Ownership</h4>
                  <p className="text-white/70 leading-relaxed">
                    Domain names already carry legal weight — trademarks, ownership disputes, ICANN governance.
                    The metaverse doesn't get to opt out of that reality. This is the pragmatic foundation.
                  </p>
                </div>
              </div>
            </div>

            {/* Key point 2 */}
            <div className="glass rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-9 h-9 flex-shrink-0 rounded-2xl bg-violet-400/10 flex items-center justify-center">
                  <Map className="text-violet-400" size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-xl mb-2">Spatial Addresses, Not NFTs</h4>
                  <p className="text-white/70 leading-relaxed">
                    These aren't cute brandable words. They're spatial coordinates encoded in the domain
                    (power cube, direction, scale). The demo includes a visual map so you don't have to decode them manually.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="border-y border-white/10 bg-[#0a0a12] py-16">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="uppercase tracking-[3px] text-xs font-mono mb-3 text-cyan-400">PROOF OF CONCEPT</div>
            <h2 className="font-display text-[2.75rem] leading-[1.05] font-bold tracking-[-1.5px] mb-4">
              Everything in the demo<br />is a domain name.
            </h2>
            <p className="text-xl text-white/80 max-w-md">
              The current prototype at gotohere.com shows the system working live.
              Every object, every location you see is backed by a real domain name you can own.
            </p>

            <div className="mt-10">
              <button
                onClick={handleLaunchDemo}
                className="group inline-flex items-center justify-between w-full md:w-auto gap-x-4 px-8 py-6 rounded-3xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all text-left"
              >
                <div className="flex items-center gap-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Rocket className="text-[#050507]" size={28} />
                  </div>
                  <div>
                    <div className="font-semibold text-2xl tracking-tight">Launch the Demo</div>
                    <div className="text-white/60">https://gotohere.com</div>
                  </div>
                </div>
                <ExternalLink className="text-2xl text-white/40 group-hover:text-white transition-colors ml-6" />
              </button>
            </div>

            <div className="mt-6 text-sm text-white/50 flex items-center gap-x-2">
              <Info size={16} />
              <span>
                Works with regular .xyz domains from any registrar + free provisional .vr names to bootstrap the ecosystem.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What's Next Section */}
      <section id="next" className="max-w-screen-2xl mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-x-4 mb-6">
            <div className="px-4 py-1 rounded-2xl bg-white/5 text-xs font-mono tracking-widest border border-white/10">
              ROADMAP
            </div>
          </div>

          <h2 className="font-display text-[2.75rem] leading-[1.05] font-bold tracking-[-1.5px] mb-10">
            What's next for<br />The Metaverse Proto.
          </h2>

          <div className="space-y-5">
            {[
              {
                num: "01",
                title: "Property Acquisition via Domain Names",
                desc: "Done. You can already claim real spatial addresses today."
              },
              {
                num: "02",
                title: "Interaction Layer",
                desc: "How avatars, cars, objects, and other entities interact with properties and each other inside the space. This is the current focus."
              },
              {
                num: "03",
                title: "Working Code & Open Demos",
                desc: "As the technique is refined, full working code, automation scripts (including octree reservation), and live demos will be released publicly."
              },
              {
                num: "04",
                title: "The Full Metaverse",
                desc: "This is the foundation. Once interaction and tooling mature, the real metaverse experience becomes possible."
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start group">
                <div className="mt-1.5 flex-shrink-0 w-9 h-9 rounded-2xl border border-white/20 flex items-center justify-center text-sm font-mono text-white/60 group-hover:border-cyan-400/60 transition-colors">
                  {item.num}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xl">{item.title}</div>
                  <div className="text-white/60 mt-1">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Quote Section */}
      <section className="border-y border-white/10 bg-[#0a0a12] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-[21px] leading-tight tracking-tight text-white/90">
            “As I describe the technique I’ll provide working code and a working demo. It’s what I do.<br />
            <span className="text-white font-semibold">And then, there will be… The Metaverse.”</span>
          </div>
          <div className="mt-6 text-sm text-white/50">— Alan T. Wootton</div>
        </div>
      </section>

      {/* Follow the Journey Section */}
      <section id="journey" className="max-w-screen-2xl mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mx-auto mb-8 w-fit px-5 py-1.5 rounded-3xl bg-white/5 border border-white/10 text-xs tracking-[2.5px] font-mono">
            BUILDING IN PUBLIC
          </div>

          <h2 className="font-display text-[2.75rem] leading-[1.05] font-bold tracking-[-1.5px] mb-4">
            Follow the journey.
          </h2>
          <p className="max-w-md mx-auto text-xl text-white/70">
            I'm documenting everything on X — the progress, the code drops, the hard problems, and the wins.
            This is early, manual, and very nerdy. That's usually how the best stuff starts.
          </p>

          <div className="mt-10">
            <a
              href="https://x.com/alan_t_wootton"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-x-3 px-9 py-4 rounded-3xl bg-white text-[#050507] font-semibold text-lg hover:bg-white/90 active:scale-[0.985] transition-all"
            >
              <Twitter size={22} />
              <span>Follow @alan_t_wootton</span>
            </a>
          </div>

          <p className="mt-6 text-sm text-white/50 max-w-xs mx-auto">
            I don’t have time for much social media.<br />I have a lot of work to do.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-screen-2xl mx-auto px-8 text-center text-xs text-white/40 tracking-widest">
          THE METAVERSE PROTO • AN EXPERIMENT IN SPATIAL OWNERSHIP VIA DOMAIN NAMES<br />
          <span className="font-mono">gotohere.com • @alan_t_wootton</span>
        </div>
      </footer>

      {/* Inline styles for the grid animation + nav underline (same as HTML version) */}
      <style>{`
        .font-display {
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: -0.025em;
        }

        .metaverse-grid {
          background-image: 
            linear-gradient(rgba(0, 240, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.07) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: grid-move 25s linear infinite;
        }

        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }

        .nav-link {
          position: relative;
          transition: color 0.2s ease;
        }
        
        .nav-link:after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          background: linear-gradient(to right, #00f0ff, #a855f7);
          transition: width 0.3s ease;
        }
        
        .nav-link:hover:after {
          width: 100%;
        }

        .glass {
          background: rgba(255,255,255, 0.04);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
};


// Copyright 2026 Alan Tracey Wootton - written by grok, modified by Alan Tracey Wootton. All rights reserved.
// See LICENSE
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

