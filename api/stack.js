const Wappalyzer = require('wappalyzer')

const wappalyzer = new Wappalyzer()

module.exports = async (req, res) => {
  const { url } = req.query
  
  const webValidation = /https?:\/\//g;
  
  if (!webValidation.test(url)) {
    res.status(404).send('Please http:// or https:// is required')
  }
  
  try {
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
}
