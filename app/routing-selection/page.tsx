'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lightbulb, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } }
};

interface SelectionCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tag: string;
  tagColor: string;
}

function SelectionCard({ href, title, description, icon, color, tag, tagColor }: SelectionCardProps) {
  return (
    <motion.div variants={item} className="h-full">
      <Link 
        href={href}
        className={`group relative flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-[0.98] ${color}`}
      >
        {/* Decorative background element */}
        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${tagColor}`} />
        
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:shadow-md ${tagColor} text-white`}>
            {icon}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${tagColor.replace('bg-', 'border-').replace('text-', 'bg-')}/10 ${tagColor.replace('bg-', 'text-')}`}>
            {tag}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-navy dark:text-white mb-3 group-hover:text-slate-900 dark:group-hover:text-teal-light transition-colors">
          {title}
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
          {description}
        </p>

        <div className="flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all duration-300">
           <span>Start process</span>
           <ArrowRight className="w-4 h-4" />
        </div>

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full w-0 ${tagColor}`} />
      </Link>
    </motion.div>
  );
}

export default function RoutingSelectionPage() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-navy dark:text-white tracking-tight">
          How can we help you today?
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Choose the pathway that best fits your initiative's current stage and technology.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <SelectionCard 
          href="/it-pipeline"
          tag="Discovery"
          title="Early Engagement"
          description="I have a concept or early-stage general IT initiative that needs development, scope definition, or IT Business Partner support."
          icon={<Lightbulb className="w-7 h-7" />}
          color="hover:border-purple-400 group-hover:bg-purple-50/30 dark:group-hover:bg-purple-900/10"
          tagColor="bg-purple-600"
        />

        <SelectionCard 
          href="/aidex"
          tag="Specialist"
          title="AI Proposal"
          description="I am proposing a tool or system that involves Artificial Intelligence, Machine Learning, or Generative AI at any stage of maturity."
          icon={<Cpu className="w-7 h-7" />}
          color="hover:border-teal-400 group-hover:bg-teal-50/30 dark:group-hover:bg-teal-900/10"
          tagColor="bg-teal"
        />

        <SelectionCard 
          href="/onebridge"
          tag="Standard"
          title="Mature Initiative"
          description="I have a business case, an executive sponsor, and a PID ready. I am seeking formal Global Transformation or ELT review."
          icon={<CheckCircle2 className="w-7 h-7" />}
          color="hover:border-blue-400 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10"
          tagColor="bg-blue-600"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 text-center"
      >
        <Link 
          href="/"
          className="text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors"
        >
          ← Back to home
        </Link>
      </motion.div>
    </div>
  );
}
