import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from 'cheerio'; // Import Cheerio
import type { StandardArticle } from "../../types/types.js";
import Parser from 'rss-parser';


dotenv.config();

const NewsRouter = express.Router();
NewsRouter.use(express.json());
const rssParser = new Parser();
const SCAPER_API_KEY = process.env.SCRAPER_API_KEY;
const NEWSDATA_KEY = process.env.NEWS_DATA_API_KEY;
const GNEWS_KEY = process.env.GNEWS_API_KEY;

// Helper to scrape from the fetched sources

const getArticle = async (ogurl : any)=>{
  try{

    const response = await axios.get("http://api.scraperapi.com", {
      params : {
        api_key: SCAPER_API_KEY,
        url: ogurl,
        country_code: 'in', 
        render: 'true' 
      },
      timeout: 40000
    }
  );
  
  const $ = cheerio.load(response.data);
  $('script, style, nav, footer, iframe, header, .ads, .advertisement').remove();
  let cleanText = $('body p').map((i, el) => $(el).text()).get().join('\n\n');
  
  if (cleanText.length < 100) cleanText = $('body').text();
  return cleanText.replace(/\s+/g, ' ').trim().slice(0, 3000);
} catch(error){
  return null;
}
  
}


// News.io 
const fetchNewsData = async (q : any)=>{
  try{
    if(!NEWSDATA_KEY) {
       console.log("No api key found..");
       return;
    };
    const response = await axios.get("https://newsdata.io/api/1/latest", {
      params : {
        apiKey : NEWSDATA_KEY,
        country : "in",
        language : "en",
        query : q
      }
    });

    return response.data.results.map((a : any)=>({
      title: a.title,
      link: a.url,
      source: a.source.name,
      pubDate: a.publishedAt,
      image: a.image,
      description: a.description || ""
    }))

  }catch (e) { console.error("GNews Failed"); return []; }
}

// RSS
const fetchRSS = async (): Promise<StandardArticle[]> => {
  const FEEDS = [
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "https://feeds.feedburner.com/ndtvnews-top-stories"
  ];
 try{
    const promises = await FEEDS.map((url : any)=>rssParser.parseURL(url));
    const result = await Promise.all(promises);


    return result.flatMap(feed => 
      feed.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        source: feed.title?.includes("Times") ? "Times of India" : "NDTV",
        pubDate: item.pubDate,
        image: null, // RSS usually doesn't have clean images
        description: item.contentSnippet || ""
      }))
    );

  } catch (e) { console.error("RSS Failed"); return []; }
}

const fetchGNews = async (q: string): Promise<StandardArticle[]> => {
  try {
    if (!GNEWS_KEY) return [];
    const response = await axios.get(`https://gnews.io/api/v4/search`, {
      params: { apikey: GNEWS_KEY, q: q, country: "in", lang: "en" }
    });
    return response.data.articles.map((a: any) => ({
      title: a.title,
      link: a.url,
      source: a.source.name,
      pubDate: a.publishedAt,
      image: a.image,
      description: a.description || ""
    }));
  } catch (e) { console.error("GNews Failed"); return []; }
};


export default NewsRouter;