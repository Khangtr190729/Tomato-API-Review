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
from scraper import (
    get_rt_scores, 
    ScraperException, 
    init_shared_browser, 
    close_shared_browser,
    init_shared_http_client,
    close_shared_http_client,
    prewarm_cache
)

# Configure logging (Set to WARNING in production to optimize console I/O speed)
logging.basicConfig(level=logging.WARNING, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("rt_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the warm browser process and shared HTTPX pool on startup (Async)
    logger.warning("Starting API server, warming browser and connection pools...")
    await init_shared_browser(headless=True)
    await init_shared_http_client()
    asyncio.create_task(prewarm_cache())
    yield
    # Clean up and close browser and client on shutdown (Async)
    logger.warning("Shutting down API server, releasing pools...")
    await close_shared_browser()
    await close_shared_http_client()

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
    Retrieve Tomatometer, Popcornmeter, and their counts for a movie.
    """
    movie_clean = movie.strip()
    if not movie_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Validation Error: The 'movie' query parameter cannot be empty."
        )
        
    # Validation: Check if it's a URL and if it belongs to Rotten Tomatoes
    is_url = movie_clean.startswith("http://") or movie_clean.startswith("https://") or \
             movie_clean.startswith("www.rottentomatoes.com/") or movie_clean.startswith("rottentomatoes.com/")
    if is_url and "rottentomatoes.com" not in movie_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Validation Error: Invalid URL structure. Only Rotten Tomatoes URLs are supported (e.g. https://www.rottentomatoes.com/m/matrix)."
        )
        
    try:
        data = await get_rt_scores(movie_clean)
        return data
    except ScraperException as se:
        err_msg = str(se)
        # Detailed conditional validation reporting
        if "HTTP 404" in err_msg or "not found" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Movie Not Found: '{movie_clean}' was not found on Rotten Tomatoes. Verify the name, slug, or URL."
            )
        elif "Invalid URL" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Validation Error: {err_msg}"
            )
        # RT Server connection or response issues
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Rotten Tomatoes Gateway Error: {err_msg.splitlines()[0]}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    # Run the server locally on port 8000 (reload disabled to prevent event loop policy overrides on Windows)
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
