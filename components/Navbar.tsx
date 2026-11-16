'use client';

import React from 'react';
import AppNavbar from './AppNavbar';

interface NavbarProps {
  showAuth?: boolean;
}

/**
 * Kept so existing imports keep working. Signed-in screens all use AppNavbar
 * now (the public landing page has its own header).
 */
const Navbar: React.FC<NavbarProps> = () => <AppNavbar />;

export default Navbar;
