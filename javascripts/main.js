var configuration = {
  "hour_minutes": 45,
  "language": "estonian",
  "cards": ["groups", "mark"],
  "ENTU_URI": 'https://devm.entu.ee/',
  "kohalolekud_eid": 652
}

configuration['ENTU_API'] = configuration.ENTU_URI + 'api2/'
configuration['ENTU_API_AUTH'] = configuration.ENTU_API + 'user/auth'
configuration['ENTU_API_USER'] = configuration.ENTU_API + 'user'
configuration['ENTU_API_ENTITY'] = configuration.ENTU_API + 'entity'
configuration['ENTU_API_POST_FILE'] = configuration.ENTU_API + 'file'

// console.clear()


var training_session = {eid:undefined, start:undefined, duration_hours:undefined, groups:{}, coaches:{}, trainees:{}}

var addEntuCoach = function addEntuCoach(coach_eid) {
    $.ajax({
        url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
        type: 'PUT',
        data: { 'kohalolek-coach'       : coach_eid }
    })
    .done(function done( data ) {
        console.log( 'Success:', data )
    })
    .fail(function fail( jqXHR, textStatus, error ) {
        console.log( jqXHR, textStatus, error )
    })
}

var addEntuGroup = function addEntuGroup(group_eid) {
    $.ajax({
        url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
        type: 'PUT',
        data: { 'kohalolek-group'       : group_eid }
    })
    .done(function done( data ) {
        console.log( 'Success:', data )
        training_session.groups[group_eid] = { pid: data.result.properties['kohalolek-group'][0].id }
    })
    .fail(function fail( jqXHR, textStatus, error ) {
        console.log( jqXHR, textStatus, error )
    })
}

var addEntuTrainee = function addEntuTrainee(trainee_eid) {
    $.ajax({
        url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
        type: 'PUT',
        data: { 'kohalolek-student'       : trainee_eid }
    })
    .done(function done( data ) {
        console.log( 'Success:', data )
        training_session.trainees[trainee_eid] = { pid: data.result.properties['kohalolek-student'][0].id }
    })
    .fail(function fail( jqXHR, textStatus, error ) {
        console.log( jqXHR, textStatus, error )
    })
}

var removeEntuProperty = function removeEntuProperty(entu_property) {
    console.log( 'Removing property ' + entu_property)
    var data = {}
    data[entu_property] = null
    $.ajax({
        url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
        type: 'PUT',
        data: data
    })
    .done(function done( data ) {
        console.log( 'Success:', data )
    })
    .fail(function fail( jqXHR, textStatus, error ) {
        console.log( jqXHR, textStatus, error )
    })
}

var removeEntuGroup = function removeEntuGroup(group_eid) {
    var entu_property = 'kohalolek-group.' + training_session.groups[group_eid]['pid']
    removeEntuProperty(entu_property)
}

var removeEntuTrainee = function removeEntuTrainee(trainee_eid) {
    var entu_property = 'kohalolek-student.' + training_session.trainees[trainee_eid]['pid']
    removeEntuProperty(entu_property)
}

var addEntuKohalolek = function addEntuKohalolek(successCallback) {
    var post_data = {'definition': 'kohalolek'}
    console.log(configuration['ENTU_API_ENTITY'] + '-' + configuration.kohalolekud_eid)
    $.post((configuration['ENTU_API_ENTITY'] + '-' + configuration.kohalolekud_eid), post_data, function(returned_data) {
        training_session.eid = returned_data.result.id
        console.log(returned_data.result.id)
        console.log(training_session.eid)
        addEntuCoach(configuration.ENTU_USER_ID)
        successCallback()
        $('#entu_link').append('<a href="' + configuration.ENTU_URI + 'entity/kohalolek/' + returned_data.result.id + '" target="entu_link">Link Entusse</a>')
    })
    .fail(function fail( jqXHR, textStatus, error ) {
        console.log( jqXHR, textStatus, error )
    })
}

var addEntuStartTime = function addEntuStartTime(start_datetime) {
    if (training_session.start !== undefined) {
        var entu_property = 'kohalolek-algus.' + training_session.start['pid']
        removeEntuProperty(entu_property)
    }
    start_datetime = start_datetime.toJSON().replace('T',' ').slice(0, 16)
    $.ajax({
        url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
        type: 'PUT',
        data: { 'kohalolek-algus'       : start_datetime }
    })
    .done(function done( data ) {
        console.log( 'Success:', data )
        training_session.start = { pid: data.result.properties['kohalolek-algus'][0].id }
    })
    .fail(function fail( jqXHR, textStatus, error ) {
        console.log( jqXHR, textStatus, error )
    })
}

var addEntuDuration = function addEntuDuration(duration_hours) {
    if (training_session.duration_hours !== undefined) {
        var entu_property = 'kohalolek-tunde.' + training_session.duration_hours['pid']
        removeEntuProperty(entu_property)
    }
    $.ajax({
        url: configuration['ENTU_API_ENTITY'] + '-' + training_session.eid,
        type: 'PUT',
        data: { 'kohalolek-tunde'       : duration_hours }
    })
    .done(function done( data ) {
        console.log( 'Success:', data )
        training_session.duration_hours = { pid: data.result.properties['kohalolek-tunde'][0].id }
    })
    .fail(function fail( jqXHR, textStatus, error ) {
        console.log( jqXHR, textStatus, error )
    })
}

var refreshEndDatetime = function refreshEndDatetime( gettime ) {
    start_d = new Date()
    start_d.setTime(gettime)
    $('#start_datetime').attr('gettime', gettime)
    $('#start_datetime').attr('data-date', start_d.toJSON())
    $('.datetimepicker').first().css('display','none')

    // var hours = Number($('#hours_num')[0].value)
    var minutes = Number($('[name="durationOptions"]:checked').val())
    var duration_ms = minutes * 60 * 1000 + gettime
    var duration_hours = minutes / 60

    $('.group.time').each(function () {$(this).text(start_d.toJSON().replace('T',' ').slice(0,16))})

    if (training_session.eid === undefined) {
        addEntuKohalolek(function successCallback() {
            addEntuStartTime(start_d)
            addEntuDuration(duration_hours)
        })
    } else {
        addEntuStartTime(start_d)
            addEntuDuration(duration_hours)
    }

}


console.log('build.9')

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

$('#start_datetime')
    .datetimepicker({
        format: "yyyy-mm-dd hh:ii",
        linkField: "mirror_field1",
        linkFormat: "yyyy-mm-dd hh:ii"
    })
    .on('changeDate', function(ev) {
        refreshEndDatetime(ev.date.valueOf())
    })
$('[name="durationOptions"]').change(function() {
    if ($('#start_datetime').attr('gettime') !== undefined)
        refreshEndDatetime(Number($('#start_datetime').attr('gettime')))
})

$.get( configuration['ENTU_API_USER'] )
    .done(function fetchUserDone( data ) {
        $('#user_email').text(data.result.name)
        $('#hours').show('slow')
        $('#datetime').show('slow')
        // console.log(data.result.id)
        configuration['ENTU_USER_ID'] = data.result.id
        fetchGroups()
    })
    .fail(function fail( jqXHR, textStatus ) {
        console.log( jqXHR.responseJSON, textStatus )
        checkAuth(function fetchUserDone( data ) {
            $('#user_email').text(data.result.name)
            fetchGroups()
        })
        // window.location.assign('https://entu.entu.ee/auth?next=https://omatsirkus.github.io/kohalolekud/')

    })


// $.get( configuration['ENTU_API_ENTITY'] + '?definition=person' )
var fetchPersons = function fetchPersons() {
    var groups = $('#select_groups > .CB > label > :checked')
    var number_of_entu_connections = 0

    var fetchCoaches = function fetchCoaches() {
        $('#select_coaches').empty()

        groups.each(function() {
            number_of_entu_connections ++
            var group_eid = $(this).attr('eid')
            var group_name = $(this).attr('name')
            // Fetch group data
            $.get( configuration['ENTU_API_ENTITY'] + '-' + group_eid )
                .fail(function getGroupDataFailed( data ) {
                    // console.log( data )
                    throw 'Can\'t fetch Group ' + group_eid
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
                    training_session.coaches[properties.coach.values[0].db_value] = {
                        name        : properties.coach.values[0].value
                    }

                    if (--number_of_entu_connections === 0) {
                        console.log(training_session)
                    }
                })
        })
    }

    var fetchTrainees = function fetchTrainees() {
        $('#select_trainees').empty()

        groups.each(function() {
            number_of_entu_connections ++
            var group_eid = $(this).attr('eid')
            var group_name = $(this).attr('name')

            $.get( configuration['ENTU_API_ENTITY'] + '-' + group_eid + '/childs'  )
                .fail(function fetchTraineesFail( data ) {
                    console.log(data)
                    throw ('Failed fetching trainees for group ' + group_eid)
                })
                .done(function fetchTraineesDone( data ) {
                    // console.log(data)
                    if (data.count === 0 || !('person' in data.result)) {
                        throw ('No trainees in group ' + group_eid)
                        window.alert(group_name + ' rühmas pole lapsi!')
                        return
                    }

                    var group_div = $('<div id="group_' + group_eid
                        + '" eid="' + group_eid + '" class="group div">')
                    $('#select_trainees').append(group_div)

                    var group_header_div = $('<div id="group_header_' + group_eid
                        + '" eid="' + group_eid + '" class="group header row">')
                    group_div.append(group_header_div)

                    var group_name_span = $('<span id="group_name_' + group_eid
                        + '" eid="' + group_eid + '" class="group name col-xs-2">'
                        + group_name + '</span>')
                    group_header_div.append(group_name_span)

                    var group_time_span = $('<span id="group_time_' + group_eid
                        + '" eid="' + group_eid + '" class="group time col-xs-2">'
                        + $('#start_datetime > input')[0].value + '</span>')
                    group_header_div.append(group_time_span)

                    var group_size_span = $('<span id="group_size_' + group_eid
                        + '" eid="' + group_eid + '" class="group size col-xs-2">')
                        .text('Ei kedagi')
                    group_header_div.append(group_size_span)

                    var group_persons_div = $('<div id="group_persons_' + group_eid
                        + '" eid="' + group_eid + '" class="group persons row">')
                    group_div.append(group_persons_div)


                    data.result.person.entities.forEach(function iterateGroupChilds(entu_group_child) {
                        var person_eid = entu_group_child.id
                        var person_name = entu_group_child.name
                        var checkbox_input = $('<input id="CB_' + person_eid + '" eid="' + person_eid + '" type="checkbox"/>')
                        checkbox_input.on('change', function() {

                            var trainee_eid = checkbox_input.attr('eid')
                            if (checkbox_input.is(':checked')) {
                                addEntuTrainee(trainee_eid)
                            } else {
                                removeEntuTrainee(trainee_eid)
                            }

                        })
                        var checkbox_label = $('<label for="CB_' + person_eid + '">' + person_name + '</label>')
                        group_persons_div.append($('<label for="CB_' + person_eid + '" class="person select_row col-xs-6 col-sm-4 col-md-3 col-lg-3"/>')
                            .append(checkbox_input)
                            .append(checkbox_label)
                        )
                    })
                    if (--number_of_entu_connections === 0) {
                        console.log(training_session)
                    }
                })
        })
    }

    fetchGroups()
    fetchTrainees()
}

var fetchGroups = function fetchGroups() {
    if ($('#select_groups').children().size() > 0) {
        return
    }

    $.get( configuration['ENTU_API_ENTITY'] + '-' + configuration.kohalolekud_eid )
        .done(function fetchFolder( data ) {
            // Check privileges on "kohalolekud" folder
            if (['owner','editor','expander'].indexOf(data.result.right) === -1) {
                console.log(data.result.right + ' is not enough privileges on entity ' + configuration.kohalolekud_eid)
                throw ('Not enough privileges on entity ' + configuration.kohalolekud_eid)
                alert ('Not enough privileges on entity ' + configuration.kohalolekud_eid)
            }

        })
        .fail(function fetchFolder( data ) {
            throw 'Cant fetch root folder.'
        })


    console.log('Accessing ' + configuration['ENTU_API_ENTITY'] + '?definition=group')
    $.get( configuration['ENTU_API_ENTITY'] + '?definition=group' )
        .done(function fetchGroupsOk( data ) {
            // console.log(data)
            data.result.forEach(function iterateGroups(entu_group) {
                // console.log(entu_group)
                var checkbox_div = $('<div for="CB_' + entu_group.id + '" class="CB col-xs-6 col-sm-4 col-md-3 col-lg-3"/>')
                var checkbox_label = $('<label>' + entu_group.name + '</label>')
                var checkbox_input = $('<input type="checkbox" id="CB_' + entu_group.id + '" eid="' + entu_group.id + '" name="' + entu_group.name + '" value=""/>')
                checkbox_label.prepend(checkbox_input)
                checkbox_div.append(checkbox_label)
                checkbox_input.on('change', function() {
                    if ($('#select_groups > .CB > label > :checked').size() > 0) {
                        $('#groups_rdy_btn').removeClass('hide').addClass('show')
                    } else {
                        alert('Ei saa viimast rühma maha võtta!')
                        checkbox_input.prop('checked', true);
                    }
                    var group_eid = checkbox_input.attr('eid')
                    if (training_session.eid === undefined) {
                        addEntuKohalolek(function successCallback() {
                            addEntuGroup(group_eid)
                        })
                    } else if (checkbox_input.is(':checked')) {
                        addEntuGroup(group_eid)
                    } else {
                        removeEntuGroup(group_eid)
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

    alert("Page host is " + window.location.href)
    $.get( configuration.ENTU_API_USER )
        .done(function userOk( data ) {
            auth_in_progress = false
            $('#hours').show('slow')
            $('#datetime').show('slow')
            console.log(data)
            successCallback(data)
        })
        .fail(function userFail( data ) {
            console.log(data)

            alert("Hash: " + window.location.hash)
            if (window.location.hash !== 'authenticated') {
                var my_random_string = 'abababababababababababababababababababababababababababababab'
                window.sessionStorage.setItem('my_random_string', my_random_string)

                $.post( configuration.ENTU_API_AUTH, {'state': window.sessionStorage.getItem('my_random_string'), 'redirect_url': window.location.href + "#authenticated"} )
                    .fail(function authFail( data ) {
                        console.log(data)
                    })
                    .done(function authDone( data ) {
                        if (window.sessionStorage.getItem('my_random_string') !== data.state) {
                            alert('Security breach!')
                            return
                        }
                        console.log(data)
                        window.sessionStorage.setItem('auth_url', data.auth_url)
                        window.location.assign(data.auth_url)
                    })
            } else { // window.location.hash === 'authenticated'
                $.post( window.location.getItem('auth_url'), {'state': window.sessionStorage.getItem('my_random_string')} )
                    .fail(function authFail( data ) {
                        console.log(data)
                    })
                    .done(function authDone( data ) {
                        console.log(data)
                    })
            }














            // alert('redirecting')
            // window.location.assign('https://entu.entu.ee/auth?next=' + configuration.ENTU_URI + 'static/kohalolek/')
            // var load_nr = 0
            // if ($('#login_frame').length === 0) {
            //     $('body').prepend(login_frame)
            //     $('#login_frame').fadeIn(500)
            //     $('#container').hide('fast')
            //     $('#login_frame').load( function() {
            //         console.log(document.getElementById( 'login_frame' ).valueOf())
            //         var doc_body = document.getElementById( 'login_frame' ).contentWindow.document.body.innerText
            //         try {
            //             var result = JSON.parse(doc_body)
            //             console.log(result)
            //             console.log('Auth page reloaded, user loaded.')
            //             auth_in_progress = false
            //             $('#login_frame').detach()
            //             $('#container').show('fast')
            //             checkAuth(successCallback)
            //             console.log('successCallback passed for new check.')
            //         } catch (ex) {
            //             console.log('Auth page reloaded, user still no avail')
            //         }
            //     })
            // }
        })
}
