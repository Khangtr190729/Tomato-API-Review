# Rotten Tomatoes Score Scraper & API

A robust, production-ready Python package to scrape the Tomatometer Score, Audience Score, and Title of any movie page on Rotten Tomatoes. 

It features both a **Command Line Interface (CLI)** and a **FastAPI-powered HTTP Web API** for integration with external services.

## Features

- **Flexible Inputs**: Scrape using a full Rotten Tomatoes movie URL (e.g., `https://www.rottentomatoes.com/m/the_matrix`) or simply a movie name (e.g., `Toy Story 4`, `matrix`).
- **Robust Extraction**: Reads ratings from embedded JSON elements (`#media-scorecard-json` and `data-json="reviewsData"`) to ensure immunity to visual layout changes.
- **Resilient Fallbacks**: If JSON blocks are missing, it falls back to parsing `application/ld+json` and extracting from DOM components.
- **Anti-Bot Protections**: Configures User-Agents, locale, timezone, custom viewports, and bypasses `navigator.webdriver` detection.
- **HTTP REST API**: Exposes web endpoints built on FastAPI with interactive swagger documentation.
- **Detailed Diagnostics**: Generates `rt.html` and a page screenshot `debug.png`, logging detailed console errors, network requests, and status information upon failure.

## Installation

Ensure you have Python 3.12+ installed. Install the dependencies and Playwright browser:

```bash
pip install -r requirements.txt
playwright install chromium
```

## CLI Usage

Run `scraper.py` directly from the terminal followed by a movie name, slug, or URL:

```bash
python scraper.py "Toy Story 4"
```

**Output:**
```json
{
    "title": "Toy Story 4",
    "tomatometer": 97,
    "audience_score": 94
}
```

---

## Web API Usage

You can start a local HTTP server to make HTTP requests from other applications.

### 1. Start the Server

```bash
python app.py
```
*The server will run locally at `http://localhost:8000`.*

### 2. Endpoints

#### `GET /api/scores`
Exposes the movie scraping logic.

- **Query Parameters:**
  - `movie` (str, required): The movie name, slug, or Rotten Tomatoes URL.

- **Example Request:**
  `http://localhost:8000/api/scores?movie=matrix`

- **Example Response:**
  ```json
  {
      "title": "The Matrix",
      "tomatometer": 83,
      "audience_score": 85
  }
  ```

### 3. Interactive Documentation
Go to `http://localhost:8000/docs` in your browser to view interactive API documentation (Swagger UI).

---

## Python API Usage

To use this programmatically inside another Python file:

```python
from scraper import get_rt_scores

try:
    scores = get_rt_scores("matrix")
    print(scores)
except Exception as e:
    print(f"Scraping failed: {e}")
```
