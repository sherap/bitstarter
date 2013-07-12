#!/usr/bin/env node
/* 
   Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

   References:

   + cheerio
     https://github.com/MatthewMueller/cheerio
     http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
     http://maxogden.com/scraping-with-node.html

   + commander.js
     https://github.com/visionmedia/commander.js
     http://tjholowaychuk.com/post9103188408/commander-js-nodejs-command-line-interfaces-made-easy
     
   + JSON
     http://en.wikipedia.org/wiki/JSON
     https://developer.mozilla.org/en-US/docs/JSON
     https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (! fs.existsSync(instr)) {
        console.log("%s does not exist.  Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function (checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlData = function(htmldata, checksfile) {
    $ = cheerio.load(htmldata);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};


if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json',
                clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', 
                clone(assertFileExists))
        .option('-u, --url <html_url>', 'URL to deployment at herokuapp.com')
        .parse(process.argv);

    // mods for hw3
    // optionally test that URL exists similarly to assertFileExists
    // optionally provide a default URL value
    // + use restler to download the URL
    // decide whether we can reuse checkHtmlFile & if not write new
    // ... Cannot use checkHtmlFile because it is passed a file name
    // ... So we have restler to cheerio impedence
    // + In restler html content arrives in the result passed to a callback.
    // The callback occurs on completion, or on success.
    // (A better implementation may check for an error response.)
    // + Cheerio can take a string of html data with cheerio.load
    // and from there the logic of checkHtmlFile can be reused.

    if (program.file) {
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    } else if (program.url) {
        rest.get(program.url).on('complete', function(result, response) {
            var checkJson = checkHtmlData(result, program.checks);
            var outJson = JSON.stringify(checkJson, null, 4);
            console.log(outJson);
        });
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}



    
     
