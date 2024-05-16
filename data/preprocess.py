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

import re
def parse_greek(name):
    import re

def parse_greek(name):
    prefix = {
        'alf': 'Alpha',
        'bet': 'Beta',
        'gam': 'Gamma',
        'del': 'Delta',
        'eps': 'Epsilon',
        'zet': 'Zeta',
        'eta': 'Eta',
        'the': 'Theta',
        'iot': 'Iota',
        'kap': 'Kappa',
        'lam': 'Lambda',
        'mu': 'Mu',
        'nu': 'Nu',
        'ksi': 'Xi',
        'omi': 'Omicron',
        'pi': 'Pi',
        'rho': 'Rho',
        'sig': 'Sigma',
        'tau': 'Tau',
        'ups': 'Upsilon',
        'phi': 'Phi',
        'chi': 'Chi',
        'psi': 'Psi',
        'ome': 'Omega'
    }


    for key, value in prefix.items():
        name = re.sub('^' + key + '[0\\.]*(?=\\d*\\s)', value, name, flags=re.IGNORECASE)

    suffix = {
        'And': 'Andromedae',
        'Aqr': 'Aquarii',
        'Aql': 'Aquilae',
        'Ara': 'Arae',
        'Ari': 'Arietis',
        'Aur': 'Aurigae',
        'Boo': 'Boötis',
        'Cae': 'Caeli',
        'Cam': 'Camelopardalis',
        'Cap': 'Capricorni',
        'Car': 'Carinae',
        'Cas': 'Cassiopeiae',
        'Cen': 'Centauri',
        'Cep': 'Cephei',
        'Cet': 'Ceti',
        'Cha': 'Chamaeleontis',
        'Cir': 'Circini',
        'Col': 'Columbae',
        'Com': 'Comae Berenices',
        'CrA': 'Coronae Australis',
        'CrB': 'Coronae Borealis',
        'Crt': 'Crateris',
        'Cru': 'Crucis',
        'Cvn': 'Canum Venaticorum',
        'Cyg': 'Cygni',
        'Del': 'Delphini',
        'Dor': 'Doradus',
        'Dra': 'Draconis',
        'Equ': 'Equulei',
        'Eri': 'Eridani',
        'For': 'Fornacis',
        'Gem': 'Geminorum',
        'Gru': 'Gruis',
        'Her': 'Herculis',
        'Hor': 'Horologii',
        'Hya': 'Hydrae',
        'Hyi': 'Hydri',
        'Ind': 'Indi',
        'Lac': 'Lacertae',
        'Leo': 'Leonis',
        'Lep': 'Leporis',
        'Lib': 'Librae',
        'Lmi': 'Leonis Minoris',
        'Lup': 'Lupi',
        'Lyn': 'Lyncis',
        'Lyr': 'Lyrae',
        'Men': 'Mensae',
        'Mic': 'Microscopii',
        'Mon': 'Monocerotis',
        'Mus': 'Muscae',
        'Nor': 'Normae',
        'Oct': 'Octantis',
        'Oph': 'Ophiuchi',
        'Ori': 'Orionis',
        'Pav': 'Pavonis',
        'Peg': 'Pegasi',
        'Per': 'Persei',
        'Phe': 'Phoenicis',
        'Pic': 'Pictoris',
        'PsA': 'Piscis Austrini',
        'Psc': 'Piscium',
        'Pup': 'Puppis',
        'Pyx': 'Pyxidis',
        'Ret': 'Reticuli',
        'Scl': 'Sculptoris',
        'Sco': 'Scorpii',
        'Sct': 'Scuti',
        'Ser': 'Serpentis',
        'Sex': 'Sextantis',
        'Sge': 'Sagittae',
        'Sgr': 'Sagittarii',
        'Tau': 'Tauri',
        'Tel': 'Telescopii',
        'TrA': 'Trianguli Australis',
        'Tri': 'Trianguli',
        'Tuc': 'Tucanae',
        'UMa': 'Ursae Majoris',
        'UMi': 'Ursae Minoris',
        'Vel': 'Velorum',
        'Vir': 'Virginis',
        'Vol': 'Volantis',
        'Vul': 'Vulpeculae'
    }

    for key, value in suffix.items():
        name = re.sub(' ' + key + '(?=$|\\s)', ' ' + value, name, flags=re.IGNORECASE)

    return name

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
            'id': item['SYSTEM_NAME'],
            'name': parse_greek(item['SYSTEM_NAME']),
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
        'id': item['OBJ_NAME'],
        'name': parse_greek(item['OBJ_NAME']),
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
            page_py = wiki_wiki.page(name.replace(' ', '_'))

            if (page_py.exists()):
                wiki[name] = {
                    'title': page_py.title,
                    'summary': page_py.summary,
                }
                pass
            else:
                print('Warning: page "' + name.replace(' ', '_') + '" does not exist!')

    with open('data/10pc_wiki.json', 'w') as fp:
        json.dump(wiki, fp)