const express = require("express");
const { parse } = require('node-html-parser');

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

async function getHTML(id, retryCount = 5) {
  try {
    const res = await fetch(`https://csgostats.gg/player/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch HTML");
    }
    const data = await res.text();
    return data;
  } catch (error) {
    console.error("Error fetching HTML:", error);
    if (retryCount > 0) {
      console.log(`Retrying... Attempts left: ${retryCount}`);
      return getHTML(id, retryCount - 1);
    } else {
      throw error;
    }
  }
}

app.get("/players/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const htmlData = await getHTML(id);
    const html = htmlData.toString();
    const root = parse(html);
    const rank = root.querySelector('.best .cs2rating');
    if (rank) {
      const rankText = rank.text.trim();
      res.json({ rank: rankText });
    } else {
      res.status(404).json({ error: "Rank not found" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("OMG! IT WORKS");
});

app.listen(port, () => {
  console.log("Running server on port", port);
});

