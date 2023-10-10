import re

type_t='\w+' + '((\*+\s+)|(\s+)|(\s+\*+))'
var_t = '[a-zA-Z_]\w*'
vardec = re.compile(type_t + var_t)

# ipstrs = ['int* var = 2;', 'int *var;', 'int* var = 1, var2=3','int* a = 1;']
ipstrs = ['int* a']
bad_chars = [';', ':', '!', "*", " "]

def gettypevars(ipstr):
    patmatch = re.search(vardec, ipstr)
    # print(ipstr)
    if(patmatch):
        start, end = patmatch.regs[0]
        firstdec = ipstr[start:end]
        typematch = re.search(re.compile(type_t), firstdec)
        if(typematch):
            start, end = typematch.regs[0]
            vartype = firstdec[start:end]
        
        allvars = re.sub("\(.*?\)","()",ipstr).split(',')
        varnames = []
        for allvar in allvars:
            varfull = allvar.split('=')[0]
            varnamematch = re.search(re.compile('\w+\s*;?\s*$'), varfull)
            if(varnamematch):
                start, end = varnamematch.regs[0]
                varname=''.join(x for x in varfull[start:end] if not x in bad_chars)
                varnames.append(varname)

        vardict = {}
        for varname in varnames:
            vardict[varname] = vartype
        return vardict
    return None

def main():
    for ipstr in ipstrs:
        print(gettypevars(ipstr))
