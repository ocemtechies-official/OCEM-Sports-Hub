import Link from "next/link"
import { Github, Twitter, Mail, Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6 group">
              <div className="group-hover:opacity-90 transition-all duration-300 transform group-hover:scale-105">
                <img 
                  src="/logo.png" 
                  alt="OCEM Sports Hub Logo" 
                  className="h-10 w-10 object-contain" 
                />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                OCEM Sports Hub
              </span>
            </div>
            <p className="text-slate-400 mb-6">
              The ultimate multi-sport tournament platform featuring live scores, interactive quizzes, and competitive chess matches.
            </p>
            <div className="flex gap-3">
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://github.com/FarhanAlam-Official" target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg relative inline-block group">
              Quick Links
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/teams" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Quizzes
                </Link>
              </li>
              <li>
                <Link href="/chess" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Chess
                </Link>
              </li>
              <li>
                <Link href="/fixtures" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Fixtures
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg relative inline-block group">
              Sports
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/teams?sport=cricket" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Cricket
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=football" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Football
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=basketball" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Basketball
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=badminton" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Badminton
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=table-tennis" className="hover:text-blue-400 transition-colors duration-300 transform hover:translate-x-1 inline-block">
                  Table Tennis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg relative inline-block group">
              Contact Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:text-blue-300 transition-colors duration-300">support@ocemsportshub.com</span>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="h-5 w-5 text-blue-400 mt-0.5 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:animate-pulse transition-all duration-300"></div>
                </div>
                <span className="group-hover:text-blue-300 transition-colors duration-300">OCEM Sports Complex<br />Main Campus<br />City, State 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <p className="text-sm text-slate-400">© {currentYear} OCEM Sports Hub. All rights reserved.</p>
            <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full"></div>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="hover:text-blue-400 transition-colors duration-300 relative group">
                Privacy Policy
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors duration-300 relative group">
                Terms of Service
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors duration-300 relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Designed and Developed with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span className="text-slate-400">by</span>
            <a 
              href="https://github.com/FarhanAlam-Official" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-indigo-300 transition-all duration-300"
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