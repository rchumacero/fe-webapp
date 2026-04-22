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
  Trash2
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

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: Section[] = [
  { id: 'identifications', label: 'Identification Docum...', icon: <Fingerprint size={18} /> },
  { id: 'skills', label: 'Skills', icon: <Briefcase size={18} /> },
  { id: 'payments', label: 'Payment Method', icon: <CreditCard size={18} /> },
  { id: 'communication', label: 'Communication Chan...', icon: <MessageSquare size={18} /> },
  { id: 'economic', label: 'Economic Activities', icon: <Building2 size={18} /> },
  { id: 'images', label: 'Images & Digital Con...', icon: <ImageIcon size={18} /> },
  { id: 'contacts', label: 'Contacts', icon: <Phone size={18} /> },
  { id: 'work', label: 'Work Experience', icon: <User size={18} /> },
];

export default function PersonDetailLayout({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params);
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('identifications');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
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
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border/40 fixed h-screen overflow-hidden flex flex-col pt-6 px-4 bg-card/10 backdrop-blur-sm">
        <Link href={PERSON_ROUTES.LIST} className="mb-8 ml-2">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
            Back to List
          </Button>
        </Link>

        <nav className="space-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-200",
                activeSection === section.id
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span className={cn(
                "transition-colors",
                activeSection === section.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {section.icon}
              </span>
              <span className="truncate">{section.label}</span>
              {section.id === 'images' && (
                <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 space-y-12 max-w-5xl mx-auto w-full">
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
