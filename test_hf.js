
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const hfToken = process.env.HF_TOKEN;
const models = [
  "hamzab/roberta-fake-news-classification",
];
const inputs = "Title: Vaccine causes autism\n\nContent: A new study shows that vaccines are dangerous.";

async function testHF() {
  for (const model of models) {
    const url = `https://router.huggingface.co/hf-inference/models/${model}`;
    try {
      console.log(`Testing URL: ${url}`);
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ inputs })
      });
      console.log(`Status: ${response.status}`);
      const data = await response.json();
      console.log(`Data:`, JSON.stringify(data).substring(0, 100));
    } catch (err) {
      console.error(`Error with ${model}:`, err);
    }
  }
}

testHF();
