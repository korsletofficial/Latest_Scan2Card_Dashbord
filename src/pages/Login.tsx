import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { setToken, setUser, setRefreshToken } from '../utils/auth';
import { Button } from '@/components/ui/button';
import logo from '../assets/logo.svg';
import loginImg from '../assets/login.png';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend API
      const response = await authAPI.login({ email, password });
      
      // Check if 2FA is required
      if (response.data.requires2FA) {
        navigate('/verify-otp', {
          state: {
            userId: response.data.userId,
            email: response.data.email,
          },
        });
        return;
      }

      // Normal login flow (2FA disabled)
      setToken(response.data.token);
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
      }
      setUser(response.data.user);

      // Redirect based on role
      switch (response.data.user.role) {
        case 'SUPERADMIN':
          navigate('/super-admin/dashboard');
          break;
        case 'EXHIBITOR':
          navigate('/exhibitor/dashboard');
          break;
        case 'TEAMMANAGER':
          navigate('/manager/dashboard');
          break;
        case 'ENDUSER':
          navigate('/enduser/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logo} alt="Scan2Card logo" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Scan2Card</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#854AE6] focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#854AE6] focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-[#854AE6] hover:text-[#9D6BF0] font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#854AE6] hover:bg-[#9D6BF0] text-white font-semibold py-3 px-4 rounded-lg disabled:bg-[#D1B5FF] disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:flex w-1/2 bg-[#854AE6] items-center justify-center p-12">
        <img src={loginImg} alt="Login illustration" className="max-w-full h-auto" />
      </div>
    </div>
  );
};

export default Login;
