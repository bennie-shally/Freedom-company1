/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="py-8 px-6 text-center border-t border-white/5 opacity-50 bg-[#0A0A0A]">
      <p className="text-xs text-gray-500 mb-2">Freedom Company © 2024</p>
      <button 
        onClick={() => navigate('/admin/login')}
        className="text-[10px] text-gray-700 hover:text-gray-600 transition-colors cursor-default"
      >
        2024 reserved
      </button>
    </footer>
  );
};
