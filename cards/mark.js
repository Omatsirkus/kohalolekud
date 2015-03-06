// 1. core modules


// 2. public modules from npm
var moment = require ('moment')
moment.locale('et')


// 3. Own modules
var configuration = require('../configuration.js')
var translate     = require('../translations/translate.js')

// -(.*)/childs

var refresh = function refresh() {

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

                var group_div = $('<div class=group_div>')
                    .append($('<div class="group_name">').text(load_group.attr('name')))
                $('#select_participation').append(group_div)

                // console.log(data.result)
                data.result.person.entities.forEach(function iterateGroupChilds(entu_group_child) {
                    // console.log(load_group.attr('eid') + '|' + load_group.attr('name') + ' ' + entu_group_child.name)
                    group_div.append($('<label for="CB_' + entu_group_child.id + '" class="person select_row"/>')
                        .append($('<input id="CB_' + entu_group_child.id + '" type="checkbox"/>')
                            .on('change', function() {
                                refresh()
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
