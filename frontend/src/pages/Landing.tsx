
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ArrowRight, CheckCircle, CreditCard, Send, Smartphone } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-falsopay-primary">
            FalsoPay
          </Link>
          
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-falsopay-dark mb-6">
              Fast, Secure Payments <span className="text-falsopay-primary">Anytime, Anywhere</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Send and receive money instantly with FalsoPay, the most trusted digital payment platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-falsopay-primary hover:bg-falsopay-primary/90 text-white">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Log in to Your Account
                </Button>
              </Link>
            </div>
          </div>
          
          {/* App Preview */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="bg-falsopay-primary rounded-xl overflow-hidden shadow-2xl p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Experience FalsoPay</h2>
              <p className="mb-8">Fast, secure, and easy-to-use financial transactions</p>
              <div className="h-80 bg-falsopay-secondary/40 rounded-lg flex items-center justify-center">
                <p className="text-xl font-medium">App Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose FalsoPay?</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-falsopay-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-falsopay-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-falsopay-dark">Instant Transfers</h3>
              <p className="text-gray-600">Send money to anyone, anywhere, instantly with zero fees between FalsoPay users.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-falsopay-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-falsopay-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-falsopay-dark">Mobile First</h3>
              <p className="text-gray-600">Our app is designed for the modern user with intuitive mobile-friendly experience.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-falsopay-light rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-falsopay-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-falsopay-dark">Secure Payments</h3>
              <p className="text-gray-600">Advanced security features to keep your financial data and transactions safe.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-falsopay-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience the future of payments?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Join thousands of users who trust FalsoPay for their daily transactions.</p>
          <Link to="/register">
            <Button size="lg" className="bg-falsopay-accent hover:bg-falsopay-accent/90">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Trust Points */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Trusted by Users Everywhere</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              'Fast and secure transactions',
              'No hidden fees',
              'Real-time notifications',
              'Bank-level security',
              '24/7 customer support'
            ].map((point, index) => (
              <div key={index} className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-falsopay-success mr-4" />
                <span className="text-lg">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-falsopay-dark text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">FalsoPay</h2>
              <p className="text-white/60 mt-2">© {new Date().getFullYear()} FalsoPay. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-8">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2 text-white/60">
                  <li><a href="#" className="hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">API</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Resources</h3>
                <ul className="space-y-2 text-white/60">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2 text-white/60">
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                  <li><a href="#" className="hover:text-white">Terms</a></li>
                  <li><a href="#" className="hover:text-white">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
