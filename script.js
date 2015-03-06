// 1. core modules
var gui     = require('nw.gui')
// var util    = require('util')
var fs      = require('fs')
// var https   = require('https')
var path    = require('path')


// 2. public modules from npm
var os      = require('os-utils')


// 3. Own modules
var configuration = require('./configuration.js')
var translate     = require('./translations/translate.js')


// var $ = require('jquery')
// global.document = window.document;
// global.navigator = window.navigator;
// require('jquery-ui')


// Add os-specific shortcuts and menu
require('./decorate.js').decorate()

global.$ = $


console.log ( '= ' + gui.App.manifest.name + ' v.' + configuration.VERSION + ' ==================================')

gui.Window.get().focus()


// This frame gets dynamically attached and detached as needed.
// HTTP load gets performed on each attach
var login_frame = $('<IFRAME/>')
    .attr('id', 'login_frame')
    .attr('name', 'login_frame')
    .attr('src', configuration.ENTU_API_AUTH)


$( document ).ready(function() {

    var cards         = require('./cards.js')


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
        configuration.ENTU_USER_ID = data.result.id
        configuration.ENTU_SESSION_KEY = data.result.session_key
        console.log('Hello ' + data.result.name)
        // console.log(cards)
        cards.first()
    })


})


var auth_in_progress = false
var checkAuth = function checkAuth(successCallback) {
    if (auth_in_progress)
        return
    auth_in_progress = true

    $.get( configuration.ENTU_API_USER )
        .done(function userOk( data ) {
            auth_in_progress = false
            successCallback(data)
        })
        .fail(function userFail( data ) {
            if ($('#login_frame').length === 0) {
                $('body').append(login_frame)
                $('#login_frame').fadeIn(500)
                $('#login_frame').load( function() {
                    var doc_body = document.getElementById( 'login_frame' ).contentWindow.document.body.innerText
                    try {
                        var result = JSON.parse(doc_body)
                        console.log('Auth page reloaded, user loaded.')
                        auth_in_progress = false
                        $('#login_frame').detach()
                        successCallback(result)
                    } catch (ex) {
                        console.log('Auth page reloaded, user still no avail')
                    }
                })
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
    $('#' + $('.card_label.current').attr('translate')).addClass('current')
}


var loadCard = function loadCard(card_name) {
    $('card').removeClass('current')
    $('.card_label.current').removeClass('current')
    var card_id = card_name + '_card'
    var card_label_id = card_name + '_card_label'
    $('#' + card_label_id).addClass('current')
    $('#' + card_id).addClass('current')
    require('./cards/' + card_name + '.js')
}



