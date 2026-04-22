import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-6 px-8 border-t border-slate-200 bg-white text-slate-500 text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
      <p>© {new Date().getFullYear()} KPLIAN. All rights reserved.</p>
      <div className="flex items-center gap-6">
        <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
      </div>
    </footer>
  );
};
