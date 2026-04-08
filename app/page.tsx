'use client';

import Link from 'next/link';
import { Rocket, Search, Bell, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden bg-mesh-gradient text-white py-24 md:py-32 px-4 flex flex-col items-center z-0">
         <div className="absolute inset-0 bg-navy/60 dark:bg-slate-900/80 z-0"></div>
         <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: "easeOut" }}
           className="z-10 text-center max-w-4xl"
         >
           <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 drop-shadow-md">
             AI Front Door
           </h1>
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5, duration: 0.8 }}
             className="text-xl md:text-2xl text-teal-light font-medium tracking-wide drop-shadow-sm mb-6 max-w-2xl mx-auto"
           >
             Your guided route to responsible AI
           </motion.p>
           <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.7, duration: 0.8 }}
             className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed"
           >
             Answer a few questions about your AI use case and we'll tell you the approval pathway, who needs to be involved, and what evidence you'll need.
           </motion.p>
         </motion.div>
      </section>

      {/* Entry Cards */}
      <section className="w-full max-w-6xl mx-auto px-4 -mt-12 z-10 mb-20 relative space-y-6">
        
        {/* Featured Card - OneBridge */}
        <motion.div variants={item} initial="hidden" animate="show" className="w-full" transition={{ delay: 0.1 }}>
            <Link 
              href="/onebridge" 
              className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/50 p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:border-blue-500 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-[0.98]"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                 <ArrowRightLeft className="w-10 h-10" aria-hidden="true" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white mb-2">Step 1: OneBridge Classification</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl">Required first step for all Transformation and AI Initiatives. Answer a few questions to find your execution route, and automatically map your operational characteristics into the AI Assessment.</p>
              </div>
              <div className="hidden md:flex shrink-0 items-center justify-center">
                 <div className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md group-hover:bg-blue-600 transition-colors">Start routing →</div>
              </div>
            </Link>
        </motion.div>

        {/* Secondary Cards */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <motion.div variants={item} className="h-full">
            <Link 
              href="/assess" 
              className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-b-4 hover:border-b-teal hover:border-x-teal/50 hover:border-t-teal/50 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-95"
            >
              <div className="w-14 h-14 rounded-full bg-teal-light/20 flex items-center justify-center text-teal mb-6 group-hover:scale-110 group-hover:bg-teal group-hover:text-white transition-all duration-300">
                 <Rocket className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-navy dark:text-white mb-3">AI Proposal Assessment</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-grow">Classify your AI use case risk and find your required evidence checklist.</p>
            </Link>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={item} className="h-full">
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm opacity-80 cursor-not-allowed relative overflow-hidden transition-all duration-300">
              <div className="absolute top-4 right-4 bg-navy text-white text-xs font-bold px-3 py-1 rounded shadow-sm">Coming Soon</div>
              <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-6 grayscale">
                 <Search className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-3">Active Projects</h2>
              <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed flex-grow">Search the AI Registry to see what projects are underway.</p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={item} className="h-full">
            <Link 
              href="/assess?entry=report-concern" 
              className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-b-4 hover:border-b-amber-500 hover:border-x-amber-500/50 hover:border-t-amber-500/50 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-95"
            >
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                 <Bell className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-navy dark:text-white mb-3">Report a Concern</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-grow">Flag an issue, incident, or governance concern regarding an active AI deployment.</p>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="w-full max-w-5xl mx-auto px-4 mb-24 print:hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-navy dark:text-white mb-12">How It Works</h3>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-[28px] left-20 right-20 h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-700 z-0" aria-hidden="true" />
            
            <div className="relative z-10 flex flex-row md:flex-col items-center gap-6 md:gap-4 w-full md:w-1/3 text-left md:text-center group">
              <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">1</div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Answer</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Tell us about your AI use case in plain language through a short interactive assessment.</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-row md:flex-col items-center gap-6 md:gap-4 w-full md:w-1/3 text-left md:text-center group">
              <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">2</div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Classify</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">We automatically assess the risk tier and map the exact governance pathway you need.</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-row md:flex-col items-center gap-6 md:gap-4 w-full md:w-1/3 text-left md:text-center group">
              <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">3</div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Route</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Download your custom evidence checklist and engage with the required specialists.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
