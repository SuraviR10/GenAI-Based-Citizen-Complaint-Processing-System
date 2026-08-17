import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ConfigWarningBanner } from '../common/ConfigWarningBanner';

export interface CitizenLayoutProps {
  children: ReactNode;
}

export const CitizenLayout: React.FC<CitizenLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ConfigWarningBanner />
      <Navbar />
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
