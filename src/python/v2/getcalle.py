import re
from pprint import pprint

# ins_t = '(\w+[(\:\:)(\.)(->)])*'
ins_t = '(\w+(\-\>)?(\.)?(\:\:)?)+'
fun_t = '\w+\(.*\)'
callfun = re.compile(ins_t+fun_t)

# vardec = '([a-zA-Z0-9_]+)(\\s+)(([a-zA-Z_\\*]?[a-zA-Z0-9_]*(=[a-zA-Z0-9]+)?)[,;]?((\\s*)[a-zA-Z_\\*]?[a-zA-Z0-9_]*?(=[a-zA-Z0-9]+)?[,;])*)'
# vardec = '(?:\w+\s+)([a-zA-Z_][a-zA-Z0-9_]*)'
type_t='\w+' + '((\*+\s+)|(\s+)|(\s+\*+))' + '[a-zA-Z_]\w+'
vardec = re.compile(type_t)

class_t = re.compile('class\s+\w+\s*{')

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
        recpartpun(paran, callees, calparts)

def getvadec(ipstr):
    patmatch = re.search(vardec, ipstr)
    if(patmatch):
        start, end = patmatch.regs[0]
        print(ipstr[start:end])
        return ipstr[start:end]
    return None

def getcallee(test_str, funName):
    calles = []
    parts = []
    recpartpun(test_str, calles, parts)
    retparts = []
    for calle in calles:
        cls_meth = calle.split('(')[0].split()[-1]
        if(cls_meth != funName):
            cls_meth_sp = re.split(re.compile('\.|->'), cls_meth)
            if(len(cls_meth_sp)==1):
                objName = None
                calleName = cls_meth_sp[0]
                retparts.append((calleName, objName))
                # print(calleName, objName)
            elif(len(cls_meth_sp)==2):
                objName = cls_meth_sp[0]
                calleName = cls_meth_sp[1]
                retparts.append((calleName, objName))
                # print(calleName, objName)
            # funargs = calle.split('(', -1)[1].rsplit(')',1)[0].split(',')
            # parts.append((calleName, objName))
            # print(cls_meth,funargs)
    return retparts

def getclassName(ipstr):
    patmatch = re.search(class_t, ipstr)
    if(patmatch):
        start, end = patmatch.regs[0]
        className = ipstr[start:end].split('{')[0].rstrip().split()[-1]
        return className
    return None

def testsub():
    test_str = r'Configure(save(hi hello(roar))(ride) hey) c(revolt)'
    print(test_str)
    print('-'*10)
    parts, calle = getcallee(test_str, '')
    pprint(parts)
    print('-'*10)
    pprint(calle)
