import Link from "next/link"
import { Trophy, Github, Twitter, Mail, Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Sports Week 2025</span>
            </div>
            <p className="text-slate-400 max-w-md mb-4">
              The ultimate multi-sport tournament platform featuring live scores, interactive quizzes, and competitive
              chess matches. Celebrating excellence in sports and academics.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-2 rounded-full transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-2 rounded-full transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-2 rounded-full transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-2 rounded-full transition-all">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-blue-600 hover:text-white p-2 rounded-full transition-all">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/teams" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Quizzes
                </Link>
              </li>
              <li>
                <Link href="/chess" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Chess
                </Link>
              </li>
              <li>
                <Link href="/fixtures" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Fixtures
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Sports</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/teams?sport=cricket" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Cricket
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=football" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Football
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=basketball" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Basketball
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=badminton" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Badminton
                </Link>
              </li>
              <li>
                <Link href="/teams?sport=table-tennis" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Table Tennis
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Admin</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/admin" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/fixtures" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Manage Fixtures
                </Link>
              </li>
              <li>
                <Link href="/admin/teams" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Manage Teams
                </Link>
              </li>
              <li>
                <Link href="/admin/quizzes" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Manage Quizzes
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Manage Users
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-slate-400">© {currentYear} Sports Week. All rights reserved.</p>
            <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full"></div>
            <div className="flex gap-4 text-sm">
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
