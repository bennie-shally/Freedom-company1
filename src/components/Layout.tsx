/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  const location = useLocation();
  const hideNav = ['/login', '/register', '/admin/login', '/landing'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="blob-blue -top-20 -right-20 opacity-40" />
      <div className="blob-emerald top-1/2 -left-20 opacity-30" />
      <div className="blob-blue -bottom-20 right-1/4 opacity-20" />

      {!hideNav && !isAdminPage && <TopNav />}
      
      <main className={`flex-1 relative z-10 ${!hideNav && !isAdminPage ? 'pt-20 pb-24' : ''}`}>
        <Outlet />
      </main>

      {!hideNav && !isAdminPage && <BottomNav />}
      {!hideNav && !isAdminPage && <Footer />}
    </div>
  );
};
