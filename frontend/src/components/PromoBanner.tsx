"use client";

import { motion } from 'framer-motion';

export default function PromoBanner() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-4 mb-2">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#ff5000] to-[#ff8c00] text-white p-6 shadow-md"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <span className="bg-white text-[#ff5000] text-xs font-black uppercase px-2 py-1 rounded-sm mb-2 inline-block shadow-sm tracking-wide">Flash Sale!</span>
            <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter leading-tight drop-shadow-md">LED Headlight<br />Clearance Event</h2>
            <p className="opacity-95 font-semibold text-sm mt-1.5 drop-shadow-sm">Up to 70% off selected items. Limited time only!</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button className="bg-[#111] hover:bg-black text-white px-6 py-2.5 rounded-full font-bold shadow-xl transition-transform hover:scale-105 active:scale-95 text-sm uppercase tracking-wide">
              Shop Now &gt;
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
