import os
import logging
import asyncio
from scraper import get_rt_scores, ScraperException, init_shared_http_client, close_shared_http_client

# Configure logging for test output
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def test_scraper_async():
    await init_shared_http_client()
    test_urls = [
        "https://www.rottentomatoes.com/m/the_matrix",
        "soul_2020",
        "Toy Story 4",
        "moana_2026"
    ]
    
    print("=========================================================")
    print("RUNNING SUCCESS CASES")
    print("=========================================================")
    
    for url in test_urls:
        try:
            print(f"\nScraping URL: {url}")
            result = await get_rt_scores(url)
            print("SUCCESS! Output:")
            print(result)
            
            # Assertions to ensure dictionary format and value validity (allowing None for missing ratings)
            assert "title" in result, "Result must contain 'title'"
            assert isinstance(result["title"], str), "'title' must be a string"
            
            assert "tomatometer" in result, "Result must contain 'tomatometer'"
            assert result["tomatometer"] is None or isinstance(result["tomatometer"], int), "'tomatometer' must be int or None"
            
            assert "tomatometer_review_count" in result, "Result must contain 'tomatometer_review_count'"
            assert result["tomatometer_review_count"] is None or isinstance(result["tomatometer_review_count"], int) or isinstance(result["tomatometer_review_count"], str), "'tomatometer_review_count' must be int, str or None"
            
            assert "audience_score" in result, "Result must contain 'audience_score'"
            assert result["audience_score"] is None or isinstance(result["audience_score"], int), "'audience_score' must be int or None"
            
            assert "audience_rating_count" in result, "Result must contain 'audience_rating_count'"
            assert result["audience_rating_count"] is None or isinstance(result["audience_rating_count"], str) or isinstance(result["audience_rating_count"], int), "'audience_rating_count' must be str, int or None"
            
            t_str = f"{result['tomatometer']}%" if result['tomatometer'] is not None else "--%"
            t_count = f"({result['tomatometer_review_count']} Reviews)" if result['tomatometer_review_count'] is not None else "(No Reviews)"
            a_str = f"{result['audience_score']}%" if result['audience_score'] is not None else "--%"
            a_count = f"({result['audience_rating_count']})" if result['audience_rating_count'] is not None else "(No Ratings)"
            
            print(f"Verified: Title='{result['title']}', Tomatometer={t_str} {t_count}, Audience={a_str} {a_count}")
        except Exception as e:
            print(f"FAILED to scrape {url}: {e}")
            raise e

    print("\n=========================================================")
    print("RUNNING FAILURE / EXCEPTION CASES")
    print("=========================================================")
    
    # 1. Invalid URL structure
    invalid_url = "https://www.google.com"
    print(f"\nScraping invalid URL: {invalid_url}")
    try:
        await get_rt_scores(invalid_url)
        print("FAIL: Expected exception was not raised for invalid domain.")
    except ScraperException as se:
        print(f"SUCCESS: Correctly raised ScraperException: {se}")
        
    # 2. Non-existent movie page (should raise 404 and create debug files)
    non_existent_url = "https://www.rottentomatoes.com/m/non_existent_movie_999999"
    print(f"\nScraping non-existent URL: {non_existent_url}")
    
    # Clean up old debug files if they exist
    for f in ["rt.html", "debug.png"]:
        if os.path.exists(f):
            os.remove(f)
            
    try:
        await get_rt_scores(non_existent_url, retries=1) # Use 1 retry for faster test
        print("FAIL: Expected exception was not raised for non-existent URL.")
    except ScraperException as se:
        print(f"SUCCESS: Correctly raised ScraperException for 404.")
        print(f"Exception message summary: {str(se).splitlines()[0]}")
        
        # Verify debug files exist
        html_exists = os.path.exists("rt.html")
        png_exists = os.path.exists("debug.png")
        print(f"Debug HTML created: {html_exists}")
        print(f"Debug Screenshot created: {png_exists}")
        
        assert html_exists, "Debug file 'rt.html' must be created on failure."
        assert png_exists, "Debug file 'debug.png' must be created on failure."
        print("Debug files verification PASSED.")
        
    print("\n=========================================================")
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
    print("=========================================================")
    await close_shared_http_client()

if __name__ == "__main__":
    asyncio.run(test_scraper_async())
