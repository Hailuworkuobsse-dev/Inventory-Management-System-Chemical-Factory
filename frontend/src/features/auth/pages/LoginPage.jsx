import { Link } from 'react-router-dom';
import { AlertCircle, Home, Lock } from 'lucide-react';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Welcome to AIMS
            </h1>
            <p className="text-blue-100 text-center mt-2 text-sm">
              Advanced Inventory Management System
            </p>
          </div>

          {/* Login Form Container */}
          <div className="px-8 py-6">
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-500 flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-500"
              >
                Need Help?
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
