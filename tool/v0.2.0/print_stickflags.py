# -*- coding: utf-8 -*-

import string

template = """            if(('cs_{{l}}' in stickflags) && keycode==K.{{u}}){
                delete stickflags['cs_{{l}}'];
            }"""

data_all = ''
for i in range(26):
    l = string.ascii_lowercase[i]
    u = string.ascii_uppercase[i]

    data_one = template.replace('{{u}}', u).replace('{{l}}', l)
    data_all += '\n' + data_one

print(data_all)