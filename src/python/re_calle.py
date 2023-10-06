import re
callfun = re.compile('\w+\(.*\)')
    
def getparanfun(ipstr):
    patmatch = re.search(callfun, ipstr)
    if(patmatch):
        start, end = patmatch.regs[0]
        return ipstr[start:end]
    return ""

def getparan(ipstr):
    parcount = 0
    retarr = []
    retdict = {}
    for ind, c in zip(range(len(ipstr)), ipstr):
        if c == "(":
            retdict[parcount] = {'start':ind+1, 'end': None}
            parcount = parcount + 1
        elif c == ")":
            parcount = parcount - 1
            retdict[parcount]['end'] = ind
            retarr.append(retdict[parcount])
            retdict[parcount] = {}
    return retarr

def getparanfun2(ipstr):
    patmatch = re.search(callfun, ipstr)
    if(patmatch):
        start, end = patmatch.regs[0]
        return ipstr[start:end]
    return ""

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


def recpartpun(ipstr):
    parts = partparan(ipstr)
    for part, paran in parts:
        print(part)
        print('->  |'+ getparanfun2(part))
    print('*'*10)
    if(len(parts)>1):
        for part, paran in parts:
            recpartpun(paran)

test_str = r'Configure(save(hi hello(roar))(ride) hey) c(revolt)'
print(test_str)
print('-'*10)
# print(partparan(test_str))
recpartpun(test_str)
# for strseg in getparan(test_str):
#     # print(getparanfun(test_str[strseg['start']:strseg['end']]))
#     print(test_str[strseg['start']:strseg['end']])
