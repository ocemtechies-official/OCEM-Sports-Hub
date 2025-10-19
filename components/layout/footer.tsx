import Link from "next/link"
import { Github, Twitter, Mail, Facebook, Instagram, Youtube } from "lucide-react"
import ParticlesBackground from "@/components/ui/particles-background"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-slate-300 border-t border-slate-800/50 overflow-hidden">     
      {/* Particles Background */}
      <ParticlesBackground 
        colors={['#67e8f9', '#a78bfa', '#22d3ee']} 
        size={2.5}
        countDesktop={50}
        countTablet={40}
        countMobile={30}
        zIndex={0}
        height="100%" 
      />
      
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        
        {/* Floating particles as per project specification */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-30 animate-particle"></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-40 animate-particle animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full opacity-20 animate-particle animation-delay-2000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-cyan-300 rounded-full opacity-30 animate-particle animation-delay-3000"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-emerald-300 rounded-full opacity-25 animate-particle animation-delay-1500"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 footer-grid">
          {/* Brand */}
          <div className="lg:col-span-1 footer-brand-section">
            <div className="flex items-center gap-3 mb-6 group">
              <div className="group-hover:opacity-90 transition-all duration-300 transform group-hover:scale-105">
                <img 
                  src="/logo.png" 
                  alt="OCEM Sports Hub Logo" 
                  className="h-10 w-10 md:h-12 md:w-12 object-contain" 
                />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-emerald-300 transition-all duration-300">
                OCEM Sports Hub
              </span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed text-sm md:text-base">
              The ultimate multi-sport tournament platform featuring live scores, interactive quizzes, and competitive chess matches.
            </p>
            <div className="flex gap-3 md:gap-4 footer-social-icons">
              <a href="#" className="bg-slate-800/50 backdrop-blur-sm p-2 md:p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-blue-500 hover:text-white hover:shadow-blue-500/30 border border-slate-700 hover:border-blue-400 hover:scale-110 glow-on-hover footer-social-icon">
                <Facebook className="h-4 w-4 md:h-5 md:w-5" />
              </a>
              <a href="#" className="bg-slate-800/50 backdrop-blur-sm p-2 md:p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-sky-400 hover:text-white hover:shadow-sky-400/30 border border-slate-700 hover:border-sky-300 hover:scale-110 glow-on-hover footer-social-icon">
                <Twitter className="h-4 w-4 md:h-5 md:w-5" />
              </a>
              <a href="#" className="bg-slate-800/50 backdrop-blur-sm p-2 md:p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:shadow-pink-500/30 border border-slate-700 hover:border-pink-400 hover:scale-110 glow-on-hover footer-social-icon">
                <Instagram className="h-4 w-4 md:h-5 md:w-5" />
              </a>
              <a href="#" className="bg-slate-800/50 backdrop-blur-sm p-2 md:p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-red-500 hover:text-white hover:shadow-red-500/30 border border-slate-700 hover:border-red-400 hover:scale-110 glow-on-hover footer-social-icon">
                <Youtube className="h-4 w-4 md:h-5 md:w-5" />
              </a>
              <a href="https://github.com/FarhanAlam-Official" target="_blank" rel="noopener noreferrer" className="bg-slate-800/50 backdrop-blur-sm p-2 md:p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-white hover:text-black hover:shadow-white/30 border border-slate-700 hover:border-white hover:scale-110 glow-on-hover footer-social-icon">
                <Github className="h-4 w-4 md:h-5 md:w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg relative inline-block group">
              Quick Links
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <Link href="/teams" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Teams</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Leaderboard</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Quizzes</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/chess" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Chess</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/fixtures" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Fixtures</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg relative inline-block group">
              Sports
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <Link href="/teams?sport=cricket" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Cricket</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=football" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Football</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=basketball" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Basketball</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=badminton" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Badminton</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=table-tennis" className="hover:text-cyan-400 transition-colors duration-300 inline-block relative group py-1 footer-link-hover text-sm md:text-base">
                  <span className="relative z-10">Table Tennis</span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg relative inline-block group">
              Contact Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <ul className="space-y-4 md:space-y-5">
              <li className="flex items-start gap-3 md:gap-4 group footer-contact-item">
                <div className="mt-1 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 transition-all duration-300 group-hover:bg-cyan-500/20 glow-on-hover footer-contact-icon">
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-cyan-400 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm md:text-base">Email</p>
                  <span className="group-hover:text-cyan-300 transition-colors duration-300 text-xs md:text-sm">
                    support@ocemsportshub.com
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 md:gap-4 group footer-contact-item">
                <div className="mt-1 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 transition-all duration-300 group-hover:bg-cyan-500/20 glow-on-hover footer-contact-icon">
                  <div className="h-4 w-4 md:h-5 md:w-5 text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full group-hover:animate-pulse transition-all duration-300"></div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-white text-sm md:text-base">Address</p>
                  <span className="group-hover:text-cyan-300 transition-colors duration-300 text-xs md:text-sm">
                    OCEM Sports Complex<br />Main Campus<br />City, State 12345
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 md:pt-10 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 footer-bottom-bar">
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
            <p className="text-xs md:text-sm text-slate-400 text-center sm:text-left footer-copyright">© {currentYear} OCEM Sports Hub. All rights reserved.</p>
            <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full"></div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm footer-bottom-links">
              <Link href="#" className="hover:text-cyan-400 transition-colors duration-300 relative group py-1 footer-link-hover">
                <span className="relative z-10">Privacy Policy</span>
                <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors duration-300 relative group py-1 footer-link-hover">
                <span className="relative z-10">Terms of Service</span>
                <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors duration-300 relative group py-1 footer-link-hover">
                <span className="relative z-10">Contact</span>
                <span className="absolute bottom-0 left-0 w-0 h-full bg-cyan-500/10 rounded transition-all duration-300 group-hover:w-full"></span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-1 text-xs md:text-sm footer-developer-info">
            <span className="text-slate-400">Designed and Developed with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span className="text-slate-400">by</span>
            <a 
              href="https://github.com/FarhanAlam-Official" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent hover:from-cyan-300 hover:to-emerald-300 transition-all duration-300"
            >
              Farhan Alam
            </a>
            <span className="text-slate-400">and team</span>
          </div>
        </div>
      </div>
    </footer>
  )
}