/**
 * This file acts as the layer between the data and the rest of the project.
 * It provides an interface to interact with the data layer and abstracts away the implementation details.
 * This helps in decoupling the data layer from the rest of the project, making it easier to maintain.
 */

import { sample } from './10_pc_sample';
import { wiki } from './10_pc_wiki';

export function keys() {
    return Object.keys(sample)
}

const type_map = {
    'LM': 'Low-mass star',
    'BD': 'Brown dwarf',
    '*': 'star',
    'WD': 'White dwarf',
};

/**
 * Generates the description of a star system based on the given index.
 * @param {number} index - The index of the star system.
 * @returns {string} The description of the star system.
 */
export function describeSystem(index) {
    const star = sample[index]
	let desc = `<strong>${star.name.replace('alf', 'α')}</strong><br>distance: ${Math.sqrt(star.x ** 2 + star.y ** 2 + star.z ** 2).toFixed(2)} pc`;
    desc += `<br><br>This system consists of the following bodies:<small><br>`
    for (let j in star.objs) {
        const obj = star.objs[j];
        if (obj.cat.includes('Planet')) continue

        let type = obj.cat.includes('*') ? obj.spectral_type + '-type ' : ''
        type += type_map[obj.cat.replace('?', '')]

        desc +=
            `<strong>${obj.name.replace('alf', 'α')}</strong>` +
            '<br>class: ' + type +
            (obj.luminosity ? `<br>luminosity: ${obj.luminosity.toFixed(3)} L☉` : '') +
			'<br><br>';
    }

	const wiki_entry = wiki[star.name]
	if (wiki_entry) {
		// for (link in wiki_entry.links) {
		// 	summary.replace(link, `<a href="https://en.wikipedia.org/wiki/${link}">${link}</a>`)
		// }

		let summary = wiki_entry.summary.replace(/\n/g, '<br><br>')
		console.log(summary.length, summary[0].length)
		if (summary.length > 1200) {
			summary = summary.substring(0, 1200) + '...'
		}

		desc += `</small><a href=https://en.wikipedia.org/wiki/${wiki_entry.title}>` + wiki_entry.title + '</a> <small>(Courtesy of Wikipedia)'
		desc += '<br>' + summary + '</small>'
	} else {
		desc += '</small>This minor system does not have a Wikipedia page assosciated with it.'
	}

	return desc
}

export const DEFAULT_INFO = 'Click and drag to rotate.<br>Scroll to zoom.<br><strong>Click</strong> a star for more information.' +
'<br><br><small>This is a 3D map of all the nearby stellar systems within 10 parsecs, or 32.6 light years. The sun is located in the middle (zoom all the way in!). Try to find the following:' +
'<br>- Us! The <strong>Solar System</strong>,' +
'<br>- The closest stellar system, <strong>Alpha Centauri</strong>, (α Cen)' +
'<br>- The brightest star in the night sky, <strong>Sirius</strong> (α Canis Majoris A),' +
'<br>- The closest solitary white dwarf, <strong>van Maanen\'s star</strong> (Wolf 28)' +
'<br><br>Project by Rishi Nath.<br>Source: <a href="https://gruze.org/10pc/resources/">The 10 parsec sample in the Gaia era</a>' +
'<br>C. Reylé, K. Jardine, P. Fouqué, J. A. Caballero, R. L. Smart, A. Sozzetti' +
'<br>A&A 650 A201 (2021)' +
'<br>DOI: 10.1051/0004-6361/202140985'

const color_map = {
    O_B_A: 0xA6BBF6,
    F_G: 0xf8f7ff,
    K_M: 0xffd2a1,
    WHITE_DWARF: 0xFFFFFF,
    BROWN_DWARF: 0x66323D,
}

/**
 * Retrieves the primary type of a star system based on its index.
 *
 * @param {number} index - The index of the star system.
 * @returns {string} The primary type of the star system.
 */
function getSystemType(index) {
    const star = sample[index]

    const spectral_types = Object.values(star.objs).filter(s => s.spectral_type).map(s => s.spectral_type.replace(/(>|=|sd|\s)/g, '')[0]);
    const categories = Object.values(star.objs).map(s => s.cat.replace('?', ''));
    const primary_type = spectral_types.some(type => ['O', 'B', 'A'].includes(type)) ? 'O_B_A'
    : spectral_types.some(type => ['F', 'G'].includes(type)) ? 'F_G'
    : spectral_types.some(type => ['K', 'M'].includes(type)) ? 'K_M'
    : categories.some(cat => ['WD', 'D'].includes(cat)) ? 'WHITE_DWARF'
    : 'BROWN_DWARF'
    return primary_type
}

/**
 * Returns the draw color for a system based on its index.
 *
 * @param {number} index - The index of the system.
 * @returns {string} The draw color for the system.
 */
export function getSystemDrawColor(index) {
    const system_type = getSystemType(index)
    return color_map[system_type]
}

/**
 * Calculates the draw radius for a system based on its index.
 *
 * @param {number} index - The index of the system.
 * @returns {number} The draw radius for the system.
 */
export function getSystemDrawRadius(index) {
    const system_type = getSystemType(index)
    return system_type.includes('DWARF') ? 0.025 : 0.04
}

/**
 * Retrieves the drawing coordinates of a system based on its index.
 *
 * @param {number} index - The index of the system.
 * @returns {Object} - The drawing coordinates of the system, in format
 *                     { x: number, y: number, z: number } with units of
 *                     parsecs (pc).
 */
export function getSystemDrawCoordinates(index) {
    const system = sample[index]
    return { x: system.x, y: system.y, z: system.z }
}