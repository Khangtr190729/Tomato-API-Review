import { useState, useEffect, useRef } from 'react'

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

  const handleSearch = async (e: React.FormEvent | string) => {
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
  }

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
          className="w-full py-4 pl-6 pr-32 text-lg border border-neutral-200 dark:border-neutral-800 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-none transition-all duration-200 focus:border-rtRed focus:ring-4 focus:ring-rtRed/10 placeholder-neutral-400"
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
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-rtRed text-white border-none rounded-full px-6 py-2.5 font-medium cursor-pointer transition-all hover:bg-rtRedHover active:scale-95 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed"
          disabled={loading || !query.trim()}
        >
          Tìm kiếm
        </button>

        {/* Dropdown Suggestions */}
        {showDropdown && query.trim() && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden z-10 max-h-[400px] overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
            {isSearchingSuggestions ? (
              <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">Đang tải gợi ý...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-4 p-3 cursor-pointer transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${index !== suggestions.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''}`}
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
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-lg animate-[fadeIn_0.5s_ease-out] flex flex-col">
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
    </div>
  )
}

export default App
