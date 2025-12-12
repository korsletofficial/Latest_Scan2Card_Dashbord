import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { Button } from '@/components/ui/button';
import logo from '../assets/logo.svg';
import loginImg from '../assets/login.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.forgotPassword(email);

      if (response.success) {
        // Navigate to OTP verification with state
        navigate('/verify-forgot-password', {
          state: {
            userId: response.data.userId,
            email: response.data.email || email,
            sentVia: response.data.sentVia || 'email',
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side: Forgot Password form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logo} alt="Scan2Card logo" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a code to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#854AE6] hover:bg-[#9D6BF0] text-white font-semibold py-3 px-4 rounded-lg disabled:bg-[#D1B5FF] disabled:cursor-not-allowed"
            >
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/login')}
              className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Back to Login
            </Button>
          </form>
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:flex w-1/2 bg-[#854AE6] items-center justify-center p-12">
        <img src={loginImg} alt="Forgot password illustration" className="max-w-full h-auto" />
      </div>
    </div>
  );
};

export default ForgotPassword;
