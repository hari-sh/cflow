(function (exports, d3, swal) {
  'use strict';
  
  function noop() {
  }

  function childSelector(filter) {
    if (typeof filter === 'string') {
      const tagName = filter;
      filter = el => el.tagName === tagName;
    }
    const filterFn = filter;
    return function selector() {
      let nodes = Array.from(this.childNodes);
      if (filterFn) nodes = nodes.filter(node => filterFn(node));
      return nodes;
    };
  }
  
  const attrMap = {
    className: 'class',
    labelFor: 'for'
  };

  function mount(vnode) {
    if(vnode == null) return;
    if (typeof(vnode) === 'string' || typeof(vnode) === 'number') {
      return document.createTextNode(`${vnode}`);
    }
    else {
      const { type, props } = vnode;
      const node = document.createElement(type);
      for (const key in props) {
        if (key === 'key' || key === 'children' || key === 'ref') continue;
        if (key === 'dangerouslySetInnerHTML') {
          node.innerHTML = props[key].__html;
        } else {
          const attr = attrMap[key] || key;
          node.setAttribute(attr, props[key]);
        }
      }
      if (props.children) {
        let children = mount(props.children);
        if (children != null) {
          if (!Array.isArray(children)) 
            children = [children];
          children = children.filter(Boolean);
          if (children.length)
            node.append(...children);
        }
      }
      return node;
    }
  }

  const globalCSS = ".markmap{font:300 16px/20px sans-serif}.markmap-link{fill:none}.markmap-node>circle{cursor:pointer}.markmap-foreign{display:inline-block}.markmap-container{height:0;left:-100px;overflow:hidden;position:absolute;top:-100px;width:0}";
  function linkWidth(nodeData) {
    const data = nodeData.data;
    return Math.max(4 - 2 * data.depth, 1.5);
  }

  function stopPropagation(e) {
    e.stopPropagation();
  }

  function clickEvent(name)  {
    swal({
      title: name,
      text: "some alert",
      // icon: "success",
    });
  }

  const defaultColorFn = d3.scaleOrdinal(d3.schemeCategory10);
  const isMacintosh = typeof navigator !== 'undefined' && navigator.userAgent.includes('Macintosh');
  class Markmap {
    constructor(svg, opts) {
      this.options = Markmap.defaultOptions;
      this.revokers = [];
      this.handleZoom = e => {
        const {
          transform
        } = e;
        this.g.attr('transform', transform);
      };
      this.handlePan = e => {
        e.preventDefault();
        const transform = d3.zoomTransform(this.svg.node());
        const newTransform = transform.translate(-e.deltaX / transform.k, -e.deltaY / transform.k);
        this.svg.call(this.zoom.transform, newTransform);
      };
      this.handleClick = (e, d) => {
        let recursive = this.options.toggleRecursively;
        if (isMacintosh ? e.metaKey : e.ctrlKey) recursive = !recursive;
        this.toggleNode(this.state.hashdata, d.data, recursive);
      };
      this.svg = svg.datum ? svg : d3.select(svg);
      this.styleNode = this.svg.append('style');
      this.zoom = d3.zoom().filter(event => {
        if (this.options.scrollForPan) {
          if (event.type === 'wheel') return event.ctrlKey && !event.button;
        }
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
      }).on('zoom', this.handleZoom);
      this.setOptions(opts);
      this.state = {
        id: this.options.id || this.svg.attr('id'),
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0
      };
      this.g = this.svg.append('g');

    }
    getStyleContent() {
      const {
        style
      } = this.options;
      const {
        id
      } = this.state;
      const styleText = typeof style === 'function' ? style(id) : '';
      return [this.options.embedGlobalCSS && globalCSS, styleText].filter(Boolean).join('\n');
    }
    updateStyle() {
      this.svg.attr('class', 'markmap mindmap');
      const style = this.getStyleContent();
      this.styleNode.text(style);
    }
    toggleNode(hashdata, data) {
      var _data$payload2; 
      var _data$fold = (_data$payload2 = data.payload) != null && _data$payload2.fold ? 0 : 1;
      if(!_data$fold && !data.hasChild){
        data.hasChild = true;
        if((data.content in hashdata) && (hashdata[data.content].children?.length > 0))
        {
          data.children = [];
          hashdata[data.content].children.forEach(element=>
            {
              var data$childObj = {
                content: element.content,
                children: [
                  {content: "N",
                  isNull: true}
                ],
                payload:{"fold":1}
              };
              data.children.push(data$childObj);
          });
          }
        this.initializeDataArr(data);
      }
      data.payload = {fold: _data$fold};
      this.renderData(data);
    }
    initdom() {
      const {id} = this.state;
      const container = mount(
        {
          type: "div",
          props: {
            className: `markmap-container markmap ${id}-g`
          }
        });
      this.container = container;
      document.body.append(container);
    }
    getgrp(content){
      return mount(
        {
          type: "div",
          props: {
            className: "markmap-foreign",
            style: '',
            children: {
              type: "div", 
              props: {
                dangerouslySetInnerHTML: {
                  __html: content
                }
              }
            }
          }
        })
    }

    initializeDataNode(item, ind, path) {
      const {color,nodeMinHeight} = this.options;
      const group = this.getgrp(item.content);
      this.container.append(group);
      const rect = group.firstChild.getBoundingClientRect();
      item.content = group.firstChild.innerHTML;
      item.state = {
        id: ind + 1,
        el: group.firstChild,
        path: path,
        size: [Math.ceil(rect.width) + 1, Math.max(Math.ceil(rect.height), nodeMinHeight)],
        key: path + item.content
      };
      color(item);
    }

    initializeDataArr(node) {
      node.children.forEach((item, ind, arr) => {
        const path = [node.state.path, ind+1].join('.');
        this.initializeDataNode(item, ind, path);
      });
    }

    setOptions(opts) {
      if (this.options.zoom) {
        this.svg.call(this.zoom);
      } else {
        this.svg.on('.zoom', null);
      }
      if (this.options.pan) {
        this.svg.on('wheel', this.handlePan);
      } else {
        this.svg.on('wheel', null);
      }
    }

    setDataHash(hashdata, diagStr) {
      this.initdom();
      this.updateStyle();
      if(diagStr)
      {
        this.state.data = {
          content: diagStr
        };
        this.state.data.children = [];
        hashdata[diagStr].children.forEach(element => {
          var data$childObj = {
            content: element.content,
            children: [
              {
                content: "N",
                isNull: true
              }
            ],
            payload: { "fold": 1 }
          };
          this.state.data.children.push(data$childObj);
        });
        this.state.data.hasChild = true;
      }
      
      if (hashdata) this.state.hashdata = hashdata;
      this.initializeDataNode(this.state.data, 0, 1);
      this.initializeDataArr(this.state.data);
      this.renderData(this.state.data);
    }

    renderData(originData) {
      if (!this.state.data) return;
      const {
        spacingHorizontal,
        paddingX,
        spacingVertical,
        autoFit,
        color
      } = this.options;
      const layout = d3.flextree({}).children(d => {
        var _d$payload;
        if (!((_d$payload = d.payload) != null && _d$payload.fold)) return d.children;
      }).nodeSize(node => {
        const [width, height] = node.data.state.size;
        return [height, width + (width ? paddingX * 2 : 0) + spacingHorizontal];
      }).spacing((a, b) => {
        return a.parent === b.parent ? spacingVertical : spacingVertical * 2;
      });
      const tree = layout.hierarchy(this.state.data);
      layout(tree);
      const descendants = tree.descendants().reverse();
      const links = tree.links();
      const linkShape = d3.linkHorizontal();
      const minX = d3.min(descendants, d => d.x - d.xSize / 2);
      const maxX = d3.max(descendants, d => d.x + d.xSize / 2);
      const minY = d3.min(descendants, d => d.y);
      const maxY = d3.max(descendants, d => d.y + d.ySize - spacingHorizontal);
      Object.assign(this.state, {
        minX,
        maxX,
        minY,
        maxY
      });
      if (autoFit) this.fit();
      const origin = originData && descendants.find(item => item.data === originData) || tree;
      const x0 = origin.x;
      const y0 = origin.y;

      const node = this.g.selectAll(childSelector('g')).data(descendants, d => d.data.state.key);
      const nodeEnter = node.enter().append('g')
                        .attr('data-depth', d => d.data.depth)
                        .attr('data-path', d => d.data.state.path)
                        .attr('transform', d => `translate(${y0 + origin.ySize - d.ySize},${x0 + origin.xSize / 2 - d.xSize})`);
      const nodeExit = this.transition(node.exit());
      nodeExit.select('line')
              .attr('x1', d => d.ySize - spacingHorizontal)
              .attr('x2', d => d.ySize - spacingHorizontal);
      nodeExit.select('foreignObject').style('opacity', 0);
      nodeExit.attr('transform', d => `translate(${origin.y + origin.ySize - d.ySize},${origin.x + origin.xSize / 2 - d.xSize})`).remove();
      const nodeMerge = node.merge(nodeEnter).attr('class', d => {
        var _d$data$payload;
        var retval = ['markmap-node', ((_d$data$payload = d.data.payload) == null ? void 0 : _d$data$payload.fold) && 'markmap-fold'].filter(Boolean).join(' ');
        return retval;
      });
      this.transition(nodeMerge).attr('transform', d => `translate(${d.y},${d.x - d.xSize / 2})`);

      const line = nodeMerge.selectAll(childSelector('line'))
                            .data(d => [d], d => d.data.state.key)
                            .join(enter => {
        return enter.append('line')
                    .attr('x1', d => d.ySize - spacingHorizontal)
                    .attr('x2', d => d.ySize - spacingHorizontal);
      }, update => update, exit => exit.remove());
      this.transition(line)
      .attr('x1', -1)
      .attr('x2', d => d.ySize - spacingHorizontal + 2)
      .attr('y1', d => d.xSize).attr('y2', d => d.xSize)
      .attr('stroke', d => color(d.data)).attr('stroke-width', linkWidth);

      const circle = nodeMerge.selectAll(childSelector('circle')).data(d => {
        var _d$data$children;
        return (_d$data$children = d.data.children) != null && _d$data$children.length ? [d] : [];
      }, d => d.data.state.key).join(enter => {
        return enter.append('circle').attr('stroke-width', '1.5').attr('cx', d => d.ySize - spacingHorizontal).attr('cy', d => d.xSize).attr('r', 0).on('click', (e, d) => this.handleClick(e, d)).on('mousedown', stopPropagation);
      }, update => update, exit => exit.remove());
      this.transition(circle).attr('r', 6).attr('cx', d => d.ySize - spacingHorizontal).attr('cy', d => d.xSize).attr('stroke', d => color(d.data)).attr('fill', d => {
        var _d$data$payload2;
        return (_d$data$payload2 = d.data.payload) != null && _d$data$payload2.fold && d.data.children ? color(d.data) : '#fff';
      });

      // const ground = nodeMerge.selectAll(childSelector('square')).data(d => {
      //     return (d.data.isNull === true) ? [d] : [];
      // }, d => d.data.state.key).join(enter => {
      //   return enter.append('circle').attr('stroke-width', '3')
      //               .attr('cx', d => d.ySize - spacingHorizontal)
      //               .attr('cy', d => d.xSize).attr('r', 0);
      // }, update => update, exit => exit.remove());
      // this.transition(ground).attr('r', 3)
      //               .attr('cx', d => d.ySize - spacingHorizontal)
      //               .attr('cy', d => d.xSize)
      //               .attr('stroke', d => color(d.data)).attr('fill', d => {
      //   var _d$data$payload2;
      //   return (_d$data$payload2 = d.data.payload) != null && _d$data$payload2.fold && d.data.children ? color(d.data) : '#fff';
      // });

      const ground = nodeMerge.selectAll(childSelector('rect')).data(d => {
        return (d.data.isNull === true) ? [d] : [];
    }, d => d.data.state.key).join(enter => {
      return enter.append('rect').attr('stroke-width', '3')
      .attr('x', d => d.ySize - spacingHorizontal -3)
      .attr('y', d => d.xSize -3)
      .attr('width', 6)
      .attr('height', 6)
      .attr('stroke', 'black')
      .attr('fill', '#69a3b2');
    }, update => update, exit => exit.remove());
    this.transition(ground).attr('r', 3)
                  .attr('cx', d => d.ySize - spacingHorizontal)
                  .attr('cy', d => d.xSize)
                  .attr('stroke', d => color(d.data)).attr('fill', d => {
      var _d$data$payload2;
      return (_d$data$payload2 = d.data.payload) != null && _d$data$payload2.fold && d.data.children ? color(d.data) : '#fff';
    });

      const path = this.g.selectAll(childSelector('path')).data(links, d => d.target.data.state.key).join(enter => {
        const source = [y0 + origin.ySize - spacingHorizontal, x0 + origin.xSize / 2];
        return enter.insert('path', 'g').attr('class', 'markmap-link').attr('data-depth', d => d.target.data.depth).attr('data-path', d => d.target.data.state.path).attr('d', linkShape({
          source,
          target: source
        }));
      }, update => update, exit => {
        const source = [origin.y + origin.ySize - spacingHorizontal, origin.x + origin.xSize / 2];
        return this.transition(exit).attr('d', linkShape({
          source,
          target: source
        })).remove();
      });
      this.transition(path).attr('stroke', d => color(d.target.data)).attr('stroke-width', d => linkWidth(d.target)).attr('d', d => {
        const origSource = d.source;
        const origTarget = d.target;
        const source = [origSource.y + origSource.ySize - spacingHorizontal, origSource.x + origSource.xSize / 2];
        const target = [origTarget.y, origTarget.x + origTarget.xSize / 2];
        return linkShape({
          source,
          target
        });
      });

      const foreignObject = nodeMerge.selectAll(childSelector('foreignObject'))
                                     .data(d => [d], d => d.data.state.key)
                                     .join(enter => {
        const fo = enter.append('foreignObject')
                        .attr('class', 'markmap-foreign')
                        .attr('x', paddingX)
                        .attr('y', 0)
                        .style('opacity', 1)
                        .on('dblclick', stopPropagation);
        fo.append('xhtml:div')
          .select(function select(d) {
          // let clone = d.data.state.el.cloneNode(true);
          let clone = d.data.state.el;
          this.replaceWith(clone);
          clone.onclick = function(){ clickEvent(clone.innerText);}
          return clone;
        });
        return fo;
      }, update => update, exit => exit.remove()).attr('width', d => !d.data.isNull ? Math.max(0, d.ySize - spacingHorizontal - paddingX * 2) : 1).attr('height', d => d.xSize);
      this.transition(foreignObject).style('opacity', 1);

      descendants.forEach(d => {
        d.data.state.x0 = d.x;
        d.data.state.y0 = d.y;
      });
    }

    transition(sel) {
      const {
        duration
      } = this.options;
      return sel.transition().duration(duration);
    }
  
    async fit() {
      const svgNode = this.svg.node();
      const {
        width: offsetWidth,
        height: offsetHeight
      } = svgNode.getBoundingClientRect();
      const {
        fitRatio
      } = this.options;
      const {
        minX,
        maxX,
        minY,
        maxY
      } = this.state;
      const naturalWidth = maxY - minY;
      const naturalHeight = maxX - minX;
      const scale = Math.min(offsetWidth / naturalWidth * fitRatio, offsetHeight / naturalHeight * fitRatio, 2);
      // const initialZoom = d3.zoomIdentity.translate((offsetWidth - naturalWidth * scale) / 2 - minY * scale, (offsetHeight - naturalHeight * scale) / 2 - minX * scale).scale(scale);
      const initialZoom = d3.zoomIdentity.translate(50,(offsetHeight - naturalHeight * scale) / 2 - minX * scale).scale(scale);
      return this.transition(this.svg).call(this.zoom.transform, initialZoom).end().catch(noop);
    }
  
    destroy() {
      this.svg.on('.zoom', null);
      this.svg.html(null);
      this.revokers.forEach(fn => {
        fn();
      });
    }

    static create(svg, hashdata, data = null) {
      const mm = new Markmap(svg, null);
      mm.setDataHash(hashdata,data);
      mm.fit();
      return mm;
    }
  }

  Markmap.defaultOptions = {
    autoFit: false,
    color: node => {
      var _node$state;
      return defaultColorFn(`${((_node$state = node.state) == null ? void 0 : _node$state.path) || ''}`);
    },
    duration: 500,
    embedGlobalCSS: true,
    fitRatio: 0.95,
    maxWidth: 0,
    nodeMinHeight: 16,
    paddingX: 8,
    scrollForPan: isMacintosh,
    spacingHorizontal: 80,
    spacingVertical: 5,
    initialExpandLevel: -1,
    zoom: true,
    pan: true,
    toggleRecursively: false
  };
      
  exports.Markmap = Markmap;
  exports.defaultColorFn = defaultColorFn;
  exports.globalCSS = globalCSS;
  
  })(this.markmap = {}, d3, this.swal);