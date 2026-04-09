import Link from 'next/link';
import { Sprout, CloudRain, LineChart, Leaf, ArrowRight, Wheat } from 'lucide-react';
import { Button } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen grain-texture">
      {/* Header / Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-earth-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 text-sage-800 group">
              <div className="relative">
                <Wheat size={32} className="transition-transform group-hover:rotate-12" />
                <div className="absolute inset-0 bg-sage-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">CropAI Kenya</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-earth-700 hover:text-sage-700 transition font-medium">How It Works</a>
              <Link href="/login" className="text-earth-700 hover:text-sage-700 transition font-medium">Login</Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sage-100 via-earth-50 to-sage-50" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-sage-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-terracotta-300/15 rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-block mb-6 px-4 py-2 bg-sage-100 border border-sage-300 rounded-full">
            <span className="text-sm font-medium text-sage-800">Using local weather data</span>
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 text-earth-900 text-balance leading-[1.1]">
            Crop Yield Forecasts for Kenyan Farms
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-earth-700 max-w-3xl mx-auto leading-relaxed">
            See estimated yields for your crops using local weather and soil data. Works with maize, beans, wheat, and more.
          </p>
          <Link href="/signup" className="inline-block animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <Button size="lg" className="shadow-lifted hover:shadow-xl transition-all group">
              <span>Get Started</span>
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0ebe0_1px,transparent_1px),linear-gradient(to_bottom,#f0ebe0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-earth-900 mb-6">How it works</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sage-400 to-terracotta-400 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf size={32} />,
                title: "Yield Estimates",
                desc: "Enter your crop, location, and soil details to see expected yields per hectare.",
                color: "sage"
              },
              {
                icon: <LineChart size={32} />,
                title: "Profit Calculator",
                desc: "Compare expected income against planting and fertilizer costs.",
                color: "terracotta"
              },
              {
                icon: <CloudRain size={32} />,
                title: "Weather Data",
                desc: "Uses rainfall and temperature records from your area going back 10 years.",
                color: "sage"
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="group relative bg-gradient-to-br from-white to-earth-50 p-10 rounded-2xl border-2 border-earth-200 hover:border-sage-400 transition-all duration-300 hover:shadow-lifted animate-scale-in"
                style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
              >
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-6 text-${feature.color}-700 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-serif font-semibold mb-4 text-earth-900">{feature.title}</h3>
                <p className="text-earth-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-earth-900 mb-6">Farmer feedback</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-terracotta-400 to-sage-400 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                quote: "I used the yield estimate to figure out storage space. Saved me from scrambling at harvest time.",
                name: "Jane M., Nakuru",
                delay: "0s"
              },
              {
                quote: "The profit numbers helped me choose between coffee and maize. Coffee looked better on paper but maize was safer.",
                name: "Peter K., Kiambu",
                delay: "0.1s"
              }
            ].map((testimonial, idx) => (
              <div 
                key={idx}
                className="bg-white p-10 rounded-2xl border-2 border-earth-200 shadow-soft hover:shadow-lifted transition-all duration-300 animate-slide-up"
                style={{ animationDelay: testimonial.delay, opacity: 0 }}
              >
                <div className="text-sage-600 mb-6">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" />
                  </svg>
                </div>
                <p className="text-lg text-earth-700 mb-6 leading-relaxed italic">{testimonial.quote}</p>
                <p className="font-semibold text-earth-900">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sage-50 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-earth-900 mb-8 leading-tight">
                Built for Kenyan farmers
              </h2>
              <div className="space-y-6 text-lg text-earth-700 leading-relaxed">
                <p>
                  Most Kenyan farmers plan crops based on last season's results or advice from neighbors.
                </p>
                <p>
                  This tool gives you another data point: what to expect based on your soil, weather, and planting schedule.
                </p>
              </div>
            </div>
            <div className="relative animate-scale-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <div className="bg-gradient-to-br from-sage-100 to-earth-100 rounded-3xl p-16 border-2 border-sage-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(93,167,95,0.1),transparent)]" />
                <Sprout className="text-sage-600 mx-auto relative z-10" size={180} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-sage-600 to-sage-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-terracotta-300 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
            Try it out
          </h2>
          <p className="text-xl md:text-2xl text-sage-100 mb-12 leading-relaxed max-w-2xl mx-auto">
            Create an account and run your first prediction.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="shadow-xl hover:shadow-2xl transition-all bg-white text-sage-800 hover:bg-earth-50 group">
              <span className="text-lg">Get Started</span>
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth-900 text-earth-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Wheat className="text-sage-400" size={28} />
              <span className="text-2xl font-serif font-bold text-white">CropAI Kenya</span>
            </div>
            <p className="mb-8 text-earth-400">© 2025 CropAI Kenya. All rights reserved.</p>
            <div className="flex justify-center gap-8 text-sm">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="mailto:support@cropai-kenya.com" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
