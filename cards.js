var configuration = require('./configuration.js')
var translate     = require('./translations/translate.js')


var lazy_cards = {}
var cards = function cards() {
    var first_card, last_card, current_card

    var last_card_name = undefined
    configuration.cards.forEach(function cardLoop(card_name) {
        lazy_cards[card_name] = require('./cards/' + card_name + '.js')
        lazy_cards[card_name]['__name'] = card_name
        if (last_card_name === undefined) {
            first_card = lazy_cards[card_name]
        } else {
            lazy_cards[card_name]['__prev'] = lazy_cards[last_card_name]
            lazy_cards[last_card_name]['__next'] = lazy_cards[card_name]
        }
        last_card_name = card_name

        $('#ready_buttons').append($('<td id="' + card_name + '_ready" class="ready_button">')
            .text(translate(card_name + '_ready', true))
            .click(function rdyBtnPush() {
                setCurrent(current_card.__next.__name)
            })
        )
    })
    last_card = lazy_cards[last_card_name]

    var setCurrent = function setCurrent(card_name) {
        current_card = lazy_cards[card_name]
        unComplete(current_card)
        console.log(current_card.__name)
        if ('__prev' in current_card)
            unCurrent(current_card.__prev)
        $('#' + card_name + '_card_label').addClass('current')
        $('#' + card_name + '_card').addClass('current')
        console.log(current_card)
        current_card.load()
    }

    var unCurrent = function unCurrent(card) {
        if (!card) return
        $('#' + card.__name + '_card_label').removeClass('current').addClass('complete')
        $('#' + card.__name + '_ready').removeClass('show')
        $('#' + card.__name + '_card').removeClass('current').addClass('complete')
        if ('__prev' in current_card)
            unCurrent(card.__prev)
    }

    var unComplete = function unComplete(card) {
        if (!card) return
        $('#' + card.__name + '_card_label').removeClass('current').removeClass('complete')
        $('#' + card.__name + '_card').removeClass('current').removeClass('complete')
        if ('__next' in current_card)
            unComplete(card.__next)
    }

    return {
        first: function() {
            setCurrent(first_card.__name)
        },
        last: function() {
            setCurrent(last_card.__name)
        },
        load: function(card_name) {
            setCurrent(card_name)
        },
        forward: function () {
            if ('__next' in current_card)
                setCurrent(current_card.__next.__name)
            else return false
        },
        backward: function () {
            if ('__prev' in current_card)
                setCurrent(current_card.__prev.__name)
            else return false
        }
    }
}

module.exports = cards()
