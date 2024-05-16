/**console.l
 * This file acts as the layer between the data and the rest of the project.
 * It provides an interface to interact with the data layer and abstracts away the implementation details.
 * This helps in decoupling the data layer from the rest of the project, making it easier to maintain.
 */

import { sample } from './10_pc_sample';
import { wiki } from './10_pc_wiki'

const BASE_GLOW = 0.4
const BASE_RADIUS = 0.05
const class_map = {
    'O': {
        color: 0xA6BBF6,
        glow: 16 * BASE_GLOW,
        draw_radius: 4 * BASE_RADIUS
    },
    'B': {
        color: 0xA6BBF6,
        glow: 8 * BASE_GLOW,
        draw_radius: 3 * BASE_RADIUS,
    },
    'A': {
        color: 0xA6BBF6,
        glow: 4 * BASE_GLOW,
        draw_radius: 2 * BASE_RADIUS
    },
    'F': {
        color: 0xf8f7ff,
        glow: 2 * BASE_GLOW,
        draw_radius: 1 * BASE_RADIUS,
    },
    'G': {
        color: 0xf8f7ff,
        glow: 1 * BASE_GLOW,
        draw_radius: 1 * BASE_RADIUS
    },
    'K': {
        color: 0xffd2a1,
        glow: 0.8 * BASE_GLOW,
        draw_radius: 0.8 * BASE_RADIUS,
    },
    'M': {
        color: 0xffd2a1,
        glow: 0.5 * BASE_GLOW,
        draw_radius: 0.8 * BASE_RADIUS,
    },
    'WHITE_DWARF': {
        color: 0xFFFFFF,
        glow: 0.2 * BASE_GLOW,
        draw_radius: 0.4 * BASE_RADIUS,
    },
    'BROWN_DWARF': {
        color: 0x851C05,
        glow: 0,
        draw_radius: 0.4 * BASE_RADIUS,
    },
}

export class Star {
    constructor(index) {
        this.index = index;
        this.star = sample[this.index]
        this.systemType = this.getSystemType()
    }

    getSystemType() {
        const spectral_types = Object.values(this.star.objs).filter(s => s.spectral_type).map(s => s.spectral_type.replace(/(>|=|sd|\s)/g, '')[0]);
        const categories = Object.values(this.star.objs).map(s => s.cat.replace('?', ''));

        const most_luminous_spectral_type = Object.keys(class_map).find(c => spectral_types.some(type => type.includes(c)))
        if (most_luminous_spectral_type != undefined)
            return most_luminous_spectral_type

        const is_white_dwarf = categories.some(cat => ['WD', 'D'].includes(cat))
        return is_white_dwarf ? 'WHITE_DWARF' : 'BROWN_DWARF'
    }

    describeSystem() {
        const type_map = {
            'LM': 'low-mass this.star',
            'BD': 'brown dwarf',
            '*': 'main-sequence this.star',
            'WD': 'white dwarf',
        };

        let desc = `<strong>${this.star.name}</strong><br>distance: ${Math.sqrt(this.star.x ** 2 + this.star.y ** 2 + this.star.z ** 2).toFixed(2)} pc`;
        desc += `<br><br>This system consists of the following bodies:<small><br>`
        for (let j in this.star.objs) {
            const obj = this.star.objs[j];
            if (obj.cat.includes('Planet')) continue

            let type = obj.spectral_type ? obj.spectral_type + '-type ' : ''
            type += type_map[obj.cat.replace('?', '')]

            const [mantissa, power] = ('' + obj.luminosity.toExponential(1)).split('e')

            let luminosity = ''
            if (obj.luminosity > 1){
                luminosity = obj.luminosity.toFixed(1)
            }else {
                luminosity = mantissa
                if (power != 0)
                    luminosity += ` × 10<sup>${power}</sup>`
            }


            desc +=
                `<strong>${obj.name.replace('alf', 'α')}</strong>` +
                '<br>class: ' + type +
                (obj.luminosity ? `<br>est. luminosity: ${luminosity} L☉` : '') +
                '<br><br>';
        }

        const wiki_entry = wiki[this.star.name]
        if (wiki_entry) {
            let summary = wiki_entry.summary.replace(/\n/g, '<br><br>')
            desc += `</small><a href=https://en.wikipedia.org/wiki/${wiki_entry.title.replace(/\s/g, '_')}>` + wiki_entry.title + '</a> <small>(Courtesy of Wikipedia)'
            desc += '<br>' + summary + '</small>'
        } else {
            desc += '</small>This minor system does not have a Wikipedia page assosciated with it.'
        }

        return desc
    }

    getSystemDrawColor() {
        return class_map[this.systemType].color
    }

    getSystemDrawRadius() {
        return class_map[this.systemType].draw_radius
    }

    getSystemDrawGlowAmnt() {
        return class_map[this.systemType].glow
    }

    getSystemDrawCoordinates() {
        return { x: this.star.x, y: this.star.y, z: this.star.z }
    }
}

export function keys() {
    return Object.keys(sample)
}

function fuzz(query, test) {
    // TODO: Improve
    query = query.toLowerCase()
    test = test.toLowerCase()
    return query.includes(test) || test.includes(query)
}

export function search(query) {
    let index = keys().find(key => fuzz(query, sample[key].name))
    if (index != undefined) {
        return index
    }

    let target = Object.keys(wiki).filter(key => fuzz(query, wiki[key].title))
    if (target) {
        return keys().find(key => sample[key].name == target)
    }

    index = keys().filter(sys => sys.objs.some(obj => fuzz(query, obj.name)))
    if (index != undefined) {
        return index
    }

    return false
}

export const DEFAULT_INFO = 'Click and drag to rotate.<br>Scroll to zoom.<br><strong>Click</strong> a star for more information.' +
'<br><br><small>This is a 3D visualization of all the nearby stellar systems within 10 parsecs, or 32.6 light years, of us. The various stars are colored according to their spectral type.' +
'The sun is located in the middle; it is also always highlighted by an extra yellow circle.' +
'<br><br>If you\'re lost, try looking for us (the Solar System).' +
'<br>Also, try clicking on <strong>blue</strong> stars. The blue stars are all very luminous;' +
'they can all be seen in the night sky, so they may belong to constellations that you\'re familiar with.' +
'<br><br>Project by Rishi Nath.<br>' +
'<br>Data source: <a href="https://gruze.org/10pc/resources/">The 10 parsec sample in the Gaia era</a>' +
'<br>C. Reylé, K. Jardine, P. Fouqué, J. A. Caballero, R. L. Smart, A. Sozzetti' +
'<br>A&A 650 A201 (2021)' +
'<br>DOI: 10.1051/0004-6361/202140985' +
'<br><br>Lens flare sprite (star.png) courtesy of <a href="https://ps-editors.blogspot.com/2012/02/glowing-stars-png.html">Mohammad Ahsan</a>, 2012.' +
'<br>Glow sprite (glow.png) courtesy of <a href="http://stemkoski.github.io/Three.js/">Lee Stemkoski</a>, 2013.'