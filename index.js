const app = require("express")();

const Wappalyzer = require('wappalyzer')

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  const { url } = req.query
  
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }
  
  const wappalyzer = new Wappalyzer(options)

  try {
    // let browser = await puppeteer.launch(options);

    await wappalyzer.init()

    const { technologies } = await (await wappalyzer.open(url)).analyze()

    const stackResults = technologies.map(({
      slug, name, icon, website, categories
    }) => {
      const stackCategories = categories.map(({ name }) => name);

      return {
        id: slug, 
        name, icon, website, 
        techCategories: stackCategories
      }
    })
    
    stackResults.length !== 0
      ? res.status(200 || 304).json(stackResults)
      : res.status(200 || 304).json({ stackResults: 'not stack found' })
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
  
  await wappalyzer.destroy()
});

app.listen(process.env.PORT || 3000);

module.exports = app;
