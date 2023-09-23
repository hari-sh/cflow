import sys, os
import makehtml
ipfile = sys.argv[1]
title = os.path.basename(ipfile).rsplit('.', maxsplit=1)[0]
dirname = os.path.dirname(ipfile)
outfile = os.path.join(dirname, title + '.html')
makehtml.callermain(ipfile, outfile, title)
