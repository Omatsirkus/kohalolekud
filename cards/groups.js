// 1. core modules


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


var refresh = function refresh() {
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

    // console.log(duration.asMilliseconds())
    if (duration.asMilliseconds() > 0 && $('.group.select_row > :checked').size() > 0) {
        $('#groups_ready').addClass('show')
    } else {
        $('#groups_ready').removeClass('show')
    }
    return({start: start, end: end})
}

//
// Change events
//
var refreshing = false
$('#kohalolek_start_date, #kohalolek_start_hour, #kohalolek_start_minute').on('change', function() {
    if (refreshing)
        return
    refreshing = true
    var moments = refresh()
    if (moments.end.isBefore(moments.start)) {
        $('#kohalolek_end_date')[0].value = $('#kohalolek_start_date')[0].value
        $('#kohalolek_end_hour')[0].value = $('#kohalolek_start_hour')[0].value
        $('#kohalolek_end_minute')[0].value = $('#kohalolek_start_minute')[0].value
    }
    refreshing = false
    refresh()
})
$('#kohalolek_end_date, #kohalolek_end_hour, #kohalolek_end_minute').on('change', function() {
    if (refreshing)
        return
    refreshing = true
    var moments = refresh()
    if (moments.end.isBefore(moments.start)) {
        $('#kohalolek_start_date')[0].value = $('#kohalolek_end_date')[0].value
        $('#kohalolek_start_hour')[0].value = $('#kohalolek_end_hour')[0].value
        $('#kohalolek_start_minute')[0].value = $('#kohalolek_end_minute')[0].value
    }
    refreshing = false
    refresh()
})



var load = function load() {
    // This function is fired whenever this card gets selected (again)
    //   (gets fired on first load, also)

    $.get( configuration['ENTU_API_ENTITY'] + '?definition=group' )
        .done(function fetchGroupsOk( data ) {

            data.result.forEach(function iterateGroups(entu_group) {
                console.log(entu_group)
                $('#select_groups').append($('<label for="CB_' + entu_group.id + '" class="group select_row"/>')
                    .append($('<input id="CB_' + entu_group.id + '" type="checkbox" eid="' + entu_group.id + '" name="' + entu_group.name + '" class="group_select_cb"/>')
                        .on('change', function() {
                            refresh()
                        })
                        .css('bacground-color', entu_group.color)
                    )
                    .append('<label for="CB_' + entu_group.id + '">' + entu_group.name + '</label>')
                )
            })

            $('#kohalolek_end_hour').focus()
            refresh()
        })
        .fail(function fetchGroupsFail( data ) {
            console.log(data)
        })

    console.log('Groups card loaded')
}
module.exports.load = load