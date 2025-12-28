import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Target, Award, Lightbulb } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const defaultValues = [
  { icon: 'Target', title: 'Quality First', description: 'We use only premium materials to ensure your advertising stands out.' },
  { icon: 'Users', title: 'Customer Focus', description: 'Your success is our priority. We work closely with you to meet your needs.' },
  { icon: 'Award', title: 'Excellence', description: 'We strive for excellence in every project we undertake.' },
  { icon: 'Lightbulb', title: 'Innovation', description: 'We embrace new technologies and methods to deliver cutting-edge solutions.' },
];

const iconMap = { Target, Users, Award, Lightbulb };

export default function About() {
  const { t } = useLanguage();
  const [aboutContent, setAboutContent] = useState({
    hero_title: 'REKLAMA SAVDO',
    hero_subtitle: 'We are a leading provider of advertising signage and digital printing materials.',
    story_title: 'Building Brands Since Day One',
    story_content: 'REKLAMA SAVDO was founded with a simple mission: to help businesses stand out in an increasingly competitive marketplace through high-quality advertising materials.\n\nOur team of experts combines years of experience with cutting-edge technology to deliver exceptional signage and printing solutions. From small businesses to large corporations, we have helped countless clients achieve their branding goals.\n\nToday, we continue to push boundaries and innovate, ensuring our clients always have access to the latest and best in advertising materials.',
    mission: 'To deliver exceptional advertising solutions that make brands shine.',
    vision: 'To be the most trusted partner for businesses seeking quality signage.',
    values: defaultValues,
  });

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const response = await axios.get(`${API}/settings/about`);
      if (response.data) {
        setAboutContent(prev => ({
          ...prev,
          ...response.data,
          values: response.data.values?.length > 0 ? response.data.values : defaultValues
        }));
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
    }
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Target;
    return IconComponent;
  };

  return (
    <main className="pt-20 min-h-screen" data-testid="about-page">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-pattern"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1758873269317-51888e824b28?crop=entropy&cs=srgb&fm=jpg&q=85)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D2440] via-transparent to-[#0D2440]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <span className="text-[#00F0FF] text-sm uppercase tracking-widest mb-2 block">{t('about_title')}</span>
          <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl text-[#E7F0FA] mb-6">
            {aboutContent.hero_title}
          </h1>
          <p className="text-[#7BA4D0] text-lg md:text-xl leading-relaxed max-w-2xl">
            {aboutContent.hero_subtitle}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 border-y border-[#2E5E99]/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#00F0FF] text-sm uppercase tracking-widest mb-4 block">{t('about_story')}</span>
              <h2 className="font-heading font-black text-3xl md:text-4xl text-[#E7F0FA] mb-6">
                {aboutContent.story_title}
              </h2>
              <div className="space-y-4 text-[#7BA4D0] leading-relaxed">
                {aboutContent.story_content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {/* Mission & Vision */}
              {(aboutContent.mission || aboutContent.vision) && (
                <div className="mt-8 space-y-4">
                  {aboutContent.mission && (
                    <div className="p-4 bg-[#132D4E] border-l-4 border-[#00F0FF]">
                      <h4 className="font-heading font-bold text-[#E7F0FA] mb-2">Mission</h4>
                      <p className="text-[#7BA4D0]">{aboutContent.mission}</p>
                    </div>
                  )}
                  {aboutContent.vision && (
                    <div className="p-4 bg-[#132D4E] border-l-4 border-[#2E5E99]">
                      <h4 className="font-heading font-bold text-[#E7F0FA] mb-2">Vision</h4>
                      <p className="text-[#7BA4D0]">{aboutContent.vision}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <div className="aspect-square bg-[#132D4E] border border-white/5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1729944950511-e9c71556cfd4?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Printing equipment"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#00F0FF]/10 border border-[#00F0FF]/30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-[#00F0FF] text-sm uppercase tracking-widest mb-2 block">What Drives Us</span>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-[#E7F0FA]">
              {t('about_values')} <span className="text-[#00F0FF]">{t('about_values_accent')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutContent.values.map((value, index) => {
              const IconComponent = getIcon(value.icon);
              return (
                <div 
                  key={index}
                  className="group p-8 bg-[#132D4E] border border-white/5 hover:border-[#00F0FF]/30 transition-all duration-300 text-center"
                >
                  <div className="w-16 h-16 bg-[#00F0FF]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#00F0FF]/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-[#00F0FF]" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#E7F0FA] mb-3">{value.title}</h3>
                  <p className="text-[#7BA4D0] text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[#0A1B30]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: t('about_stats_clients') },
              { value: '1000+', label: t('about_stats_projects') },
              { value: '10+', label: t('about_stats_experience') },
              { value: '50+', label: t('about_stats_products') },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading font-black text-4xl md:text-5xl text-[#00F0FF] mb-2">
                  {stat.value}
                </div>
                <div className="text-[#7BA4D0] uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
