/**
 * This file acts as the layer between the data and the rest of the project.
 * It provides an interface to interact with the data layer and abstracts away the implementation details.
 * This helps in decoupling the data layer from the rest of the project, making it easier to maintain.
 */

import { sample } from './10_pc_sample';
import { wiki } from './10_pc_wiki'

export class Star {
    constructor(index) {
        this.index = index;
        this.star = sample[this.index]
        this.systemType = this.getSystemType()
    }

    getSystemType() {
        console.log(this)

        const spectral_types = Object.values(this.star.objs).filter(s => s.spectral_type).map(s => s.spectral_type.replace(/(>|=|sd|\s)/g, '')[0]);
        const categories = Object.values(this.star.objs).map(s => s.cat.replace('?', ''));
        const primary_type = spectral_types.some(type => ['O', 'B', 'A'].includes(type)) ? 'O_B_A'
        : spectral_types.some(type => ['F', 'G'].includes(type)) ? 'F_G'
        : spectral_types.some(type => ['K', 'M'].includes(type)) ? 'K_M'
        : categories.some(cat => ['WD', 'D'].includes(cat)) ? 'WHITE_DWARF'
        : 'BROWN_DWARF'
        return primary_type
    }

    describeSystem() {
        const type_map = {
            'LM': 'low-mass this.star',
            'BD': 'brown dwarf',
            '*': 'main-sequence this.star',
            'WD': 'white dwarf',
        };


        let desc = `<strong>${this.star.name.replace('alf', 'α')}</strong><br>distance: ${Math.sqrt(this.star.x ** 2 + this.star.y ** 2 + this.star.z ** 2).toFixed(2)} pc`;
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
        const color_map = {
            O_B_A: 0xA6BBF6,
            F_G: 0xf8f7ff,
            K_M: 0xffd2a1,
            WHITE_DWARF: 0xFFFFFF,
            BROWN_DWARF: 0x66323D,
        }

        return color_map[this.systemType]
    }

    getSystemDrawRadius() {
        return this.systemType.includes('DWARF') ? 0.025 : 0.04
    }

    getSystemDrawGlowAmnt() {
        if (this.systemType == 'O_B_A') return 1.5
        if (this.systemType == 'F_G') return 0.5
        if (this.systemType == 'BROWN_DWARF') return 0
        return 0.2
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
'<br><br>Project by Rishi Nath.<br>Source: <a href="https://gruze.org/10pc/resources/">The 10 parsec sample in the Gaia era</a>' +
'<br>C. Reylé, K. Jardine, P. Fouqué, J. A. Caballero, R. L. Smart, A. Sozzetti' +
'<br>A&A 650 A201 (2021)' +
'<br>DOI: 10.1051/0004-6361/202140985'