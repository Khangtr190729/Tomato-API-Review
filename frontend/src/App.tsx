import { useState, useEffect, useRef, useCallback } from 'react'

interface Suggestion {
  title: string;
  year: string;
  url: string;
  image: string | null;
}

interface MovieData {
  title: string;
  image?: string;
  description?: string;
  tomatometer?: number;
  tomatometer_review_count?: number | string;
  audience_score?: number;
  audience_rating_count?: string;
}

function App() {
  const [query, setQuery] = useState('')
  const [movie, setMovie] = useState<MovieData | null>(null)

  useEffect(() => {
    document.body.className = 'antialiased min-h-screen font-inter text-slate-800 dark:text-slate-100 transition-colors duration-500 bg-transparent'
  }, [])

  // Styles kết hợp: Glassmorphism cho card/dropdown, Claymorphism cho input/button
  const containerClasses = 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-glass dark:shadow-glass-dark rounded-3xl overflow-hidden'
  const inputClasses = 'bg-[#eef2f5] dark:bg-slate-800/80 shadow-clay-input dark:shadow-clay-input-dark border-transparent focus:ring-2 focus:ring-rtRed/40 transition-all duration-300'
  const buttonClasses = 'bg-gradient-to-br from-rtRed to-tomato-600 hover:from-tomato-600 hover:to-rtRed shadow-clay-btn dark:shadow-clay-btn-dark border-transparent transition-all duration-300 active:shadow-clay-btn-active text-white'
  const dropdownClasses = 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/80 dark:border-white/10 shadow-glass dark:shadow-glass-dark'
  
  const getDropdownItemClasses = (isLast: boolean) => {
    let base = 'flex items-center gap-4 p-3 cursor-pointer transition-colors hover:bg-white/50 dark:hover:bg-white/10 '
    if (!isLast) base += 'border-b border-black/5 dark:border-white/5'
    return base
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounce for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setSuggestions([])
        setShowDropdown(false)
        return
      }
      
      setIsSearchingSuggestions(true)
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        if (response.ok) {
          setSuggestions(data)
          setShowDropdown(true)
        }
      } catch (e) {
        console.error("Lỗi khi tải gợi ý:", e)
      } finally {
        setIsSearchingSuggestions(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = useCallback(async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e.preventDefault()
    }
    const searchQuery = typeof e === 'string' ? e : query
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setMovie(null)
    setShowDropdown(false)

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/scores?movie=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Đã có lỗi xảy ra. Vui lòng thử lại.')
      }

      setMovie(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [query])

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-700">
        {movie && movie.image ? (
          <div className="absolute inset-0 animate-fade-in">
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-60 dark:opacity-40 filter blur-[80px] transform scale-110 transition-all duration-1000"
              style={{ backgroundImage: `url(${movie.image})` }}
            ></div>
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-[2px] transition-colors duration-700"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 opacity-80"></div>
        )}
      </div>

      <div className="w-full max-w-[640px] px-5 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <header className="text-center flex flex-col items-center">
          <div className="mb-4 p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 dark:border-white/10 inline-flex">
            <span className="text-4xl">🍅</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3 text-slate-900 dark:text-white drop-shadow-sm">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rtRed to-orange-500">Tomato</span> Search
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg tracking-wide">
            Tra cứu thông tin và điểm số phim từ Rotten Tomatoes
          </p>
        </header>

        <form className="relative flex w-full group" onSubmit={handleSearch} ref={dropdownRef}>
          <input
            type="text"
            className={`w-full py-5 pl-8 pr-36 text-lg rounded-full outline-none placeholder-slate-400 dark:placeholder-slate-500 font-medium ${inputClasses}`}
            placeholder="Nhập tên phim hoặc URL..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => {
              if (query.trim() && suggestions.length > 0) setShowDropdown(true)
            }}
            disabled={loading}
          />
          <button 
            type="submit" 
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-7 py-3.5 font-semibold text-sm tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}
            disabled={loading || !query.trim()}
          >
            Tìm kiếm
          </button>

          {showDropdown && query.trim() && (
            <div className={`absolute top-[calc(100%+12px)] left-0 right-0 rounded-3xl overflow-hidden z-20 max-h-[400px] overflow-y-auto animate-slide-in dropdown-container ${dropdownClasses}`}>
              {isSearchingSuggestions ? (
                <div className="p-6 text-center text-slate-500 font-medium">Đang tải gợi ý...</div>
              ) : suggestions.length > 0 ? (
                suggestions.map((item, index) => (
                  <div 
                    key={index} 
                    className={getDropdownItemClasses(index === suggestions.length - 1)}
                    onClick={() => {
                      setQuery(item.title)
                      setShowDropdown(false)
                      handleSearch(item.title)
                    }}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-12 h-[72px] object-cover rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 shadow-sm" />
                    ) : (
                      <div className="w-12 h-[72px] rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[0.65rem] text-slate-400 font-medium shrink-0 shadow-inner">No Img</div>
                    )}
                    <div className="flex flex-col justify-center">
                      <span className="font-semibold text-slate-900 dark:text-white text-base">{item.title}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">{item.year}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 font-medium">Không tìm thấy gợi ý</div>
              )}
            </div>
          )}
        </form>

        {error && (
          <div className="text-red-500 bg-red-50/80 dark:bg-red-500/10 backdrop-blur-md p-5 rounded-2xl text-sm font-medium border border-red-200 dark:border-red-500/30 animate-slide-in shadow-sm">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-rtRed rounded-full animate-spin shadow-sm"></div>
          </div>
        )}

        {movie && !loading && (
          <div className={`animate-slide-in flex flex-col ${containerClasses}`}>
            {movie.image ? (
              <div className="w-full relative bg-slate-900/5 dark:bg-black/20 flex justify-center p-6 border-b border-white/40 dark:border-white/5">
                <img src={movie.image} alt={movie.title} className="w-[180px] object-cover rounded-2xl shadow-xl transform transition-transform hover:scale-105 duration-500" />
              </div>
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-white/40 dark:border-white/5">
                Không có ảnh bìa
              </div>
            )}
            
            <div className="p-8 flex flex-col gap-6">
              <h2 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white text-center">
                {movie.title}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 border-y border-slate-200/50 dark:border-slate-700/50 py-6">
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 dark:bg-white/5 shadow-sm border border-white/60 dark:border-transparent">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tomatometer</span>
                  <div className="text-4xl font-extrabold flex items-center gap-1 text-slate-900 dark:text-white">
                    {movie.tomatometer !== null && movie.tomatometer !== undefined ? (
                      <>{movie.tomatometer}<span className="text-xl font-medium text-slate-400">%</span></>
                    ) : (
                      <span className="text-2xl font-semibold text-slate-400">N/A</span>
                    )}
                  </div>
                  {movie.tomatometer_review_count && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{movie.tomatometer_review_count} Reviews</span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 dark:bg-white/5 shadow-sm border border-white/60 dark:border-transparent">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Audience Score</span>
                  <div className="text-4xl font-extrabold flex items-center gap-1 text-slate-900 dark:text-white">
                    {movie.audience_score !== null && movie.audience_score !== undefined ? (
                      <>{movie.audience_score}<span className="text-xl font-medium text-slate-400">%</span></>
                    ) : (
                      <span className="text-2xl font-semibold text-slate-400">N/A</span>
                    )}
                  </div>
                  {movie.audience_rating_count && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{movie.audience_rating_count} Ratings</span>
                  )}
                </div>
              </div>

              {movie.description && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base font-medium">
                  {movie.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-4 mb-8 text-center flex flex-col items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium animate-fade-in">
          <p>Developed with <span className="text-rtRed animate-pulse inline-block">❤️</span> by Khang</p>
          <div className="flex gap-6">
            <a href="https://github.com/Khangtr190729" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              GitHub
            </a>
            <a href="https://www.facebook.com/Khangtr1201/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#1877F2] transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
              Facebook
            </a>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App
