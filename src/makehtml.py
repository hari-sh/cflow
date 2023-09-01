import json

docstart ='''
<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Markmap</title>
    <link rel="stylesheet" href="/opt/inc/treeview.css">
  </head>
  
  <body>
    <div class="container">
        <form>
        <input id="diaginput" type="text" placeholder="Search...">
        <button id="diagbtn" type="button">Search</button>
        </form>
    </div>
    <svg id="mindmap"></svg>
    <script src="/opt/inc/d3.js"></script>
    <script src="/opt/inc/d3-flextree.js"></script>
    <script src="/opt/inc/treeview.js"></script>
    <script>
    const datajson = 
'''

docend = '''
    </script>
    <script>
      const makeDataObj = (dobj) => {
        var dataObj = {};
        var stack = [dobj];
        while (stack?.length > 0){
          const curnObj = stack.pop();
          if(curnObj.children?.length > 0){
            dataObj[curnObj.content] = curnObj;
          }
          curnObj.children?.forEach(cobj => stack.push(cobj));
        }
        return dataObj;
      }
      const hashdata = makeDataObj(datajson);
      for(let hkey in hashdata)
      {
        var hval = hashdata[hkey];
        console.log(hval.content + "->" + hval.children?.map(o=>o.content));
      }

      const makeTreeObj = (obj) => {
        var dataObj = {};
        const stack = [obj];
        while (stack?.length > 0){
          var currentObj = stack.pop();
          currentObj.children?.forEach((cobj, ind, arr) => {
            if((cobj.content in hashdata) && (cobj != hashdata[cobj.content]))
            {
              arr[ind] = hashdata[cobj.content];
            }
            stack.push(arr[ind]);
          });
        }
      }

    </script>
    <script>
        document.getElementById("diagbtn").addEventListener("click", loadTreeData);
        document.getElementById('diaginput').addEventListener('keypress', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault()
            loadTreeData();
          }
        });
        function loadTreeData() {
          const diagstr = document.getElementById('diaginput').value;
          document.getElementById('diaginput').value = "";
          treedata = {};
          if(diagstr in hashdata)
          {
            makeTreeObj(hashdata[diagstr]);
            treedata = hashdata[diagstr];
          }
          else
          {
              treedata = {"content": diagstr};
            console.log(diagstr);
          }
          ((getMarkmap, getOptions, root, jsonOptions) => {
          const markmap = getMarkmap();
          window.mm?.destroy();
          window.mm = markmap.Markmap
          .create('svg#mindmap', 
                  (getOptions || markmap.deriveOptions)(jsonOptions), 
                  root);
        })(() => window.markmap, null, treedata, {})
        }
    </script>
  </body>
</html>
'''

class QMapNode:
    def __init__(self, text, level):
        self.children = []
        self.text = text
        self.level = level

    def as_dict(self):
        if len(self.children) >= 1:
            return {
                "content": self.text,
                "children": [node.as_dict() for node in self.children]
                }
        else:
            return {"content": self.text}
    
def getNextItem(lines):
    try:
        indline = next(lines)
        level = len(indline) - len(indline.lstrip())
        text = indline.strip()

    except StopIteration:
        text, level = (None, None)

    return (text, level)

def skipDescendants(lines, plevel):
    text, level = getNextItem(lines)
    while(text):
        if((level is not None) and plevel >= level):
            break
        plevel = level
        text, level = getNextItem(lines)
    return (text, level)

def makedict(lines, pnode):
    text, level = getNextItem(lines)
    while(text):
        if(pnode.level < level):
            if text in hidict:
                node = hidict[text]
                pnode.children.append(node)
                text, level = skipDescendants(lines, level)

            else:
                node = QMapNode(text, level)
                hidict[text] = node
                pnode.children.append(node)
                text, level = makedict(lines, node)
        else:
            return (text, level)
    else:
        return (None, None)

def writehtml(ophtml, jsonstr):
    ophtml.write(docstart)
    ophtml.write(jsonstr)
    ophtml.write(docend)

def htmlmaker(ip, ophtml, diagstr):
    global hidict
    hidict = {}
    global root
    root = QMapNode(diagstr, -1)
    makedict(ip, root)
    writehtml(ophtml, json.dumps(root.as_dict(), indent = 2))

def callermain(ipfile, opfile, diagstr):
    ip = open(ipfile)
    op = open(opfile, 'w+')
    htmlmaker(ip, op, diagstr)
    ip.close()
    op.close()

