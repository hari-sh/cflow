import re
import os
from fnmatch import fnmatch
from getcalle import getcallee, getclassName
from getvardec import gettypevars
from pprint import pprint

# matchstr = re.compile('[\w\s\*]+\w+\:\s*' + '\([\w\s\*\,\&]*\)' + '\s*\{')
# matchstr = re.compile('[\w\s*\*]' + '\([\w\s\*\,\&]*\)' + '\s*\{')
mod_t = '(\w+\s+)*'
ret_t = '\w+[\s\**]+'
cls_t = '(\s*\w+\s*\:\:\s*)*'
fun_t = '\s*\w+\s*'
arg_t = '\([\w\s\*\,\[\]\&]*\)'
brc_t = '\s*\{'

matchstr = re.compile(mod_t+ret_t+cls_t+fun_t+arg_t+brc_t)
callfun = re.compile('\w+\s*\(.*\)')

class FunParse:
    def __init__(self, name, mode):
        self.name = name
        self.mode = mode

def source_code(char):
    if char == '/':
        return comment_begin, ''
    elif char == ';' or char == '{' or char == '}':
        return None, char
    return source_code, char

def comment_begin(char):
    if char == '/':
        return inline_comment, ''
    if char == '*':
        return block_comment, ''
    return source_code, '/'+char

def inline_comment(char):
    if char == '\n':
        return source_code, char
    return inline_comment, ''

def block_comment(char):
    if char == '*':
        return end_block_comment, ''
    return block_comment, ''

def end_block_comment(char):
    if char == '/':
        return source_code, ''
    return block_comment, ''

def parseName(combl):
    x = re.search(matchstr, combl)
    if x:
        start, end = x.regs[0]
        funName = combl[start:end].split('(')[0].split()[-1]
        funargs = combl[start:end].split('(', -1)[1].rsplit(')',1)[0].split(',')
        pardict = {}
        for funarg in funargs:
            typevars = gettypevars(funarg)
            if(typevars):
                for key in typevars:
                    if key not in pardict:
                        pardict[key] = typevars[key]

        # print(funargs)
        # print(pardict)
        # print(funName)
        return (funName, pardict)
    return (None, None)
    
def parseCallee(combl):
    x = re.search(callfun, combl)
    if x:
        for start, end in x.regs:
        # start, end = x.regs[0]
            funName = combl[start:end]
            # print(funName)
            return funName

def matchedline(strr, lst, pattern):
    for ind, (a, b)in enumerate(zip(lst[:-1], lst[1:])):
        if (b-a != 0) and (re.search(pattern, strr[a:b])):
            return counter + ind
    return None

def endoffun(strr, lst):
    for ind, (a, b)in enumerate(zip(lst[:-1], lst[1:])):
        line = strr[a:b]
        global funbracer
        funbracer = funbracer + len(re.findall('\{', line))
        funbracer = funbracer - len(re.findall('\}', line))
        if funbracer == 0:
            funbracer = 100000
            return counter + ind
    return None

def printfundict(parfundict):
    for key in parfundict:
        print('function '  + key)
        print("="*20)
        for fun, obj in parfundict[key]['callees']:
            print('<'+fun, str(obj)+'>')
        print("-"*20)
        # print(parfundict[key]['typevars'])
        for key2 in parfundict[key]['typevars']:
            print(key2+'->'+parfundict[key]['typevars'][key2])
        # # print(parfundict[key]['typevars'])
        print()

def gen_content(fname):
    parser = source_code
    charnum = 1
    yield '\n'
    while True:
        character = fname.read(1)
        if not character:
            global eof
            eof = True
            return
        if character == '\n':
            lnos.append(charnum + 1)
        parser, text = parser(character)
        charnum = charnum + len(text)
        yield text
        if parser is None:
            break

def remove_comments(src, dest):   
    with open(src, 'r') as fname, open(dest, 'w') as temp:
        global cline
        global counter
        global lnos
        global funbracer
        global clsbracer
        funbracer = 1
        clsbracer = 1
        counter = 1
        funName = ""
        while True:
            lnos = [1]
            gotstr = gen_content(fname)
            cline = ''.join(gotstr)
            estclassName = getclassName(cline)
            if(estclassName):
                clsbracer = 1
                print(estclassName)
            estimatedName,estimatedargs = parseName(cline.replace('\n', ' '))
            lnos.append(len(cline))
            if estimatedName is not None:
                funName = estimatedName
                if funName not in parfundict:
                    parfundict[funName] = {}
                    parfundict[funName] = {'callees':[], 'typevars':estimatedargs}
            callefuns = getcallee(cline, funName)
            for callefun in callefuns:
                # print(callefun)
                parfundict[funName]['callees'].append(callefun)
            # print(gettypevars(cline))
            typevars = gettypevars(cline)
            if(typevars):
                for key in typevars:
                    if key not in parfundict[funName]['typevars']:
                        parfundict[funName]['typevars'][key] = typevars[key]
            # for typevar in gettypevars(cline):
            counter = counter + len(lnos) - 2
            if eof:
                break

def writefile(src, dest):
    with open(src, 'r') as fname, open(dest, 'w') as temp:
        for ind, line in enumerate(fname):
            if (ind + 1) in parfundict:
                val = parfundict[ind + 1]
                adder = f'printf("{val.name} : {val.mode}");'
                line = adder + '\n' + line
            temp.write(line)

def procfile(src):
    global eof, funbracer, parfundict, clsbracer
    eof = False
    funbracer = 100000
    clsbracer = 100000
    parfundict = {}
    infile = src
    outfile = "temp.c"
    remove_comments(infile, outfile)
    print('='*20)
    # printfundict(parfundict)
    # writefile(infile, outfile)
    # os.replace(outfile, infile)

root = '/opt/codes/flowjs/ofdmlib/src/codec/classcpp'
pattern = "*.cpp"

for path, subdirs, files in os.walk(root):
    for name in files:
        if fnmatch(name, pattern):
            procfile(os.path.join(path, name))