import pandas as pd
import numpy as np
import json

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
    G_band = item['G'] or item['G_ESTIMATE']
    mag = G_band - 5 * (np.log10(distance) - 1) if G_band else np.nan
    luminosity = np.power(10, 0.4 * (4.67 - mag)) if mag else np.nan
    mass = np.power(luminosity, 1 / 3.5) if luminosity else np.nan

    sys_dict[nb_sys]['objs'][nb_obj] = {
        'name': item['OBJ_NAME'],
        'cat': item['OBJ_CAT'],
        'spectral_type': item['SP_TYPE'],
        'luminosity': luminosity,
        'mass': mass
    }

sys_dict = {}
for i in range(df.shape[0]):
    star_to_obj(sys_dict, df.loc[i])

sys_dict['0'] = {
    'name': 'Sol',
    'x': 0,
    'y': 0,
    'z': 0,
    'objs': {
        '1': {
            'name': 'Sol',
            'cat': '*',
            'spectral_type': 'G2',
            'luminosity': 1,
            'mass': 1
        }
    }
}

with open('data/10pc_sample.json', 'w') as fp:
    json.dump(sys_dict, fp)