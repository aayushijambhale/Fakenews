
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.NEWS_API_KEY;

async function testNews() {
  const url = `https://newsapi.org/v2/everything?q=India&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
  try {
    console.log(`Testing NewsAPI: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log(`Status: ${data.status}`);
    if (data.status === "ok") {
      console.log(`Total Results: ${data.totalResults}`);
      console.log(`First Article: ${data.articles?.[0]?.title}`);
    } else {
      console.log(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error(`Error:`, err);
  }
}

testNews();
