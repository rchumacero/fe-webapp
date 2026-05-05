"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@kplian/i18n';
import {
  ArrowLeft,
  Fingerprint,
  Briefcase,
  CreditCard,
  MessageSquare,
  Building2,
  Image as ImageIcon,
  Phone,
  User,
  RefreshCcw,
  Plus,
  Search,
  Edit2,
  Trash2,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { IdentificationListPage } from '@/modules/crm/personal-data/identification/presentation/pages/IdentificationListPage';
import { PersonSkillListPage } from '@/modules/crm/personal-data/person-skill/presentation/pages/PersonSkillListPage';
import { PaymentMethodListPage } from '@/modules/crm/personal-data/payment-method/presentation/pages/PaymentMethodListPage';
import { CommunicationChannelListPage } from '@/modules/crm/personal-data/communication-channel/presentation/pages/CommunicationChannelListPage';
import { EconomicActivityListPage } from '@/modules/crm/personal-data/economic-activity/presentation/pages/EconomicActivityListPage';
import { PersonDigitalContentListPage } from '@/modules/crm/personal-data/person-digital-content/presentation/pages/PersonDigitalContentListPage';
import { ContactListPage } from '@/modules/crm/personal-data/contact/presentation/pages/ContactListPage';
import { WorkExperienceListPage } from '@/modules/crm/personal-data/work-experience/presentation/pages/WorkExperienceListPage';
import Link from 'next/link';
import { PERSON_ROUTES } from '../../routes/person-routes';
import { cn } from '@/lib/utils';
import { IDENTIFICATION_CONSTANTS } from '../../../identification/constants/identification-constants';
import { PERSON_SKILL_CONSTANTS } from '../../../person-skill/constants/person-skill-constants';
import { PAYMENT_METHOD_CONSTANTS } from '../../../payment-method/constants/payment-method-constants';
import { COMMUNICATION_CHANNEL_CONSTANTS } from '../../../communication-channel/constants/communication-channel-constants';
import { ECONOMIC_ACTIVITY_CONSTANTS } from '../../../economic-activity/constants/economic-activity-constants';
import { PERSON_DIGITAL_CONTENT_CONSTANTS } from '../../../person-digital-content/constants/person-digital-content-constants';
import { CONTACT_CONSTANTS } from '../../../contact/constants/contact-constants';
import { WORK_EXPERIENCE_CONSTANTS } from '../../../work-experience/constants/work-experience-constants';

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: Section[] = [
  { id: 'identifications', label: IDENTIFICATION_CONSTANTS.LIST_TITLE, icon: <Fingerprint size={18} /> },
  { id: 'skills', label: PERSON_SKILL_CONSTANTS.LIST_TITLE, icon: <Briefcase size={18} /> },
  { id: 'payments', label: PAYMENT_METHOD_CONSTANTS.LIST_TITLE, icon: <CreditCard size={18} /> },
  { id: 'communication', label: COMMUNICATION_CHANNEL_CONSTANTS.LIST_TITLE, icon: <MessageSquare size={18} /> },
  { id: 'economic', label: ECONOMIC_ACTIVITY_CONSTANTS.LIST_TITLE, icon: <Building2 size={18} /> },
  { id: 'images', label: PERSON_DIGITAL_CONTENT_CONSTANTS.LIST_TITLE, icon: <ImageIcon size={18} /> },
  { id: 'contacts', label: CONTACT_CONSTANTS.LIST_TITLE, icon: <Phone size={18} /> },
  { id: 'work', label: WORK_EXPERIENCE_CONSTANTS.LIST_TITLE, icon: <User size={18} /> },
];

export default function PersonDetailLayout({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params);
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('identifications');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Toggle */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed top-4 left-4 z-40 lg:hidden shadow-sm transition-all duration-300",
          isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu size={20} />
      </Button>

      {/* Left Sidebar */}
      <aside className={cn(
        "border-r border-border/40 fixed h-screen overflow-hidden flex flex-col pt-6 bg-card/10 backdrop-blur-sm transition-all duration-300 z-50",
        isSidebarOpen ? "w-64 px-4 translate-x-0" : "w-64 -translate-x-full lg:w-16 lg:px-2 lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-8 px-2">
          {isSidebarOpen && (
            <Link href={PERSON_ROUTES.LIST}>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground shrink-0">
                <ArrowLeft size={16} />
                <span className="truncate">Back to List</span>
              </Button>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className={cn("shrink-0", !isSidebarOpen && "mx-auto")}
          >
            <Menu size={18} />
          </Button>
        </div>

        <nav className="space-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              title={!isSidebarOpen ? t(section.label) : undefined}
              className={cn(
                "w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-200",
                isSidebarOpen ? "px-3" : "px-0 justify-center",
                activeSection === section.id
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span className={cn(
                "transition-colors shrink-0",
                activeSection === section.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {section.icon}
              </span>
              {isSidebarOpen && <span className="truncate">{t(section.label)}</span>}
              {isSidebarOpen && section.id === 'images' && (
                <div className="ml-auto w-2 h-2 shrink-0 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 p-8 space-y-12 max-w-5xl mx-auto w-full transition-all duration-300",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-16",
        "ml-0" // Always 0 margin on mobile
      )}>
        <section id="identifications" className="scroll-mt-8">
          <IdentificationListPage personId={resolvedParams.id} />
        </section>

        {/* Skills Section */}
        <section id="skills" className="scroll-mt-8 border-t border-border/10 pt-12">
          <PersonSkillListPage personId={resolvedParams.id} />
        </section>

        {/* Payments Section */}
        <section id="payments" className="scroll-mt-8 border-t border-border/10 pt-12">
          <PaymentMethodListPage personId={resolvedParams.id} />
        </section>

        {/* Communication Section */}
        <section id="communication" className="scroll-mt-8 border-t border-border/10 pt-12">
          <CommunicationChannelListPage personId={resolvedParams.id} />
        </section>

        {/* Economic Section */}
        <section id="economic" className="scroll-mt-8 border-t border-border/10 pt-12">
          <EconomicActivityListPage personId={resolvedParams.id} />
        </section>

        {/* Images Section */}
        <section id="images" className="scroll-mt-8 border-t border-border/10 pt-12">
          <PersonDigitalContentListPage personId={resolvedParams.id} />
        </section>

        {/* Contacts Section */}
        <section id="contacts" className="scroll-mt-8 border-t border-border/10 pt-12">
          <ContactListPage personId={resolvedParams.id} />
        </section>

        {/* Work Section */}
        <section id="work" className="scroll-mt-8 border-t border-border/10 pt-12 pb-12">
          <WorkExperienceListPage personId={resolvedParams.id} />
        </section>

        <div className="h-32" /> {/* Bottom spacer for better scrolling */}
      </main>
    </div>
  );
}
