var configuration = {
  "language": "estonian",
  "cards": ["groups", "mark"],
  "ENTU_URI": 'https://omatsirkus.entu.ee/',
  "kohalolekud_eid": 652
}

configuration['ENTU_API'] = configuration.ENTU_URI + 'api2/'
configuration['ENTU_API_AUTH'] = configuration.ENTU_API + 'user/auth'
configuration['ENTU_API_USER'] = configuration.ENTU_API + 'user'
configuration['ENTU_API_ENTITY'] = configuration.ENTU_API + 'entity'
configuration['ENTU_API_POST_FILE'] = configuration.ENTU_API + 'file'

// console.clear()

console.log('build.7')

$('#groups_rdy_btn').click(function(event) {
    $('#select_participants').removeClass('hide').addClass('show')
    $('#select_groups').removeClass('show').addClass('hide')
    fetchPersons()
    $('#groups_rdy_btn').removeClass('show').addClass('hide')
    $('#back_to_groups_btn').removeClass('hide').addClass('show')
})
$('#back_to_groups_btn').click(function(event) {
    $('#select_groups').removeClass('hide').addClass('show')
    $('#select_participants').removeClass('show').addClass('hide')
    fetchGroups()
    $('#back_to_groups_btn').removeClass('show').addClass('hide')
    $('#groups_rdy_btn').removeClass('hide').addClass('show')
})

$.get( configuration['ENTU_API_USER'] )
    .done(function fetchUserDone( data ) {
        console.log(data)
        $('#user_email').text(data.result.name)
        fetchGroups()
    })
    .fail(function fail( jqXHR, textStatus, error ) {
        console.log( jqXHR.responseJSON, textStatus, error )
        checkAuth(function () {fetchGroups})
        // window.location.assign('https://entu.entu.ee/auth?next=https://omatsirkus.github.io/kohalolekud/')

    })

$('#start_datetime').datetimepicker({
        format: "dd MM yyyy - hh:ii",
        linkField: "mirror_field",
        linkFormat: "yyyy-mm-dd hh:ii"
    })
$('#end_datetime').datetimepicker({
        format: "dd MM yyyy - hh:ii",
        linkField: "mirror_field",
        linkFormat: "yyyy-mm-dd hh:ii"
    })

// $.get( configuration['ENTU_API_ENTITY'] + '?definition=person' )
var fetchPersons = function fetchPersons() {

}

var fetchGroups = function fetchGroups() {
    if ($('#select_groups').children().size() > 0) {
        return
    }
    console.log('Accessing ' + configuration['ENTU_API_ENTITY'] + '?definition=group')
    $.get( configuration['ENTU_API_ENTITY'] + '?definition=group' )
        .done(function fetchGroupsOk( data ) {
            console.log(data)
            data.result.forEach(function iterateGroups(entu_group) {
                // console.log(entu_group)
                var checkbox_div = $('<div for="CB_' + entu_group.id + '" class="checkbox"/>')
                var checkbox_label = $('<label>' + entu_group.name + '</label>')
                var checkbox_input = $('<input type="checkbox" id="CB_' + entu_group.id + '" eid="' + entu_group.id + '" value=""/>')
                checkbox_label.prepend(checkbox_input)
                checkbox_div.append(checkbox_label)
                checkbox_input.on('change', function() {
                    if ($('#select_groups > .checkbox > label > :checked').size() > 0) {
                        $('#groups_rdy_btn').removeClass('hide').addClass('show')
                    } else {
                        $('#groups_rdy_btn').removeClass('show').addClass('hide')
                    }
                })
                $('#select_groups').append(checkbox_div)
            })
        })

}


var login_frame = $('<IFRAME/>')
    .attr('id', 'login_frame')
    .attr('name', 'login_frame')
    .attr('src', configuration.ENTU_API_AUTH)

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
            var load_nr = 0
            if ($('#login_frame').length === 0) {
                $('body').append(login_frame)
                $('#login_frame').fadeIn(500)
                $('#login_frame').load( function() {
                    console.log(document.getElementById( 'login_frame' ))
                    var doc_body = document.getElementById( 'login_frame' ).contentWindow.document.body.innerText
                    try {
                        var result = JSON.parse(doc_body)
                        console.log('Auth page reloaded, user loaded.')
                        auth_in_progress = false
                    //     load_nr ++
                    //     console.log('auth load nr ' + load_nr)
                    // if (load_nr === 1) {
                    //     return
                    // }
                    //     console.log('auth load nr ' + load_nr)
                        $('#login_frame').detach()
                    //     console.log('auth load nr ' + load_nr)
                        successCallback()
                        console.log('successCallback called.')
                    } catch (ex) {
                        console.log('Auth page reloaded, user still no avail')
                    }
                })
            }
        })
}
