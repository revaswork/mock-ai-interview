import { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Video, 
  MessageSquare, 
  BarChart3, 
  Download,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Users,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">InterviewAI</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <button onClick={onGetStarted} className="btn btn-primary">
                Get Started Free
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              <a href="#features" className="block text-gray-600">Features</a>
              <a href="#how-it-works" className="block text-gray-600">How It Works</a>
              <a href="#pricing" className="block text-gray-600">Pricing</a>
              <button onClick={onGetStarted} className="btn btn-primary w-full">
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Interview practice powered by AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Ace Your Next Interview
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              With AI Coaching
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Practice realistic interviews with an AI interviewer that adapts to your resume. 
            Get instant feedback, personalized improvement plans, and build confidence before the real thing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={onGetStarted} className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Start Practicing Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn btn-secondary text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>Free forever plan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-gray-500 mb-8">Trusted by job seekers at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <div className="text-2xl font-bold">Google</div>
            <div className="text-2xl font-bold">Microsoft</div>
            <div className="text-2xl font-bold">Amazon</div>
            <div className="text-2xl font-bold">Meta</div>
            <div className="text-2xl font-bold">Apple</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple. Fast. Effective.</h2>
            <p className="text-xl text-gray-600">Get interview-ready in 4 easy steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard 
              number="1"
              icon={<Upload />}
              title="Upload Your Resume"
              description="Drop your resume and we'll analyze your experience, skills, and background instantly."
            />
            <StepCard 
              number="2"
              icon={<Video />}
              title="Meet Your AI Interviewer"
              description="Choose from professional AI avatars who'll conduct realistic video interviews tailored to your resume."
            />
            <StepCard 
              number="3"
              icon={<MessageSquare />}
              title="Answer Questions"
              description="Respond using your voice or type your answers. The AI adapts questions based on your performance."
            />
            <StepCard 
              number="4"
              icon={<BarChart3 />}
              title="Get Instant Feedback"
              description="Receive detailed scores, personalized improvement tips, and a roadmap to level up your skills."
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600">Built for job seekers who want to stand out</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Video className="w-8 h-8 text-primary" />}
              title="Realistic Video Interviews"
              description="Practice face-to-face with lifelike AI interviewers. See yourself on camera just like the real thing."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-warning" />}
              title="Smart Question Adaptation"
              description="Questions evolve based on your resume and previous answers. No two interviews are the same."
            />
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8 text-success" />}
              title="Voice & Text Answers"
              description="Answer however you're comfortable. Practice your speaking skills or type your responses."
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8 text-secondary" />}
              title="Detailed Performance Analytics"
              description="See scores for technical skills, communication, confidence, and professionalism."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-primary" />}
              title="Personalized Roadmaps"
              description="Get a custom improvement plan with resources and action steps tailored to your weak spots."
            />
            <FeatureCard
              icon={<Download className="w-8 h-8 text-success" />}
              title="Export Your Results"
              description="Download professional PDF reports to track progress and share with mentors or coaches."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Job Seekers</h2>
            <p className="text-xl text-gray-600">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="I practiced 5 interviews before my Google interview. The AI feedback helped me fix my communication issues. Got the offer!"
              author="Sarah Chen"
              role="Software Engineer at Google"
              rating={5}
            />
            <TestimonialCard
              quote="The personalized roadmap was game-changing. It told me exactly what to study. Landed my dream PM role in 3 weeks."
              author="Marcus Johnson"
              role="Product Manager at Stripe"
              rating={5}
            />
            <TestimonialCard
              quote="Being able to see myself on camera and practice speaking out loud made all the difference. So much more confident now!"
              author="Priya Patel"
              role="Data Scientist at Meta"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              period="forever"
              features={[
                "3 practice interviews/month",
                "Basic feedback",
                "Text answers only",
                "30-day history"
              ]}
              cta="Start Free"
              onCTA={onGetStarted}
            />
            <PricingCard
              name="Pro"
              price="$19"
              period="per month"
              features={[
                "Unlimited interviews",
                "Advanced feedback & analytics",
                "Voice + text answers",
                "Personalized roadmaps",
                "PDF exports",
                "Unlimited history",
                "Priority support"
              ]}
              cta="Start Pro Trial"
              highlighted
              onCTA={onGetStarted}
            />
            <PricingCard
              name="Teams"
              price="$99"
              period="per month"
              features={[
                "Everything in Pro",
                "Up to 10 team members",
                "Team analytics dashboard",
                "Custom interview templates",
                "Dedicated support",
                "API access"
              ]}
              cta="Contact Sales"
              onCTA={() => alert('Contact: sales@interviewai.com')}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="How does the AI interviewer work?"
              answer="Our AI analyzes your resume and creates personalized interview questions. It uses advanced language models to have natural conversations and adapts questions based on your answers, just like a real interviewer would."
              isOpen={openFaq === 0}
              onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
            />
            <FAQItem
              question="Can I practice for specific job roles?"
              answer="Yes! Upload your resume and the AI will tailor questions to your target role, experience level, and skills. You can also choose difficulty levels (easy, medium, hard) to match your needs."
              isOpen={openFaq === 1}
              onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
            />
            <FAQItem
              question="Do I need any special equipment?"
              answer="Just a computer with a webcam and microphone. The app works in any modern web browser—no downloads or installations required."
              isOpen={openFaq === 2}
              onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
            />
            <FAQItem
              question="How accurate is the feedback?"
              answer="Our AI evaluates your answers across multiple dimensions: technical accuracy, communication clarity, confidence, and professionalism. Thousands of users have validated the feedback matches what they hear in real interviews."
              isOpen={openFaq === 3}
              onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
            />
            <FAQItem
              question="Can I practice multiple times?"
              answer="Absolutely! With Pro, you get unlimited interviews. Each session is unique—the AI generates fresh questions every time, so you'll never run out of practice material."
              isOpen={openFaq === 4}
              onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
            />
            <FAQItem
              question="Is my data private and secure?"
              answer="Yes. We use enterprise-grade encryption and never share your information. Your resume, interview recordings, and results are stored securely and only accessible to you."
              isOpen={openFaq === 5}
              onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of job seekers who've improved their interview skills with AI practice
          </p>
          <button onClick={onGetStarted} className="bg-white text-primary px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all inline-flex items-center gap-2">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-4 text-sm opacity-75">No credit card required · Start in 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <Sparkles className="w-6 h-6" />
                <span className="font-bold">InterviewAI</span>
              </div>
              <p className="text-sm">
                AI-powered interview practice that helps you land your dream job.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 InterviewAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const StepCard = ({ number, icon, title, description }: any) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <div className="text-primary">{icon}</div>
    </div>
    <div className="text-sm font-bold text-primary mb-2">Step {number}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }: any) => (
  <div className="card hover:shadow-xl transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard = ({ quote, author, role, rating }: any) => (
  <div className="card hover:shadow-xl transition-shadow">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 fill-warning text-warning" />
      ))}
    </div>
    <p className="text-gray-700 mb-4">"{quote}"</p>
    <div>
      <div className="font-semibold">{author}</div>
      <div className="text-sm text-gray-600">{role}</div>
    </div>
  </div>
);

const PricingCard = ({ name, price, period, features, cta, highlighted, onCTA }: any) => (
  <div className={`card ${highlighted ? 'border-2 border-primary shadow-2xl scale-105' : ''}`}>
    {highlighted && (
      <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
        MOST POPULAR
      </div>
    )}
    <h3 className="text-2xl font-bold mb-2">{name}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold">{price}</span>
      <span className="text-gray-600">/{period}</span>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature: string, i: number) => (
        <li key={i} className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <span className="text-gray-700">{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onCTA}
      className={`btn w-full ${highlighted ? 'btn-primary' : 'btn-secondary'}`}
    >
      {cta}
    </button>
  </div>
);

const FAQItem = ({ question, answer, isOpen, onClick }: any) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      onClick={onClick}
      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
    >
      <span className="font-semibold">{question}</span>
      <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-gray-600">{answer}</p>
      </div>
    )}
  </div>
);
