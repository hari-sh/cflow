import sys, os
import makehtml

ipfile = sys.argv[1]
title = ipfile.rsplit('.', maxsplit=1)[0]

makehtml.callermain(ipfile, title+'.html', title)
