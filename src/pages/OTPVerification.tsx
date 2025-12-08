import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import authApi from '../api/auth.api';
import { setToken, setUser, setRefreshToken } from '../utils/auth';
import logo from '../assets/logo.svg';
import loginImg from '../assets/login.png';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  const { userId, email } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [userId, email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await authApi.verifyOTP(userId, otpValue);

      if (response.success && response.data) {
        setToken(response.data.token);
        if (response.data.refreshToken) {
          setRefreshToken(response.data.refreshToken);
        }
        setUser(response.data.user);

        const role = response.data.user.role;
        switch (role) {
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
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // In production, implement resend OTP logic
    setResendTimer(60);
    setError('');
    console.log('Resend OTP for:', email);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side: OTP form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <img src={logo} alt="Scan2Card logo" className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h1>
              <p className="text-gray-600">
                We've sent a 6-digit code to<br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#854AE6] focus:ring-2 focus:ring-[#854AE6] focus:ring-opacity-20 outline-none transition-all"
                    disabled={loading}
                  />
                ))}
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={loading || otp.join('').length !== 6}
                className="disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend OTP in <span className="font-medium text-[#854AE6]">{resendTimer}s</span>
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    className="text-sm text-[#854AE6] hover:text-[#9D6BF0] font-medium px-0 h-auto"
                  >
                    Resend OTP
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Back to Login
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:flex w-1/2 bg-[#854AE6] items-center justify-center p-12">
        <img src={loginImg} alt="OTP illustration" className="max-w-full h-auto" />
      </div>
    </div>
  );
};

export default OTPVerification;
