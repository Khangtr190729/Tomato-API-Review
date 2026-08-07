import { useState } from 'react'

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setMovie(null)

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/scores?movie=${encodeURIComponent(query)}`)
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
    <div className="app-container">
      <header>
        <h1><span>Tomato</span> Search</h1>
        <p className="subtitle">Tra cứu thông tin và điểm số phim từ Rotten Tomatoes</p>
      </header>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Nhập tên phim hoặc URL Rotten Tomatoes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="search-button" disabled={loading || !query.trim()}>
          Tìm kiếm
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      )}

      {movie && !loading && (
        <div className="movie-card">
          {movie.image ? (
            <div className="movie-poster-container" style={{ aspectRatio: 'auto', maxHeight: '400px' }}>
              <img src={movie.image} alt={movie.title} className="movie-poster" style={{ objectFit: 'contain', backgroundColor: '#000' }} />
            </div>
          ) : (
            <div className="movie-poster-container">
              <div className="no-poster">Không có ảnh bìa</div>
            </div>
          )}
          
          <div className="movie-info">
            <h2 className="movie-title">{movie.title}</h2>
            
            <div className="scores-container">
              <div className="score-item">
                <span className="score-label">Tomatometer</span>
                <div className="score-value">
                  {movie.tomatometer !== null && movie.tomatometer !== undefined ? (
                    <>{movie.tomatometer}<span className="percent">%</span></>
                  ) : (
                    <span className="percent">N/A</span>
                  )}
                </div>
                {movie.tomatometer_review_count && (
                  <span className="score-count">{movie.tomatometer_review_count} Reviews</span>
                )}
              </div>

              <div className="score-item">
                <span className="score-label">Audience Score</span>
                <div className="score-value">
                  {movie.audience_score !== null && movie.audience_score !== undefined ? (
                    <>{movie.audience_score}<span className="percent">%</span></>
                  ) : (
                    <span className="percent">N/A</span>
                  )}
                </div>
                {movie.audience_rating_count && (
                  <span className="score-count">{movie.audience_rating_count}</span>
                )}
              </div>
            </div>

            {movie.description && (
              <p className="movie-description">{movie.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
