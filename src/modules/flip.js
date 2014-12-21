/**
Flip characters upside down.

Usage / sanity tests:

!flip abcdefghijkmnrtvwy ABCDEFGJLMPRTUVY 12345678 ,.?!"\` ()[]{<>&_'
!flip ɐqɔpǝɟƃɥᴉɾʞɯuɹʇʌʍʎ∀qƆpƎℲפſ˥WԀɹ┴∩Λ⅄ƖᄅƐㄣϛ9ㄥ8\˙¿¡,: ,)(][}><⅋‾'
*/
module.exports = function(client, config) {
    "use strict";

    var flipRegex = /^!flip (.+)/;

    var flipMap = {
        'a': 'ɐ',
        'b': 'q',
        'c': 'ɔ',
        'd': 'p',
        'e': 'ǝ',
        'f': 'ɟ',
        'g': 'ƃ',
        'h': 'ɥ',
        'i': 'ᴉ',
        'j': 'ɾ',
        'k': 'ʞ',
        'm': 'ɯ',
        'n': 'u',
        'r': 'ɹ',
        't': 'ʇ',
        'v': 'ʌ',
        'w': 'ʍ',
        'y': 'ʎ',
        'A': '∀',
        'B': 'q',
        'C': 'Ɔ',
        'D': 'p',
        'E': 'Ǝ',
        'F': 'Ⅎ',
        'G': 'פ',
        'J': 'ſ',
        'L': '˥',
        'M': 'W',
        'P': 'Ԁ',
        'R': 'ɹ',
        'T': '┴',
        'U': '∩',
        'V': 'Λ',
        'Y': '⅄',
        '1': 'Ɩ',
        '2': 'ᄅ',
        '3': 'Ɛ',
        '4': 'ㄣ',
        '5': 'ϛ',
        '6': '9',
        '7': 'ㄥ',
        '8': '8',
        ',': '\'',
        '.': '˙',
        '?': '¿',
        '!': '¡',
        '"': ',',
        '\'': ',',
        '`': ',',
        '(': ')',
        ')': '(',
        '[': ']',
        ']': '[',
        '{': '}',
        '<': '>',
        '>': '<',
        '&': '⅋',
        '_': '‾'
    };

    
    function flipString(aString) {
        return aString.split("").map(flipChar).reverse().join("");
    }

    function flipChar(c) {
        return flipMap[c] || unflipMap[c] || c;
    }

    var unflipMap = {};
    for (var k in flipMap) {
        unflipMap[flipMap[k]] = k;
    }
    
    client.addListener('message', function(from, to, message) {
        var match = flipRegex.exec(message);
        if (match) {
            client.say(to, from + ": " + flipString(match[1]));
        }
    });
}

