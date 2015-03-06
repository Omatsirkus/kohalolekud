// 1. core modules
// var util    = require('util')
// var https   = require('https')


// 2. public modules from npm
var moment = require ('moment')
moment.locale('et')


// 3. Own modules
var configuration = require('../configuration.js')
var translate     = require('../translations/translate.js')


var d = new Date()
var today = d.toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '').split(' ')[0]
$('#kohalolek_start_date')[0].value = $('#kohalolek_end_date')[0].value = today
$('#kohalolek_start_hour')[0].value = d.getHours()
$('#kohalolek_end_hour')[0].value = d.getHours() + 1
$('#kohalolek_start_minute')[0].value = $('#kohalolek_end_minute')[0].value = 0


var refreshDuration = function refreshDuration() {
    $('[for=kohalolek_start_date] > span').append($('#kohalolek_start_iso'))
    $('[for=kohalolek_end_date] > span').append($('#kohalolek_end_iso'))

    var start = moment($('#kohalolek_start_date')[0].value)
        .add($('#kohalolek_start_hour')[0].value,'h')
        .add($('#kohalolek_start_minute')[0].value,'m')
    var end = moment($('#kohalolek_end_date')[0].value)
        .add($('#kohalolek_end_hour')[0].value,'h')
        .add($('#kohalolek_end_minute')[0].value,'m')

    $('#kohalolek_start_iso').text(start.calendar())
    $('#kohalolek_end_iso').text(end.calendar())

    var duration = moment.duration(end.valueOf() - start.valueOf())
    $('#kohalolek_duration').text(duration.humanize())

    return({start: start, end: end})
}

var refreshing = false
$('#kohalolek_start_date, #kohalolek_start_hour, #kohalolek_start_minute').on('change', function() {
    if (refreshing)
        return
    refreshing = true
    var moments = refreshDuration()
    if (moments.end.isBefore(moments.start)) {
        $('#kohalolek_end_date')[0].value = $('#kohalolek_start_date')[0].value
        $('#kohalolek_end_hour')[0].value = $('#kohalolek_start_hour')[0].value
        $('#kohalolek_end_minute')[0].value = $('#kohalolek_start_minute')[0].value
    }
    refreshing = false
    refreshDuration()
})
$('#kohalolek_end_date, #kohalolek_end_hour, #kohalolek_end_minute').on('change', function() {
    if (refreshing)
        return
    refreshing = true
    var moments = refreshDuration()
    if (moments.end.isBefore(moments.start)) {
        $('#kohalolek_start_date')[0].value = $('#kohalolek_end_date')[0].value
        $('#kohalolek_start_hour')[0].value = $('#kohalolek_end_hour')[0].value
        $('#kohalolek_start_minute')[0].value = $('#kohalolek_end_minute')[0].value
    }
    refreshing = false
    refreshDuration()
})



$.get( configuration['ENTU_API_ENTITY'] + '?definition=group' )
    .done(function fetchGroupsOk( data ) {

        $('#kohalolek_start_date').focus()

        data.result.forEach(function iterateGroups(entu_group) {
            // console.log(entu_group)
            $('#select_groups').append($('<label for="CB_' + entu_group.id + '" class="row"/>')
                .append('<input id="CB_' + entu_group.id + '" type="checkbox"/>')
                .append('<label for="CB_' + entu_group.id + '">' + entu_group.name + '</label>')
            )
        })
    })
    .fail(function fetchGroupsFail( data ) {
        console.log(data)
    })
