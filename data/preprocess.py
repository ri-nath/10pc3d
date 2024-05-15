import pandas as pd
import numpy as np
import json

import wikipediaapi

wiki_wiki = wikipediaapi.Wikipedia('10pc3d (rishi.nath@gmail.com)', 'en')

# Source: https://gruze.org/10pc/
# The 10 parsec sample in the Gaia era
# C. Reylé, K. Jardine, P. Fouqué, J. A. Caballero, R. L. Smart, A. Sozzetti
# A&A 650 A201 (2021)
# DOI: 10.1051/0004-6361/202140985
df = pd.read_csv('data/10pc_sample_raw.csv')

def star_to_obj(sys_dict, item):
    nb_sys = str(item['NB_SYS'])
    nb_obj = str(item['NB_OBJ'])

    # Distance and x,y,z estimation
    distance = 1e3 / item['PARALLAX']
    alpha, delta = item['RA'], item['DEC']
    x = distance * np.cos(delta) * np.cos(alpha)
    y = distance * np.cos(delta) * np.sin(alpha)
    z = distance * np.sin(delta)

    if nb_sys not in sys_dict:
        sys_dict[nb_sys] = {
            'name': item['SYSTEM_NAME'],
            'x': x,
            'y': y,
            'z': z,
            'objs': {}
        }

    # Luminosity and mass estimation
    G_band = item['G'] if item['G_CODE'] < 10 else item['G_ESTIMATE']
    mag = G_band - 5 * (np.log10(distance) - 1) if not np.isnan(G_band) else np.nan
    luminosity = np.power(10, 0.4 * (5.12 - mag)) if not np.isnan(mag) else np.nan

    sys_dict[nb_sys]['objs'][nb_obj] = {
        'name': item['OBJ_NAME'],
        'cat': item['OBJ_CAT'],
        'spectral_type': item['SP_TYPE'],
        'luminosity': luminosity,
    }

sys_dict = {}
for i in range(df.shape[0]):
    star_to_obj(sys_dict, df.loc[i])

sys_dict['0'] = {
    'name': 'Solar System',
    'x': 0,
    'y': 0,
    'z': 0,
    'objs': {
        '1': {
            'name': 'The Sun',
            'cat': '*',
            'spectral_type': 'G2',
            'luminosity': 1,
        }
    }
}

with open('data/10pc_sample.json', 'w') as fp:
    json.dump(sys_dict, fp)

do_dl_wiki = True
wiki = {}
if do_dl_wiki:
    for i in sys_dict.keys():
        name = sys_dict[i]['name']
        if name not in wiki:
            print('Getting page ' + name)
            page_py = wiki_wiki.page(name
                                    .replace('alf ', 'Alpha_')
                                    .replace('bet ', 'Beta_')
                                    .replace('gam', 'Gamma_')
                                    .replace('eps ', 'Epsilon_')
                                    .replace('del', 'Delta_')
                                    .replace('ksi ', 'Xi_')
                                    .replace('sig ', 'Sigma_'))
            if (page_py.exists()):
                wiki[name] = {
                    'title': page_py.title,
                    'summary': page_py.summary,
                }
            else:
                print('Page ' + name + ' did not exist!')


    with open('data/10pc_wiki.json', 'w') as fp:
        json.dump(wiki, fp)