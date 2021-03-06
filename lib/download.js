var sanitize = require("sanitize-filename"),
    request = require('request'),
    cheerio = require('cheerio'),
    http = require('follow-redirects').http,
    fs = require('fs');

var getHTML = function(url, outputDir, callback) {
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      var title = sanitize($('h2.single-title').text()).replace(/ /g, '').replace(/&/g, '').replace(/\(/g, '').replace(/\)/g, ''),
          htmlPath = outputDir + '/temp-' + title + '-AndroidDrawer.html';

      request(url).pipe(fs.createWriteStream(htmlPath));
      console.log("HTML downloaded from " + url);
      callback(body, title, htmlPath);
    }
    else {
      console.log(url + " has an ERROR");
    }
  });
}

var parseBody = function(html, outputDir, title, htmlPath, callback) {
  $ = cheerio.load(html);
  var links = $('a.download-btn').get();
  var counter = 0;
  links.forEach(function(linkBlock) {
    downloadAPK(linkBlock.attribs.href, title, counter, outputDir, function(dest) {
      callback(dest);
    })
    counter += 1;
  });
}

var downloadAPK = function(url, title, counter, outputDir, cb) {
  var dest = outputDir + '/temp-' + title + '-' + counter + '.apk',
      file = fs.createWriteStream(dest);

  fs.writeFile(dest, '', function(err) {
    if (err) return console.log(err);
  })

  var r = http.get(url, function(response) {
    console.log("Got response: " + response.statusCode + " from " + url);
    response.pipe(file);
    counter += 1;
    file.on('finish', function() {
      console.log("APK Downloaded from " + url);
      file.close(cb(dest));
    });
  }).on('error', function(err) {
    console.log("Uh oh , error getting page");
    fs.unlink(dest);
    if (cb) cb(err.message);
  });
}

var download = function(url, outputDir, callback) {
  getHTML(url, outputDir, function(html, title, htmlPath) {
    parseBody(html, outputDir, title, htmlPath, function(dest) {
      callback(dest, htmlPath);
    });
  });
}

module.exports = download;
module.exports.getHTML = getHTML;
module.exports.downloadAPK = downloadAPK;
