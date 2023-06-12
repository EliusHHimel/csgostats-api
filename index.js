const cheerio = require("cheerio");
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

async function getHTML(id) {
    const res = await fetch(`https://csgostats.gg/player/${id}`);
    const data = await res.text();
    return data;
}

async function main() {

    // GET Users API
    app.get('/players/:id', async (req, res) => {
        const id = req.params.id;

        const htmlData = await getHTML(id);
        const html = htmlData.toString();
        const $ = cheerio.load(html, null, false);

        const elements = $(".player-ranks img");
        ;
        const ranks = []
        let st = $(
            'div[style="float:left; width:60%; font-size:34px; color:#fff; line-height:0.75em; text-align:center;"]',
        );

        const statText = st.contents().filter(function() {
            return this.nodeType === 3;
        });
        const statValue = statText.map((_, element) => $(element).text().trim())
            .get().filter((e) => e);

        const statKeys = ["win_rate", "hs_rate", "adr"];
        const statData = {};

        for (let i = 0; i < statKeys.length; i++) {
            statData[statKeys[i]] = statValue[i];
        }
        elements.map((_, element) => {
            let images = $(element).attr("src")
            ranks.push(images)
        });

        res.send( statData);
    })
}

main();

app.get('/', (req, res) => {
    res.send('OMG! IT WORKS')
})

app.listen(port, () => {
    console.log('Running server on port', port)
})