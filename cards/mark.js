// 1. core modules


// 2. public modules from npm
var moment = require ('moment')
moment.locale('et')


// 3. Own modules
var configuration = require('../configuration.js')
var translate     = require('../translations/translate.js')

// -(.*)/childs

var refresh = function refresh(group_eid, group_size_div) {
    var participants = $('#group_' + group_eid + ' > .person.select_row > :checked').size()
    // console.log(group_eid)
    var participants_str = participants === 1 ? translate('participant_s', true) : translate('participant_p', true)
    group_size_div.text(participants + ' ' + participants_str)
}

var load = function load() {

    $(':checked.group_select_cb').each(function(){
        var load_group = $(this)
        // var load_group = $(this).attr('eid') + '|' + $(this).attr('name') + ': '

        $.get( configuration['ENTU_API_ENTITY'] + '-' + $(this).attr('eid') + '/childs'  )
            .done(function fetchGroupChildsOk( data ) {
                // console.log(data)
                if (data.count === 0 || !('person' in data.result)) {
                    window.alert(load_group.attr('name') + ' rühmas pole lapsi!')
                    return
                }

                var group_name_div = $('<div id="group_name_' + load_group.attr('eid')
                    + '" eid="' + load_group.attr('eid') + '" class="group_name">')
                group_name_div.text(load_group.attr('name'))

                var group_size_div = $('<div id="group_size_' + load_group.attr('eid') + '" class="group_count">')
                    .text(translate('nobody', true))

                var group_div = $('<div id="group_' + load_group.attr('eid') + '" class=group_div>')
                    .append(group_name_div)
                    .append(group_size_div)

                $('#select_participation').append(group_div)

                // console.log(data.result)
                data.result.person.entities.forEach(function iterateGroupChilds(entu_group_child) {
                    // console.log(load_group.attr('eid') + '|' + load_group.attr('name') + ' ' + entu_group_child.name)
                    group_div.append($('<label for="CB_' + entu_group_child.id + '" class="person select_row"/>')
                        .append($('<input id="CB_' + entu_group_child.id + '" type="checkbox"/>')
                            .on('change', function() {
                                refresh(load_group.attr('eid'), group_size_div)
                            })
                        )
                        .append('<label for="CB_' + entu_group_child.id + '">' + entu_group_child.name + '</label>')
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
