/**console.l
 * This file acts as the layer between the data and the rest of the project.
 * It provides an interface to interact with the data layer and abstracts away the implementation details.
 * This helps in decoupling the data layer from the rest of the project, making it easier to maintain.
 */

import { sample } from './10_pc_sample';
import { wiki } from './10_pc_wiki'

const BASE_GLOW = 0.4
const BASE_RADIUS = 0.06
const SOLAR_RADIUS = 3
const class_map = {
    'O': {
        color: 0xA6BBF6,
        glow: 16 * BASE_GLOW,
        draw_radius: 2 * BASE_RADIUS,
        radius: 8.0 * SOLAR_RADIUS,
    },
    'B': {
        color: 0xA6BBF6,
        glow: 8 * BASE_GLOW,
        draw_radius: 2 * BASE_RADIUS,
        radius: 4.0 * SOLAR_RADIUS,
    },
    'A': {
        color: 0xA6BBF6,
        glow: 5 * BASE_GLOW,
        draw_radius: 1.5 * BASE_RADIUS,
        radius: 1.6 * SOLAR_RADIUS,
    },
    'F': {
        color: 0xf8f7ff,
        glow: 2 * BASE_GLOW,
        draw_radius: 1 * BASE_RADIUS,
        radius: 1.25 * SOLAR_RADIUS,
    },
    'G': {
        color: 0xEFE09F,
        glow: 1 * BASE_GLOW,
        draw_radius: 1 * BASE_RADIUS,
        radius: 1.0 * SOLAR_RADIUS
    },
    'K': {
        color: 0xffd2a1,
        glow: 0.8 * BASE_GLOW,
        draw_radius: 0.8 * BASE_RADIUS,
        radius: 0.8 * SOLAR_RADIUS,
    },
    'M': {
        color: 0xF47939,
        glow: 0.3 * BASE_GLOW,
        draw_radius: 0.5 * BASE_RADIUS,
        radius: 0.5 * SOLAR_RADIUS,
    },
    'WHITE_DWARF': {
        color: 0xFFFFFF,
        glow: 0.2 * BASE_GLOW,
        draw_radius: 0.4 * BASE_RADIUS,
        radius: 0.02 * SOLAR_RADIUS,

    },
    'BROWN_DWARF': {
        color: 0x851C05,
        glow: 0,
        draw_radius: 0.4 * BASE_RADIUS,
        radius: 0.1 * SOLAR_RADIUS,
    },
}

export function getType(object) {
    const parsed_spectral_type = object.spectral_type && object.spectral_type.replace(/(>|=|sd|\s)/g, '')[0]
    if (parsed_spectral_type && Object.keys(class_map).includes(parsed_spectral_type)) {
        return parsed_spectral_type
    }
    if (['WD', 'D'].includes(object.cat.replace('?', ''))) {
        return 'WHITE_DWARF'
    }
    return 'BROWN_DWARF'
}

export class Star {
    constructor(index) {
        this.index = index;
        this.star = sample[this.index]
        this.systemType = this.getSystemType()
    }

    getSystemType() {
        const types = Object.values(this.star.objs).map(getType)

        const most_luminous_spectral_type = Object.keys(class_map).find(c => types.includes(c))
        if (most_luminous_spectral_type != undefined)
            return most_luminous_spectral_type
    }

    describeSystem() {
        const br = '<br>'
        const double_br = '<br><br>'

        const type_map = {
            'LM': 'low-mass star',
            'BD': 'brown dwarf',
            '*': 'main-sequence star',
            'WD': 'white dwarf',
        };

        const name = [`<strong>${this.star.name}</strong>`, this.star.id && this.star.id != this.star.name ? ` (${this.star.id})` : ''].join('')
        let d = Math.sqrt(this.star.x ** 2 + this.star.y ** 2 + this.star.z ** 2)
        const distance = `distance: ${d.toFixed(2)} pc (${(d * 3.261598).toFixed(2)} light years)`

        const intro = [name, br, '<small>', distance, '</small>'].join('')

        const format_obj = (obj => {
            let type = obj.spectral_type ? obj.spectral_type + '-class ' : ''
            type += type_map[obj.cat.replace('?', '')]

            const [mantissa, power] = ('' + obj.luminosity.toExponential(1)).split('e')

            let luminosity = obj.luminosity > 1 ? obj.luminosity.toFixed(1) : mantissa
            if (power != 0) {
                luminosity += ` × 10<sup>${power}</sup>`
            }

            const obj_type = getType(obj)
            const dot_radius = class_map[obj_type].radius * 25
            const obj_color = class_map[obj_type].color.toString(16)
            const dot_style = `height: ${dot_radius}px; width: ${dot_radius}px;` +
                `background-color: #${obj_color};` +
                `border-radius: 50%; display: flex;` +
                `justify-content: center; align-items: center;` +
                `color: black; text-align: center;`

            const dot = obj_type.includes('DWARF') || obj_type == 'M'
                ? `<span style="margin: 10px; ${dot_style}"></span>${obj.name}`
                : `<span style="${dot_style}">${obj.name}</span>`

            return `<tr><td style="font-size: x-small; width: 50%;"><strong>${obj.name}</strong>` +
                `<br>class: <span style="color: black; background-color: #${obj_color}">${type}</span>` +
                (obj.luminosity ? `<br>est. luminosity: ${luminosity} L☉` : '') +
                `</td><td style="font-size: xx-small; align-items: center; display: flex; justify-content: center; flex-direction: column;">${dot}</td></tr>`
        })

        const objs = ['<table style="width: 100%;">', ...Object.values(this.star.objs)
                .filter(obj => !obj.cat.includes('Planet'))
                .map(format_obj), '</table>']
                .join('')

        const wiki_entry = wiki[this.star.name]
        let desc = ''
        if (wiki_entry) {
            let summary = wiki_entry.summary
                .replace(/\n/g, '<br><br>')
                .replace(/\s+\(\)\s+/g, ' ')
                .replace('== References ==', '').trim()
            desc += `</small><a href=https://en.wikipedia.org/wiki/${wiki_entry.title.replace(/\s/g, '_')}>` + wiki_entry.title + '</a> <small>(Courtesy of Wikipedia, 2024)'
            desc += '<br>' + summary + '</small>'
        } else {
            desc += '</small>This system does not have a Wikipedia page assosciated with it.'
        }

        return [intro, objs, desc].join(br)
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
'<br><br>Lost? Use the random button (🎲) to go to a random star and learn something cool!' +
'<br>Also, try clicking on <strong>blue</strong> stars. The blue stars are all very luminous;' +
'they can all be seen in the night sky, so they may belong to constellations that you\'re familiar with.' +
'<br><br>Project by Rishi Nath.<br>' +
'<br>Data source: <a href="https://gruze.org/10pc/resources/">The 10 parsec sample in the Gaia era</a>' +
'<br>C. Reylé, K. Jardine, P. Fouqué, J. A. Caballero, R. L. Smart, A. Sozzetti' +
'<br>A&A 650 A201 (2021)' +
'<br>DOI: 10.1051/0004-6361/202140985' +
'<br><br>Lens flare sprite (star.png) courtesy of <a href="https://ps-editors.blogspot.com/2012/02/glowing-stars-png.html">Mohammad Ahsan</a>, 2012.' +
'<br>Glow sprite (glow.png) courtesy of <a href="http://stemkoski.github.io/Three.js/">Lee Stemkoski</a>, 2013.'