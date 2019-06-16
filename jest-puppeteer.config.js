module.exports = { 
  launch: { 
    headless: true,
    args: [
      '--proxy-server="direct://"',
      '--proxy-bypass-list=*',
      '--no-sandbox'
    ]
  }, 
}