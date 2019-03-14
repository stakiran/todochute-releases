# -*- coding: utf-8 -*-

import string

template = "'{{u}}' : {{n}},"
data_all = ''
for i in range(26):
    l = string.ascii_lowercase[i]
    u = string.ascii_uppercase[i]
    n = str(65 + i);

    data_one = template.replace('{{u}}', u).replace('{{n}}', n)
    data_all += '\n' + data_one

template = "'{{i}}' : {{n}},"
for i in range(10):
    n = str(48 + i);

    data_one = template.replace('{{i}}', str(i)).replace('{{n}}', n)
    data_all += '\n' + data_one

print(data_all)
