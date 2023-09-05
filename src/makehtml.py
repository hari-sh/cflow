import json

docstart ='''<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Markmap</title>
    <link rel="stylesheet" href="../inc/treeview.css">
  </head>
  
  <body>
    <div class="container">
        <form>
        <input id="diaginput" type="text" placeholder="Search...">
        <button id="diagbtn" type="button">Search</button>
        </form>
    </div>
    <svg id="mindmap"></svg>
    <script src="../inc/d3.js"></script>
    <script src="../inc/d3-flextree.js"></script>
    <script src="../inc/treeview.js"></script>
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
      const loadTreeData = (hashdata) => {
        const diagstr = document.getElementById('diaginput').value;
        document.getElementById('diaginput').value = "";
        window.mm?.destroy();
        window.mm = window.markmap.Markmap.create('svg#mindmap', hashdata, diagstr);
      }
    </script>
    <script>
      const hashdata = makeDataObj(datajson);
      document.getElementById("diagbtn").addEventListener("click", loadTreeData);
      document.getElementById('diaginput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault()
          loadTreeData(hashdata);
        }
      });
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
            node = QMapNode(text, level)
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

