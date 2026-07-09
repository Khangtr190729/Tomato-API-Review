import sys
import asyncio
import logging

if sys.platform == 'win32':
    # Playwright Async API requires ProactorEventLoop on Windows to handle subprocesses
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from contextlib import asynccontextmanager
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Query, HTTPException, status
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.responses import HTMLResponse
from scraper import get_rt_scores, ScraperException, init_shared_browser, close_shared_browser

# Configure logging (Set to WARNING in production to optimize console I/O speed)
logging.basicConfig(level=logging.WARNING, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("rt_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the warm browser process once on startup (Async)
    logger.info("Initializing shared browser for FastAPI API server...")
    await init_shared_browser(headless=True)
    yield
    # Clean up and close the browser process on shutdown (Async)
    logger.info("Closing shared browser on FastAPI API server shutdown...")
    await close_shared_browser()

app = FastAPI(
    title="Rotten Tomatoes Ratings API",
    description="A simple HTTP API to retrieve movie scores (Tomatometer & Audience Score) from Rotten Tomatoes.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS to allow external web apps to consume this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
def read_root():
    """Return a clean HTML guide page at root endpoint."""
    return """
    <html>
        <head>
            <title>Rotten Tomatoes Ratings API</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 0 20px;
                    background-color: #f8f9fa;
                    color: #333;
                    line-height: 1.6;
                }
                h1 { color: #fa320a; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
                code { background-color: #e9ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 1.05em; }
                pre { background-color: #212529; color: #f8f9fa; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: monospace; }
                .endpoint { margin: 20px 0; padding: 15px; background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #fa320a; }
            </style>
        </head>
        <body>
            <h1>Rotten Tomatoes Ratings API </h1>
            <p>Welcome! This API allows you to retrieve movie scores (Tomatometer, Popcornmeter, and review/rating counts) dynamically by passing a movie name or Rotten Tomatoes URL.</p>
            
            <div class="endpoint">
                <h3>Get Ratings Endpoint:</h3>
                <p><code>GET /api/scores?movie={movie_name_or_url}</code></p>
                <p><strong>Example Request:</strong></p>
                <p><a href="/api/scores?movie=matrix" target="_blank"><code>/api/scores?movie=matrix</code></a></p>
                <p><strong>Example Response:</strong></p>
                <pre>{
    "title": "The Matrix",
    "tomatometer": 83,
    "tomatometer_review_count": 209,
    "audience_score": 85,
    "audience_rating_count": "1,307,885 Ratings"
}</pre>
            </div>
            
            <p>To view full interactive API documentation, visit <a href="/docs">Swagger UI /docs</a>.</p>
        </body>
    </html>
    """

@app.get("/api/scores")
async def get_scores(movie: str = Query(..., description="The name, slug, or full URL of the movie on Rotten Tomatoes")):
    """
    Retrieve Tomatometer and Audience Score for a movie.
    """
    if not movie.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'movie' query parameter cannot be empty."
        )
        
    try:
        logger.info(f"API request received for movie: '{movie}'")
        data = await get_rt_scores(movie)
        return data
    except ScraperException as se:
        logger.error(f"Scraping error for '{movie}': {se}")
        # Look at error type to raise appropriate status code
        if "404" in str(se) or "not be found" in str(se):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Movie '{movie}' was not found on Rotten Tomatoes. Verify the name or slug."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve ratings: {str(se).splitlines()[0]}"
        )
    except Exception as e:
        logger.error(f"Unexpected API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    # Run the server locally on port 8000 (reload disabled to prevent event loop policy overrides on Windows)
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
