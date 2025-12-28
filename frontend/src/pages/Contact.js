import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [contactSettings, setContactSettings] = useState({
    phone: '+998 (98) 177 36 33',
    email: 'reklamasavdo4@gmail.com',
    address: 'Andijan, Uzbekistan',
    working_hours_weekday: 'Monday - Saturday: 9:00 AM - 7:00 PM',
    working_hours_weekend: 'Sunday: 11:00 AM - 6:00 PM',
    map_lat: 40.7877600,
    map_lng: 72.3417839,
  });

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings/contact`);
      setContactSettings(response.data);
    } catch (error) {
      console.error('Error fetching contact settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success(t('success') + '! ' + 'We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error(t('error') + '. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const position = [contactSettings.map_lat, contactSettings.map_lng];

  return (
    <main className="pt-20 min-h-screen" data-testid="contact-page">
      {/* Header */}
      <section className="py-16 border-b border-[#2E5E99]/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <span className="text-[#00F0FF] text-sm uppercase tracking-widest mb-2 block">{t('contact_title')}</span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-[#E7F0FA] mb-6">
            {t('contact_title')} <span className="text-[#00F0FF]">{t('contact_title_accent')}</span>
          </h1>
          <p className="text-[#7BA4D0] text-lg max-w-2xl">
            {t('contact_subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-[#132D4E] border border-white/5 p-8 md:p-12">
              <h2 className="font-heading font-bold text-2xl text-[#E7F0FA] mb-6">{t('contact_send')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#E7F0FA]">{t('contact_name')} *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                    placeholder={t('contact_name')}
                    data-testid="contact-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#E7F0FA]">{t('contact_email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                    placeholder="your@email.com"
                    data-testid="contact-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#E7F0FA]">{t('contact_phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                    placeholder="+998 XX XXX XX XX"
                    data-testid="contact-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[#E7F0FA]">{t('contact_message')} *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] min-h-[150px] rounded-none focus:border-[#00F0FF] resize-none"
                    placeholder={t('contact_message')}
                    data-testid="contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none glow-hover h-12"
                  data-testid="contact-submit"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="w-5 h-5 border-2 border-[#0D2440] border-t-transparent rounded-full animate-spin mr-2"></span>
                      {t('loading')}
                    </span>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('contact_submit')}
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading font-bold text-2xl text-[#E7F0FA] mb-6">{t('contact_info')}</h2>
                <p className="text-[#7BA4D0] leading-relaxed">
                  {t('contact_info_desc')}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-6 bg-[#132D4E] border border-white/5 hover:border-[#00F0FF]/30 transition-colors">
                  <div className="w-12 h-12 bg-[#00F0FF]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-[#00F0FF]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#E7F0FA] mb-1">{t('contact_email')}</h3>
                    <p className="text-[#7BA4D0]">{contactSettings.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-[#132D4E] border border-white/5 hover:border-[#00F0FF]/30 transition-colors">
                  <div className="w-12 h-12 bg-[#00F0FF]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-[#00F0FF]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#E7F0FA] mb-1">{t('contact_phone')}</h3>
                    <p className="text-[#7BA4D0]">{contactSettings.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-[#132D4E] border border-white/5 hover:border-[#00F0FF]/30 transition-colors">
                  <div className="w-12 h-12 bg-[#00F0FF]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-[#00F0FF]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#E7F0FA] mb-1">{t('contact_location')}</h3>
                    <p className="text-[#7BA4D0]">{contactSettings.address}</p>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="p-6 bg-[#132D4E] border border-white/5">
                <h3 className="font-heading font-bold text-[#E7F0FA] mb-4">{t('contact_hours')}</h3>
                <div className="space-y-2 text-[#7BA4D0]">
                  <p>{contactSettings.working_hours_weekday}</p>
                  <p>{contactSettings.working_hours_weekend}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <h2 className="font-heading font-bold text-2xl text-[#E7F0FA] mb-6">{t('contact_location')}</h2>
            <div className="h-[400px] border border-white/5 overflow-hidden">
              <MapContainer 
                center={position} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>
                    <div className="text-center">
                      <strong>REKLAMA SAVDO</strong><br />
                      {contactSettings.address}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
