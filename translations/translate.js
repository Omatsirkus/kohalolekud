var marked          = require('marked')
var fs              = require('fs')
var configuration   = require('../configuration.js')
var translations    = require('./' + configuration.language + '.json')

var tr_dir = './translations/' + configuration.language + '/'

fs.readdirSync(tr_dir).forEach(function scanLanguageFiles(filename) {
    if (filename.substr(-3) === '.md') {
        translations[filename.slice(0,-3)] = fs.readFileSync(tr_dir + filename).toString()
    }
})


// replace_dictionary is optional dictionary for replacing placeholders
//    {"search string":"replace_string"}
var translate = function translate(key, replace_dictionary) {
    if (translations[key] === undefined) return '**(--' + key + '--)**'
    var return_string = translations[key]
    if (replace_dictionary !== undefined) {
        for (var key in replace_dictionary) {
            return_string = return_string.replace('{{' + key + '}}', replace_dictionary[key])
        }
    }
    for (var key in translations) {
        return_string = return_string.replace('{{' + key + '}}', translations[key])
    }
    return marked(return_string)
}

module.exports = translate
