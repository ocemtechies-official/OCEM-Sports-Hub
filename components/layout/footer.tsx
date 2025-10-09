import Link from "next/link"
import { Trophy, Github, Twitter, Mail, Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">OCEM Sports Hub</span>
            </div>
            <p className="text-slate-400 mb-6">
              The ultimate multi-sport tournament platform featuring live scores, interactive quizzes, and competitive chess matches.
            </p>
            <div className="flex gap-3">
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-3 rounded-full transition-all">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/teams" className="hover:text-blue-400 transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-blue-400 transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-blue-400 transition-colors">
                  Quizzes
                </Link>
              </li>
              <li>
                <Link href="/chess" className="hover:text-blue-400 transition-colors">
                  Chess
                </Link>
              </li>
              <li>
                <Link href="/fixtures" className="hover:text-blue-400 transition-colors">
                  Fixtures
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">Sports</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/teams?sport=cricket" className="hover:text-blue-400 transition-colors">
                  Cricket
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=football" className="hover:text-blue-400 transition-colors">
                  Football
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=basketball" className="hover:text-blue-400 transition-colors">
                  Basketball
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=badminton" className="hover:text-blue-400 transition-colors">
                  Badminton
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=table-tennis" className="hover:text-blue-400 transition-colors">
                  Table Tennis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <span>support@ocemsportshub.com</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 text-blue-400 mt-0.5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
                <span>OCEM Sports Complex<br />Main Campus<br />City, State 12345</span>
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
              <Link href="#" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Powered by</span>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              OCEM Sports Hub
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}