var configuration = require('./configuration.js')


var cards = function cards() {
    var lazy_cards = {}
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
    })
    last_card = lazy_cards[last_card_name]

    var setCurrent = function setCurrent(card_name) {
        current_card = lazy_cards[card_name]
        unComplete(current_card)
        unCurrent(current_card.__prev)
        $('#' + card_name + '_card').addClass('current')
    }

    var unCurrent = function unCurrent(card) {
        if (!card) return
        $('#' + card.__name + '_card').removeClass('current').addClass('complete')
        unCurrent(card.__prev)
    }

    var unComplete = function unComplete(card) {
        if (!card) return
        $('#' + card.__name + '_card').removeClass('current').removeClass('complete')
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
            setCurrent(current_card.__next)
        },
        backward: function () {
            setCurrent(current_card.__prev)
        }
    }
}

module.exports = cards()
