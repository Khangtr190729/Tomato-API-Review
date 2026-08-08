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
    // Tối ưu hiệu năng: dùng gradient tĩnh nhẹ nhàng thay vì animation nặng
    document.body.className = 'antialiased min-h-screen font-inter bg-gradient-to-br from-indigo-50 via-white to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-300'
  }, [])

  // Styles kết hợp: Glassmorphism cho card/dropdown, Claymorphism cho input/button
  const containerClasses = 'bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-3xl'
  const inputClasses = 'bg-slate-100 dark:bg-slate-800 shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#f1f5f9] dark:shadow-[inset_3px_3px_6px_#0f172a,inset_-3px_-3px_6px_#334155] border-transparent focus:ring-2 focus:ring-rtRed/30'
  const buttonClasses = 'bg-rtRed hover:bg-rtRedHover shadow-[4px_4px_8px_#c82808,-4px_-4px_8px_#ff3c0c] dark:shadow-[4px_4px_8px_#7a1805,-4px_-4px_8px_#ff4a1f] border-transparent transition-all active:shadow-[inset_4px_4px_8px_#c82808,inset_-4px_-4px_8px_#ff3c0c] text-white'
  const dropdownClasses = 'bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]'
  
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
    <div className="w-full max-w-[600px] px-5 py-10 flex flex-col gap-8">
      <header className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight mb-2 text-neutral-900 dark:text-neutral-100">
          <span className="text-rtRed">Tomato</span> Search
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-light">Tra cứu thông tin và điểm số phim từ Rotten Tomatoes</p>
      </header>

      <form className="relative flex w-full" onSubmit={handleSearch} ref={dropdownRef}>
        <input
          type="text"
          className={`w-full py-4 pl-6 pr-32 text-lg rounded-full outline-none transition-all duration-200 placeholder-neutral-400 ${inputClasses}`}
          placeholder="Nhập tên phim hoặc URL Rotten Tomatoes..."
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
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-white border-none rounded-full px-6 py-2.5 font-medium cursor-pointer active:scale-95 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:shadow-none ${buttonClasses}`}
          disabled={loading || !query.trim()}
        >
          Tìm kiếm
        </button>

        {showDropdown && query.trim() && (
          <div className={`absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl overflow-hidden z-10 max-h-[400px] overflow-y-auto animate-[fadeIn_0.2s_ease-out] dropdown-container ${dropdownClasses}`}>
            {isSearchingSuggestions ? (
              <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">Đang tải gợi ý...</div>
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
                    <img src={item.image} alt={item.title} className="w-10 h-[60px] object-cover rounded bg-neutral-100 dark:bg-neutral-800 shrink-0" />
                  ) : (
                    <div className="w-10 h-[60px] rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[0.7rem] text-neutral-400 shrink-0">No Img</div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">{item.title}</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{item.year}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">Không tìm thấy gợi ý</div>
            )}
          </div>
        )}
      </form>

      {error && (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-xl text-sm border-l-4 border-red-500 animate-[slideIn_0.3s_ease-out]">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center p-10">
          <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-800 border-t-rtRed rounded-full animate-spin"></div>
        </div>
      )}

      {movie && !loading && (
        <div className={`overflow-hidden animate-[fadeIn_0.5s_ease-out] flex flex-col ${containerClasses}`}>
          {movie.image ? (
            <div className="w-full relative bg-black flex justify-center">
              <img src={movie.image} alt={movie.title} className="w-full max-h-[400px] object-contain" />
            </div>
          ) : (
            <div className="w-full aspect-video flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-light">
              Không có ảnh bìa
            </div>
          )}
          
          <div className="p-8 flex flex-col gap-5">
            <h2 className="text-3xl font-semibold leading-tight text-neutral-900 dark:text-neutral-100">{movie.title}</h2>
            
            <div className="flex gap-8 border-y border-neutral-200 dark:border-neutral-800 py-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Tomatometer</span>
                <div className="text-3xl font-bold flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                  {movie.tomatometer !== null && movie.tomatometer !== undefined ? (
                    <>{movie.tomatometer}<span className="text-xl font-normal text-neutral-500">%</span></>
                  ) : (
                    <span className="text-xl font-normal text-neutral-500">N/A</span>
                  )}
                </div>
                {movie.tomatometer_review_count && (
                  <span className="text-sm text-neutral-500">{movie.tomatometer_review_count} Reviews</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Audience Score</span>
                <div className="text-3xl font-bold flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                  {movie.audience_score !== null && movie.audience_score !== undefined ? (
                    <>{movie.audience_score}<span className="text-xl font-normal text-neutral-500">%</span></>
                  ) : (
                    <span className="text-xl font-normal text-neutral-500">N/A</span>
                  )}
                </div>
                {movie.audience_rating_count && (
                  <span className="text-sm text-neutral-500">{movie.audience_rating_count}</span>
                )}
              </div>
            </div>

            {movie.description && (
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-base">
                {movie.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center flex flex-col items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 animate-[fadeIn_0.5s_ease-out]">
        <p>Developed with ❤️ by Khang</p>
        <div className="flex gap-4">
          <a href="https://github.com/Khangtr190729" target="_blank" rel="noreferrer" className="hover:text-rtRed transition-colors font-medium">
            GitHub
          </a>
          <a href="https://www.facebook.com/Khangtr1201/" target="_blank" rel="noreferrer" className="hover:text-rtRed transition-colors font-medium">
            Facebook
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
