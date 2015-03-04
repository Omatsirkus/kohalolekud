// 1. core modules
var gui     = require('nw.gui')
var util    = require('util')
var fs      = require('fs')
var https   = require('https')
var path    = require('path')


// 2. public modules from npm
var os      = require('os-utils')


// 3. Own modules
var configuration = require('./configuration.json')
var translate     = require('./translations/translate.js')


// 4. And configuration


// Add os-specific shortcuts and menu
require('./decorate.js').decorate()


global.$ = $


__VERSION = gui.App.manifest.version
ENTU_URI = 'https://omatsirkus.entu.ee/'
ENTU_API = ENTU_URI + 'api2/'
ENTU_API_AUTH = ENTU_API + 'user/auth'
ENTU_API_USER = ENTU_API + 'user'
ENTU_API_ENTITY = ENTU_API + 'entity-'
ENTU_API_POST_FILE = ENTU_API + 'file'


console.log ( '= ' + gui.App.manifest.name + ' v.' + __VERSION + ' ==================================')

gui.Window.get().focus()

gui.Window.get().on('focus', function() {
    checkAuth(function(data) {
        ENTU_USER_ID = data.result.id
        ENTU_SESSION_KEY = data.result.session_key
    })
})


gui.Window.get().on('resize', function(width, height) {
    $('#card_contents').height($(window).height() - 100)
})


// This frame get dynamically attached and detached as needed.
// HTTP load gets performed on each attach
var login_frame = $('<IFRAME/>')
    .attr('id', 'login_frame')
    .attr('src', ENTU_URI)


$( document ).ready(function() {

    // Update contents of all DOM elements with [translate] attribute
    // ie. <div translate="HelloWorld"></div> becomes <div>Hello, world!</div>
    $('[translate]').each(function() {
        $(this).html(translate($(this).attr('translate')))
    })

    // Create application home folder if its not there allready.
    // For logging and persistency.
    var meta_path = path.resolve(homePath(), gui.App.manifest.name)
    if (!fs.existsSync(meta_path)) fs.mkdir(meta_path)

    // Make sure user has access to Entu
    //   and load user interface
    checkAuth(function successCallback(data) {
        ENTU_USER_ID = data.result.id
        ENTU_SESSION_KEY = data.result.session_key
        loadCard('hello')
    })

})


var auth_in_progress = false
var checkAuth = function checkAuth(callback) {
    if (auth_in_progress)
        return
    auth_in_progress = true
    console.log('Check user from Entu.')
    $.get( ENTU_API_USER )
        .done(function userOk( data ) {
            if ($('#login_frame').length > 0) {
                $('#login_frame').detach()
            }
            auth_in_progress = false
            callback(data)
        })
        .fail(function userFail( data ) {
            console.log('Auth failed, trying again...')
            setTimeout(function(){
                auth_in_progress = false
                checkAuth(callback)
            }, 300)
            if ($('#login_frame').length === 0) {
                $('body').append(login_frame)
                $('#login_frame').fadeIn(500)
            }
        })
}

var homePath = function homePath() {
    var home_path = ''
    if (process.env.HOME !== undefined) {
        home_path = process.env.HOME
    } else if (process.env.HOMEPATH !== undefined) {
        home_path = process.env.HOMEDRIVE + process.env.HOMEPATH
    }
    return path.normalize(home_path)
}

var advanceToNextCard = function advanceToNextCard() {
    $('card').removeClass('current')
    $('.card_label.current').removeClass('current').addClass('complete').next().addClass('current')
    $('#' + $('.card_label.current').attr('translate') ).addClass('current')
}

var loadCard = function loadCard(card_name) {
    $('card').removeClass('current')
    $('.card_label.current').removeClass('current')
    var card_id = card_name + '_card'
    var card_label_id = card_name + '_card_label'
    $('#' + card_label_id).addClass('current')
    $('#' + card_id).addClass('current')
}



