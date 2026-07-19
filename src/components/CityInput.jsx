import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function CityInput({ value, onChange, placeholder = '', className = '', required = false }) {
  const [cities, setCities] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { fetchCities() }, [])

  useEffect(() => {
    function handleClick(e) { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchCities() {
    const { data: depData } = await supabase.from('posts').select('departure_city')
    const { data: arrData } = await supabase.from('posts').select('arrival_city')
    const countMap = {}
    for (const row of depData || []) { const name = row.departure_city?.trim(); if (name) countMap[name] = (countMap[name] || 0) + 1 }
    for (const row of arrData || []) { const name = row.arrival_city?.trim(); if (name) countMap[name] = (countMap[name] || 0) + 1 }
    setCities(Object.entries(countMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count))
  }

  const filtered = value ? cities.filter((c) => c.name.toLowerCase().includes(value.toLowerCase())) : cities

  function selectCity(name) { onChange(name); setShowDropdown(false); setHighlightIndex(-1) }

  function handleKeyDown(e) {
    if (!showDropdown || filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1)) }
    else if (e.key === 'Enter' && highlightIndex >= 0) { e.preventDefault(); selectCity(filtered[highlightIndex].name) }
    else if (e.key === 'Escape') setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input ref={inputRef} type="text" value={value}
        onChange={(e) => { onChange(e.target.value); setShowDropdown(true); setHighlightIndex(-1) }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder} required={required}
        className={className} autoComplete="off"
      />
      {showDropdown && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-muted-200 rounded-xl shadow-lg max-h-52 overflow-y-auto py-1">
          {filtered.map((city, i) => (
            <button key={city.name} type="button" onClick={() => selectCity(city.name)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                i === highlightIndex ? 'bg-primary-50 text-primary-700' : 'text-muted-600 hover:bg-muted-50'
              }`}>
              <span className="font-medium">{city.name}</span>
              <span className="text-xs text-muted-500">{city.count} 条</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
