import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { Save, MapPin, Phone, Mail, Clock, FileText } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminSettings() {
  const { getAuthHeader } = useAuth();
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

  const [aboutContent, setAboutContent] = useState({
    hero_title: 'REKLAMA SAVDO',
    hero_subtitle: 'We are a leading provider of advertising signage and digital printing materials.',
    story_title: 'Building Brands Since Day One',
    story_content: 'REKLAMA SAVDO was founded with a simple mission...',
    mission: 'To deliver exceptional advertising solutions that make brands shine.',
    vision: 'To be the most trusted partner for businesses seeking quality signage.',
    values: [
      { icon: 'Target', title: 'Quality First', description: 'We use only premium materials.' },
      { icon: 'Users', title: 'Customer Focus', description: 'Your success is our priority.' },
      { icon: 'Award', title: 'Excellence', description: 'We strive for excellence.' },
      { icon: 'Lightbulb', title: 'Innovation', description: 'We embrace new technologies.' },
    ]
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [contactRes, aboutRes] = await Promise.all([
        axios.get(`${API}/settings/contact`),
        axios.get(`${API}/settings/about`)
      ]);
      if (contactRes.data) setContactSettings(contactRes.data);
      if (aboutRes.data) {
        setAboutContent(prev => ({ ...prev, ...aboutRes.data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveContactSettings = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/settings/contact`, contactSettings, {
        headers: getAuthHeader()
      });
      toast.success('Contact settings saved successfully');
    } catch (error) {
      toast.error('Failed to save contact settings');
    } finally {
      setLoading(false);
    }
  };

  const saveAboutContent = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/settings/about`, aboutContent, {
        headers: getAuthHeader()
      });
      toast.success('About content saved successfully');
    } catch (error) {
      toast.error('Failed to save about content');
    } finally {
      setLoading(false);
    }
  };

  const updateValue = (index, field, value) => {
    const newValues = [...aboutContent.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setAboutContent({ ...aboutContent, values: newValues });
  };

  return (
    <div className="flex min-h-screen bg-[#0D2440]" data-testid="admin-settings">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading font-black text-3xl text-[#E7F0FA]">Settings</h1>
          <p className="text-[#7BA4D0]">Manage your website content and contact information</p>
        </div>

        <Tabs defaultValue="contact" className="space-y-6">
          <TabsList className="bg-[#132D4E] border border-white/5">
            <TabsTrigger value="contact" className="data-[state=active]:bg-[#2E5E99] data-[state=active]:text-[#E7F0FA]">
              <Phone className="h-4 w-4 mr-2" />
              Contact Info
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-[#2E5E99] data-[state=active]:text-[#E7F0FA]">
              <FileText className="h-4 w-4 mr-2" />
              About Page
            </TabsTrigger>
          </TabsList>

          {/* Contact Settings Tab */}
          <TabsContent value="contact">
            <div className="bg-[#132D4E] border border-white/5 p-8 space-y-6">
              <h2 className="font-heading font-bold text-xl text-[#E7F0FA] flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#00F0FF]" />
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#E7F0FA] flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone Number
                  </Label>
                  <Input
                    value={contactSettings.phone}
                    onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA]"
                    data-testid="settings-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E7F0FA] flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </Label>
                  <Input
                    value={contactSettings.email}
                    onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA]"
                    data-testid="settings-email"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[#E7F0FA] flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Address
                  </Label>
                  <Input
                    value={contactSettings.address}
                    onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA]"
                    data-testid="settings-address"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E7F0FA] flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Weekday Hours
                  </Label>
                  <Input
                    value={contactSettings.working_hours_weekday}
                    onChange={(e) => setContactSettings({ ...contactSettings, working_hours_weekday: e.target.value })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA]"
                    placeholder="Monday - Saturday: 9:00 AM - 7:00 PM"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E7F0FA] flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Weekend Hours
                  </Label>
                  <Input
                    value={contactSettings.working_hours_weekend}
                    onChange={(e) => setContactSettings({ ...contactSettings, working_hours_weekend: e.target.value })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA]"
                    placeholder="Sunday: 11:00 AM - 6:00 PM"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E7F0FA]">Map Latitude</Label>
                  <Input
                    type="number"
                    step="0.0000001"
                    value={contactSettings.map_lat}
                    onChange={(e) => setContactSettings({ ...contactSettings, map_lat: parseFloat(e.target.value) })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E7F0FA]">Map Longitude</Label>
                  <Input
                    type="number"
                    step="0.0000001"
                    value={contactSettings.map_lng}
                    onChange={(e) => setContactSettings({ ...contactSettings, map_lng: parseFloat(e.target.value) })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA]"
                  />
                </div>
              </div>

              <Button
                onClick={saveContactSettings}
                disabled={loading}
                className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80"
                data-testid="save-contact-settings"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Contact Settings
              </Button>
            </div>
          </TabsContent>

          {/* About Content Tab */}
          <TabsContent value="about">
            <div className="bg-[#132D4E] border border-white/5 p-8 space-y-6">
              <h2 className="font-heading font-bold text-xl text-[#E7F0FA] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#00F0FF]" />
                About Page Content
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[#E7F0FA]">Hero Title</Label>
                    <Input
                      value={aboutContent.hero_title}
                      onChange={(e) => setAboutContent({ ...aboutContent, hero_title: e.target.value })}
                      className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#E7F0FA]">Story Title</Label>
                    <Input
                      value={aboutContent.story_title}
                      onChange={(e) => setAboutContent({ ...aboutContent, story_title: e.target.value })}
                      className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E7F0FA]">Hero Subtitle</Label>
                  <Textarea
                    value={aboutContent.hero_subtitle}
                    onChange={(e) => setAboutContent({ ...aboutContent, hero_subtitle: e.target.value })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E7F0FA]">Story Content (Use double line breaks for paragraphs)</Label>
                  <Textarea
                    value={aboutContent.story_content}
                    onChange={(e) => setAboutContent({ ...aboutContent, story_content: e.target.value })}
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] min-h-[200px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[#E7F0FA]">Mission Statement</Label>
                    <Textarea
                      value={aboutContent.mission}
                      onChange={(e) => setAboutContent({ ...aboutContent, mission: e.target.value })}
                      className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#E7F0FA]">Vision Statement</Label>
                    <Textarea
                      value={aboutContent.vision}
                      onChange={(e) => setAboutContent({ ...aboutContent, vision: e.target.value })}
                      className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Values Section */}
                <div className="space-y-4">
                  <Label className="text-[#E7F0FA] text-lg">Company Values</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aboutContent.values.map((value, index) => (
                      <div key={index} className="p-4 bg-[#0A1B30] border border-[#2E5E99]/30 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={value.icon}
                            onChange={(e) => updateValue(index, 'icon', e.target.value)}
                            placeholder="Icon (Target, Users, Award, Lightbulb)"
                            className="bg-[#132D4E] border-[#2E5E99]/50 text-[#E7F0FA] flex-1"
                          />
                        </div>
                        <Input
                          value={value.title}
                          onChange={(e) => updateValue(index, 'title', e.target.value)}
                          placeholder="Title"
                          className="bg-[#132D4E] border-[#2E5E99]/50 text-[#E7F0FA]"
                        />
                        <Textarea
                          value={value.description}
                          onChange={(e) => updateValue(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="bg-[#132D4E] border-[#2E5E99]/50 text-[#E7F0FA] min-h-[60px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={saveAboutContent}
                disabled={loading}
                className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80"
                data-testid="save-about-settings"
              >
                <Save className="h-4 w-4 mr-2" />
                Save About Content
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
