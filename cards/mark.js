// 1. core modules
var gui     = window.gui


// 2. public modules from npm
var moment = require ('moment')
moment.locale('et')


// 3. Own modules
var configuration = require('../configuration.js')
var translate     = require('../translations/translate.js')


var training_session = {eid:undefined, start:undefined, end:undefined, groups:{}, couches:{}, trainees:{}}

var refresh = function refresh(group_eid, checkbox_input, group_size_span) {
    checkbox_input.attr('disabled', true)
    var participants = $('#group_' + group_eid + ' > .group.persons > .person.select_row > :checked').size()
    // console.log(group_eid)
    var participants_str = participants === 1 ? translate('participant_s', true) : translate('participant_p', true)
    group_size_span.text(participants + ' ' + participants_str)
    if (checkbox_input.is(':checked')) {
        // Create new property
        var person_eid = checkbox_input.attr('eid')
        $.ajax({
            url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
            type: 'PUT',
            data: { 'kohalolek-student': person_eid }
        })
            .done(function fail( done ) {
                console.log(done)
                var pid = done.result.properties['kohalolek-student'][0].id
                checkbox_input.attr('pid', pid)
                checkbox_input.removeAttr('disabled')
            })
    } else {
        // Delete existing property
        var pid = checkbox_input.attr('pid')
        var data = {}
        data['kohalolek-student.' + pid] = ''
        $.ajax({
            url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
            type: 'PUT',
            data: data
        })
            .done(function done( done ) {
                console.log(done)
                checkbox_input.removeAttr('pid')
                checkbox_input.removeAttr('disabled')
            })
    }
}


var fetch_groups_in_process = 0
var load = function load() {

    training_session.start = moment($('#kohalolek_start_date')[0].value)
        .add($('#kohalolek_start_hour')[0].value,'h')
        .add($('#kohalolek_start_minute')[0].value,'m')

    $(':checked.group_select_cb').each(function() {
        fetch_groups_in_process ++
        var group_eid = $(this).attr('eid')
        var group_name = $(this).attr('name')
        // Fetch group data
        $.get( configuration['ENTU_API_ENTITY'] + '-' + group_eid )
            .fail(function getGroupDataFailed( data ) {
                console.log( data )
                throw 'Can\'t fetch Group.'
            })
            .done(function getGroupDataDone(data) {
                var properties = data.result.properties
                if (properties.coach.values === undefined) {
                    console.log(properties.coach)
                    window.alert('No coach in ' + group_name + ' group!')
                    gui.Shell.openExternal(configuration.ENTU_URI + 'entity/group/' + group_eid)
                    throw 'No coach in ' + group_name + ' group!'
                }
                training_session.groups[group_eid] = {
                    id          : group_eid,
                    name        : group_name,
                    color       : properties.color.values ? properties.color.values[0].id : '#fff',
                    coach_id    : properties.coach.values[0].db_value,
                    coach_name  : properties.coach.values[0].value
                }
                training_session.couches[properties.coach.values[0].db_value] = {
                    name        : properties.coach.values[0].value
                }
                $.get( )
                if (--fetch_groups_in_process === 0) {
                    // console.log(training_session)
                }
            })
    })

    // Create "kohalolek" entity under configuration.kohalolekud_eid
    //   if I have enough privileges

    $.get( configuration['ENTU_API_ENTITY'] + '-' + configuration.kohalolekud_eid )
        .done(function fetchFolder( data ) {
            // console.log(data.result)
            // Check privileges on "kohalolekud" folder
            if (['owner','editor','expander'].indexOf(data.result.right) > -1) {
                // Access level OK, create "kohalolek"
                var post_data = {'definition': 'kohalolek'}
                $.post(configuration['ENTU_API_ENTITY'] + '-' + configuration.kohalolekud_eid, post_data, function(returned_data) {
                    training_session.eid = returned_data.result.id
                    // Add single properties
                    $.ajax({
                        url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
                        type: 'PUT',
                        data: { 'kohalolek-algus'       : training_session.start.format('YYYY-MM-DD HH:mm'),
                                'kohalolek-coach'       : configuration.ENTU_USER_ID,
                              }
                    })
                    .fail(function fail( jqXHR, textStatus, error ) {
                        console.log( jqXHR, textStatus, error )
                    })
                    // Add "group" listproperty
                    for (group_eid in training_session.groups) {
                        $.ajax({
                            url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
                            type: 'PUT',
                            data: { 'kohalolek-group'       : group_eid }
                        })
                    }
                })

            } else {
                console.log(data.result.right + ' is not enough privileges on entity ' + configuration.kohalolekud_eid)
            }
        })
        .fail(function fetchFolder( data ) {
            console.log( data )
            throw 'Cant fetch root folder.'
        })



    //  TODO: use group_eids array instead of $(':checked.group_select_cb')
    $(':checked.group_select_cb').each(function(){
        var load_group = $(this)
        var load_group_eid = load_group.attr('eid')
        var load_group_name = load_group.attr('name')
        // var load_group = $(this).attr('eid') + '|' + $(this).attr('name') + ': '

        $.get( configuration['ENTU_API_ENTITY'] + '-' + $(this).attr('eid') + '/childs'  )
            .done(function fetchGroupChildsOk( data ) {
                // console.log(data)
                if (data.count === 0 || !('person' in data.result)) {
                    window.alert(load_group_name + ' rühmas pole lapsi!')
                    return
                }

                var group_div = $('<div id="group_' + load_group_eid
                    + '" eid="' + load_group_eid + '" class="group div">')
                $('#select_participation').append(group_div)

                var group_header_div = $('<div id="group_header_' + load_group_eid
                    + '" eid="' + load_group_eid + '" class="group header">')
                group_div.append(group_header_div)

                var group_name_span = $('<span id="group_name_' + load_group_eid
                    + '" eid="' + load_group_eid + '" class="group name">'
                    + load_group_name + '</span>')
                group_header_div.append(group_name_span)

                var group_time_span = $('<span id="group_time_' + load_group_eid
                    + '" eid="' + load_group_eid + '" class="group time">'
                    + training_session.start.format('dddd, Do MMMM, YYYY, HH:mm') + '</span>')
                group_header_div.append(group_time_span)

                var group_size_span = $('<span id="group_size_' + load_group_eid
                    + '" eid="' + load_group_eid + '" class="group size">')
                    .text(translate('nobody', true))
                group_header_div.append(group_size_span)

                var group_persons_div = $('<div id="group_persons_' + load_group_eid
                    + '" eid="' + load_group_eid + '" class="group persons">')
                group_div.append(group_persons_div)


                data.result.person.entities.forEach(function iterateGroupChilds(entu_group_child) {
                    var person_eid = entu_group_child.id
                    var person_name = entu_group_child.name
                    var checkbox_input = $('<input id="CB_' + person_eid + '" eid="' + person_eid + '" type="checkbox"/>')
                    checkbox_input.on('change', function() {
                        refresh(load_group_eid, checkbox_input, group_size_span)
                    })
                    var checkbox_label = $('<label for="CB_' + person_eid + '">' + person_name + '</label>')
                    group_persons_div.append($('<label for="CB_' + person_eid + '" class="person select_row"/>')
                        .append(checkbox_input)
                        .append(checkbox_label)
                    )
                })
            })
            .fail(function fetchGroupChildssFail( data ) {
                console.log(data)
            })
    })

    console.log('hello, im loaded')
}

module.exports.load = load
