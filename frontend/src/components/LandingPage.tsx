import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  ChartBarIcon,
  CheckIcon,
  PlayIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { contactAPI } from '../services/api';

const LandingPage: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI extracts key information, identifies risks, and summarizes legal documents in seconds.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Risk Assessment',
      description: 'Automatically detect potential legal risks and flag concerning language in contracts.'
    },
    {
      icon: ClockIcon,
      title: 'Time Savings',
      description: 'Reduce document review time by 80% with intelligent automation and smart summaries.'
    },
    {
      icon: ChartBarIcon,
      title: 'Comprehensive Reports',
      description: 'Get detailed analysis including parties, deadlines, financial terms, and obligations.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for individual lawyers and small firms',
      features: [
        '5 documents per month',
        'Basic AI analysis',
        'Document summaries',
        'Email support'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$4.99',
      period: '/month',
      description: 'For growing law firms and legal departments',
      features: [
        'Unlimited documents',
        'Advanced AI analysis',
        'Risk assessment',
        'Priority support',
        'API access',
        'Custom integrations'
      ],
      cta: 'Start Pro Trial',
      popular: true
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setContactStatus({ type: null, message: '' });

    try {
      const response = await contactAPI.submit(contactForm);
      setContactStatus({ type: 'success', message: response.message });
      setContactForm({ name: '', email: '', message: '' });
    } catch (err: any) {
      setContactStatus({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to send message. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" aria-hidden="true" />
              <span className="ml-2 text-xl font-bold text-gray-900">DocuMind AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 id="hero-heading" className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              AI-Powered Legal
              <span className="block text-primary-200">Document Analysis</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-primary-100 lg:text-2xl">
              Transform how you review legal documents. Our AI extracts key information, 
              identifies risks, and provides comprehensive analysis in seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Start free trial of DocuMind AI"
              >
                Start Free Trial
                <ArrowRightIcon className="inline-block ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
              <a 
                href="https://youtu.be/tBlfI4ayksE"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200 flex items-center justify-center"
                aria-label="Watch demo video"
              >
                <PlayIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="features-heading" className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Everything you need for legal document analysis
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Powerful AI tools designed specifically for legal professionals
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <article key={index} className="text-center group">
                <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-primary-600 text-white mx-auto group-hover:bg-primary-700 transition-colors duration-200 shadow-lg">
                  <feature.icon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-white" aria-labelledby="demo-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="demo-heading" className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              See DocuMind AI in Action
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Watch how our AI analyzes Apple's 200+ page 10-K report in just 2 minutes - a task that would normally take lawyers 6-10 hours to complete manually.
            </p>
          </div>
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src="https://www.youtube.com/embed/tBlfI4ayksE"
                title="DocuMind AI Demo - Apple 10-K Analysis"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                aria-label="DocuMind AI demo video showing Apple 10-K analysis"
              ></iframe>
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                <strong>Key Highlights:</strong> AI-powered risk assessment, financial analysis, legal proceedings tracking, and comprehensive executive summaries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white" aria-labelledby="pricing-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="pricing-heading" className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for your needs
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            {pricingPlans.map((plan, index) => (
              <article
                key={index}
                className={`relative rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                  plan.popular ? 'ring-2 ring-primary-600 bg-white' : 'bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 transform -translate-y-1/2">
                    <span className="inline-flex rounded-full bg-primary-600 px-4 py-1 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-lg text-gray-600">{plan.period}</span>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">{plan.description}</p>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`mt-8 w-full inline-flex justify-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                    aria-label={`Sign up for ${plan.name} plan`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="testimonials-heading" className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Trusted by legal professionals
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              See what our users are saying about DocuMind AI
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <blockquote className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                "DocuMind AI has revolutionized our contract review process. What used to take hours now takes minutes, and the risk assessment features have caught issues we might have missed."
              </p>
              <footer className="flex items-center">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SM</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">Sarah Mitchell</p>
                  <p className="text-sm text-gray-600">Senior Partner, Mitchell & Associates</p>
                </div>
              </footer>
            </blockquote>

            <blockquote className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                "The AI analysis is incredibly accurate. It's like having a senior associate review every document, but instantly. This tool pays for itself in time savings alone."
              </p>
              <footer className="flex items-center">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">DJ</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">David Johnson</p>
                  <p className="text-sm text-gray-600">General Counsel, TechCorp Inc.</p>
                </div>
              </footer>
            </blockquote>

            <blockquote className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                "As a solo practitioner, I can't afford to miss anything in my document reviews. DocuMind AI gives me the confidence that I'm catching all the important details."
              </p>
              <footer className="flex items-center">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">LW</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">Lisa Wang</p>
                  <p className="text-sm text-gray-600">Solo Practitioner, Wang Law</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gray-50" aria-labelledby="contact-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="contact-heading" className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Get in touch
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </div>
          <div className="mt-12 max-w-lg mx-auto">
            {contactStatus.type && (
              <div className={`mb-6 p-4 rounded-lg ${
                contactStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`} role="alert">
                {contactStatus.message}
              </div>
            )}
            
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  required
                  disabled={submitting}
                  aria-describedby="name-error"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  required
                  disabled={submitting}
                  aria-describedby="email-error"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  required
                  disabled={submitting}
                  aria-describedby="message-error"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  aria-label={submitting ? 'Sending message...' : 'Send message'}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800" role="contentinfo">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <DocumentTextIcon className="h-8 w-8 text-white mx-auto" aria-hidden="true" />
            <p className="mt-4 text-gray-400">
              © 2025 DocuMind AI. All rights reserved.
            </p>
            <nav className="mt-6 flex justify-center space-x-6" aria-label="Footer navigation">
              <button 
                onClick={() => window.scrollTo(0, 0)}
                className="text-gray-400 hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => window.scrollTo(0, 0)}
                className="text-gray-400 hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >
                Terms of Service
              </button>
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 