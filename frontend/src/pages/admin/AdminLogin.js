import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { LogIn, UserPlus } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [canRegister, setCanRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingRegister, setCheckingRegister] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  useEffect(() => {
    checkCanRegister();
  }, []);

  const checkCanRegister = async () => {
    try {
      const response = await axios.get(`${API}/auth/can-register`);
      setCanRegister(response.data.can_register);
      // Auto-switch to register mode if no admin exists
      if (response.data.can_register) {
        setIsRegister(true);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    } finally {
      setCheckingRegister(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent registration if not allowed
    if (isRegister && !canRegister) {
      toast.error('Registration is disabled. Admin already exists.');
      return;
    }
    
    setLoading(true);

    try {
      if (isRegister) {
        await register(formData.email, formData.password, formData.name);
        toast.success('Admin account created successfully!');
      } else {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      }
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D2440] flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="font-heading font-black text-2xl text-[#E7F0FA]">
              REKLAMA <span className="text-[#00F0FF]">SAVDO</span>
            </h1>
          </Link>
          <p className="text-[#7BA4D0] mt-2 uppercase tracking-wider text-sm">Admin Panel</p>
        </div>

        {checkingRegister ? (
          <div className="bg-[#132D4E] border border-white/5 p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
        <div className="bg-[#132D4E] border border-white/5 p-8">
          <h2 className="font-heading font-bold text-xl text-[#E7F0FA] mb-6 text-center">
            {isRegister && canRegister ? 'Create Admin Account' : 'Admin Login'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && canRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#E7F0FA]">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={isRegister}
                  className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                  placeholder="Admin Name"
                  data-testid="admin-name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#E7F0FA]">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                placeholder="admin@example.com"
                data-testid="admin-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#E7F0FA]">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                placeholder="••••••••"
                data-testid="admin-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || (isRegister && !canRegister)}
              className="w-full bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none h-12 disabled:opacity-50"
              data-testid="admin-submit"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-[#0D2440] border-t-transparent rounded-full animate-spin mr-2"></span>
                  {isRegister ? 'Creating...' : 'Signing in...'}
                </span>
              ) : (
                <>
                  {isRegister && canRegister ? <UserPlus className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
                  {isRegister && canRegister ? 'Create Account' : 'Sign In'}
                </>
              )}
            </Button>
          </form>

          {/* Only show toggle if registration is allowed */}
          {canRegister && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#7BA4D0] hover:text-[#00F0FF] text-sm transition-colors"
              >
                {isRegister ? 'Already have an account? Sign in' : "First time? Create admin account"}
              </button>
            </div>
          )}
          
          {/* Show message if admin exists and user tries to access register */}
          {!canRegister && !checkingRegister && (
            <div className="mt-6 text-center">
              <p className="text-[#7BA4D0] text-sm">
                Admin account exists. Contact your administrator if you need access.
              </p>
            </div>
          )}
        </div>
        )}

        <div className="text-center mt-6">
          <Link to="/" className="text-[#7BA4D0] hover:text-[#00F0FF] text-sm transition-colors">
            ← Back to Store
          </Link>
        </div>
      </div>
    </main>
  );
}
