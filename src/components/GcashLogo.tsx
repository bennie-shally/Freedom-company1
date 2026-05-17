/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const GcashLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-1.5 ${className}`}>
    <div className="relative w-7 h-7 flex items-center justify-center">
      <div className="absolute inset-0 bg-blue-600 rounded-lg rotate-12 group-hover:rotate-0 transition-transform duration-500" />
      <div className="absolute inset-0 bg-blue-500 rounded-lg -rotate-12 group-hover:rotate-0 transition-transform duration-500 opacity-50" />
      <div className="relative z-10 font-black text-white italic text-[14px] tracking-tight">G</div>
    </div>
    <div className="flex flex-col">
      <span className="text-[12px] font-black text-white tracking-widest leading-none italic uppercase">Cash</span>
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-transparent mt-0.5" />
    </div>
  </div>
);
