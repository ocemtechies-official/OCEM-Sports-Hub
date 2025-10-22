"use client"

import { useState } from "react"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (searchTerm: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  return (
    <div className="relative w-full lg:w-224">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search teams..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 hover:border-blue-600 focus:ring-blue-600 focus:border-blue-600 transition-all bg-white shadow-sm"
      />
    </div>
  )
}