import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from 'cheerio'; // Import Cheerio
dotenv.config();
const NewsRouter = express.Router();
NewsRouter.use(express.json());
const SCAPER_API_KEY = process.env.SCRAPER_API_KEY;
const NEWSDATA_KEY = process.env.NEWS_DATA_API_KEY;
const GNEWS_KEY = process.env.GNEWS_API_KEY;
// Helper to scrape from the fetched sources
const getArticle = async (ogurl) => {
    try {
        const response = await axios.get("http://api.scraperapi.com", {
            params: {
                api_key: SCAPER_API_KEY,
                url: ogurl,
                country_code: 'in',
                render: 'true'
            },
            timeout: 40000
        });
        const $ = cheerio.load(response.data);
        $('script, style, nav, footer, iframe, header, .ads, .advertisement').remove();
        let cleanText = $('body p').map((i, el) => $(el).text()).get().join('\n\n');
        if (cleanText.length < 100)
            cleanText = $('body').text();
        return cleanText.replace(/\s+/g, ' ').trim().slice(0, 3000);
    }
    catch (error) {
        return null;
    }
};
// News.io 
const fetchNewsData = async (q) => {
    try {
        if (!NEWSDATA_KEY) {
            console.log("No api key found..");
            return;
        }
        ;
        const response = await axios.get("https://newsdata.io/api/1/latest", {
            params: {
                apiKey: NEWSDATA_KEY,
                coountry: "in",
                language: "en",
                query: q
            }
        });
        return response.data.results.map((a) => ({
            title: a.title,
            link: a.url,
            source: a.source.name,
            pubDate: a.publishedAt,
            image: a.image,
            description: a.description || ""
        }));
    }
    catch (e) {
        console.error("GNews Failed");
        return [];
    }
};
// RSS
export default NewsRouter;
//# sourceMappingURL=route.js.map