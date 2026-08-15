import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { 
  ArrowLeft, HelpCircle, Phone, MessageSquare, Mail, ChevronDown, 
  ChevronRight, Send, Clock, Truck, RefreshCw, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

interface FAQItem {
  question: string;
  answer: string;
  category: 'delivery' | 'payments' | 'orders' | 'returns';
}

const FAQS: FAQItem[] = [
  {
    category: 'delivery',
    question: 'How fast is SuperMarket delivery?',
    answer: 'We offer express delivery within 10 to 15 minutes in supported service zones! Orders placed outside express hours are delivered in under 45 minutes.',
  },
  {
    category: 'delivery',
    question: 'What are the delivery charges?',
    answer: 'Delivery is completely FREE for all orders above ₹499. For orders below ₹499, a nominal delivery fee of ₹25 applies.',
  },
  {
    category: 'payments',
    question: 'What payment options are accepted?',
    answer: 'We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking, and Cash on Delivery (COD).',
  },
  {
    category: 'payments',
    question: 'How long do refunds take for failed transactions?',
    answer: 'If money was debited for a failed transaction, Razorpay automatically initiates an instant refund. It will reflect in your bank account within 2 to 4 business days.',
  },
  {
    category: 'returns',
    question: 'What is the doorstep return policy?',
    answer: 'If you receive damaged, expired, or incorrect products, you can request an instant doorstep exchange or return at the time of delivery.',
  },
  {
    category: 'orders',
    question: 'Can I cancel or modify my order after placing it?',
    answer: 'Orders can be cancelled within 2 minutes of placing them directly from the Order Detail screen in your account.',
  },
];

export default function HelpSupportScreen() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = FAQS.filter(
    (faq) => activeCategory === 'all' || faq.category === activeCategory
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter a subject and message.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubject('');
      setMessage('');
      toast.success('Support ticket submitted successfully! Our team will contact you within 15 minutes.');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-12">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Help & Support</h1>
      </div>

      {/* Desktop Breadcrumbs */}
      <div className="hidden lg:block bg-white border-b border-gray-200 py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/home" className="hover:text-orange-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/account" className="hover:text-orange-600 transition-colors">Account</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">Help & Support</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Customer Support & FAQs</h1>
            <p className="text-xs text-gray-500 mt-0.5">We're here 24/7 to assist you with orders, deliveries, and payments</p>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <a
            href="tel:18007873762"
            className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Toll-Free Call</p>
              <p className="text-sm font-black text-gray-900 mt-0.5">1800-SUPER-MARKET</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Available 24x7</p>
            </div>
          </a>

          <a
            href="https://wa.me/919999999999?text=Hi%20SuperMarket%20Support"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">WhatsApp Chat</p>
              <p className="text-sm font-black text-gray-900 mt-0.5">+91 99999 99999</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Instant Reply</p>
            </div>
          </a>

          <a
            href="mailto:support@supermarketapp.com"
            className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Email Support</p>
              <p className="text-sm font-black text-gray-900 mt-0.5">support@supermarket.com</p>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Response in 15 mins</p>
            </div>
          </a>
        </div>

        {/* Support Guarantees */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60 text-center">
          <div className="space-y-1">
            <Clock className="w-5 h-5 text-orange-500 mx-auto" />
            <p className="text-xs font-bold text-gray-900">10-15 Min Delivery</p>
          </div>
          <div className="space-y-1">
            <ShieldCheck className="w-5 h-5 text-orange-500 mx-auto" />
            <p className="text-xs font-bold text-gray-900">Quality Checked</p>
          </div>
          <div className="space-y-1">
            <RefreshCw className="w-5 h-5 text-orange-500 mx-auto" />
            <p className="text-xs font-bold text-gray-900">Doorstep Return</p>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-gray-100 scrollbar-none">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'delivery', label: 'Delivery' },
              { id: 'payments', label: 'Payments & Refunds' },
              { id: 'returns', label: 'Returns' },
              { id: 'orders', label: 'Orders' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  activeCategory === tab.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="border border-gray-200/80 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left font-bold text-xs lg:text-sm text-gray-900 bg-gray-50/50 hover:bg-gray-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form / Ticket Submission */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-1">Send Support Query</h2>
          <p className="text-xs text-gray-500 mb-4">Have an inquiry or issue? Submit a ticket and our customer care representative will reach out immediately.</p>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Query regarding Order #ORD-123"
                className="bg-gray-50 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Message / Issue Details</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your query or issue in detail..."
                className="bg-gray-50 rounded-xl text-xs min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Ticket...' : 'Submit Support Ticket'}</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
