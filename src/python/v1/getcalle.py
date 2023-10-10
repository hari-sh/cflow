import re
from pprint import pprint
callfun = re.compile('\w+\(.*\)')

def getparanfun(ipstr):
    patmatch = re.search(callfun, ipstr)
    if(patmatch):
        start, end = patmatch.regs[0]
        return ipstr[start:end]
    return None

def partparan(ipstr):
    parcount = 0
    retarr = []
    startarr = [-1]
    endarr = [-1]
    for ind, c in zip(range(len(ipstr)), ipstr):
        if c == "(":
            if(parcount==0):
                startarr.append(ind+1)
            parcount = parcount + 1
        elif c == ")":
            parcount = parcount - 1
            if(parcount==0):
                endarr.append(ind)
    for seg in range(len(endarr)-1):
        retarr.append((ipstr[endarr[seg]+1:endarr[seg+1]+1], ipstr[startarr[seg+1]:endarr[seg+1]]))    
    return retarr


def recpartpun(ipstr, callees, calparts):
    parts = partparan(ipstr)
    for part, paran in parts:
        # print(part)
        # print('->  |'+ getparanfun(part))
        calparts.append(part)
        calfun = getparanfun(part)
        if(calfun):
            callees.append(calfun)
    if(len(parts)>1):
        for part, paran in parts:
            recpartpun(paran, callees, calparts)

def getcallee(test_str):
    calle = []
    parts = []
    recpartpun(test_str, calle, parts)
    return (parts, calle)

test_str = r'Configure(save(hi hello(roar))(ride) hey) c(revolt)'
print(test_str)
print('-'*10)
parts, calle = getcallee(test_str)
pprint(parts)
print('-'*10)
pprint(calle)