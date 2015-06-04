var url_generator = require('./url.generator.js'),
    download = require('./download.js');

function init(keyword, outputDir, callback) {
  url_generator(keyword, function(err, urls) {
    console.log("~~~~~~~~~~~~~~" + urls.length + " urls detected for keyword [" + keyword + "]~~~~~~~~~~~~~~");
    urls.forEach(function(url) {
      download(url, outputDir, function(APKdest, htmlPath) {
        callback(APKdest, htmlPath, null);
      })
    })
  });
}

module.exports.init = init;
