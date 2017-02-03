'use babel'

import {Function} from 'loophole';

let symbolKeys;

export default class Pistachio {

  static initClass() {

    let cleanSubviewNames;

    this.createId = (function() {
      let counter = 0;
      return prefix => `${prefix}el-${counter++}`;
    })();

    let pistachios = /\{([\w|-]*)?(\#[\w|-]*)?((?:\.[\w|-]*)*)(\[(?:\b[\w|-]*\b)(?:\=[\"|\']?.*[\"|\']?)\])*\{([^{}]*)\}\s*\}/g;

    this.prototype.createId = this.createId;

    this.prototype.init = (function() {

      let init;
      let dataGetter = function(prop) {
        let data = __guardMethod__(this, 'getData', o => o.getData());
        if (data != null) { return __guardMethod__(data, 'getAt', o1 => o1.getAt(prop)) || Pistachio.getAt(data, prop); }
      };

      let getEmbedderFn = (pistachio, view, id, symbol) =>
        function(childView) {
          view.embedChild(id, childView, symbol.isCustom);
          if (!symbol.isCustom) {
            symbol.id      = childView.id;
            symbol.tagName = __guardMethod__(childView, 'getTagName', o => o.getTagName());
            delete pistachio.symbols[id];
            return pistachio.symbols[childView.id] = symbol;
          }
        }
      ;

      return init = function() {
        let { prefix, view, createId } = this;
        return this.template.replace(pistachios, (_, tagName, id, classes, attrs, expression) => {

          let code;
          id = __guard__(id, x => x.split('#')[1]);
          let classNames = __guard__(classes, x1 => x1.split('.').slice(1)) || [];
          attrs = __guard__(attrs, x2 => x2.replace(/\]\[/g, ' ').replace(/\[|\]/g, '')) || '';

          let isCustom = !!(tagName || id || classes.length || attrs.length);

          if (!tagName) { tagName = 'span'; }

          let dataPaths = [];
          let subViewNames = [];

          expression = expression
            .replace(/#\(([^)]*)\)/g, function(_, dataPath) {
              dataPaths.push(dataPath);
              return `data('${dataPath}')`;
          })
            .replace(/^(?:> ?|embedChild )(.+)/, function(_, subViewName) {
              subViewNames.push(subViewName.replace(/\@\.?|this\./, ''));
              return `embedChild(${subViewName})`;
          });

          this.registerDataPaths(dataPaths);
          this.registerSubViewNames(subViewNames);

          let js = `return ${expression}`;

          if ('debug' === tagName) {
            console.debug(js);
            tagName = 'span';
          }

          let paramKeys     = Object.keys(this.params);
          let paramValues   = paramKeys.map(key => this.params[key]);

          let formalParams = ['data', 'embedChild', ...paramKeys];

          try {
            code = Function(...formalParams, js);
          } catch (e) {
            throw new Error(`Pistachio encountered an error: ${e} Source: ${js}`);
          }

          if (!id) { id = createId(prefix); }

          let render = () =>
            '' + code.apply(view, [
              dataGetter.bind(view),
              embedChild,
              ...paramValues
            ])
          ;

          let symbol = {
            tagName, id, isCustom, js, code, render, dataPaths, subViewNames
          };

          this.addSymbolInternal(symbol);

          var embedChild = getEmbedderFn(this, view, id, symbol);

          let dataPathsAttr =
            dataPaths.length ?
              ` data-${prefix}paths='${dataPaths.join(' ')}'`
            : '';

          let subViewNamesAttr =
            subViewNames.length ?
              (classNames.push(`${prefix}subview`),
              ` data-${prefix}subviews='${cleanSubviewNames(subViewNames.join(' '))}'`)
            : '';

          let classAttr =
            classNames.length ? ` class='${classNames.join(' ')}'`
            : '';

          return `<${tagName}${classAttr}${dataPathsAttr}${subViewNamesAttr} ${attrs} id='${id}'></${tagName}>`;
        }
        );
      };
    })();

    cleanSubviewNames = name => name.replace(/(this\["|\"])/g, '');

    symbolKeys = {
      subview : 'symbolsBySubViewName',
      path    : 'symbolsByDataPath'
    };
  }

  static getAt(ref, path) {
    if ('function' === typeof path.split) { // ^1
      path = path.split('.');
    } else {
      path = path.slice();
    }

    let prop = path.shift();
    while ((ref != null) && prop) {
      ref = ref[prop];
    }
    return ref;
  }

  constructor(view, template, options) {
    if (options == null) { options = {}; }
    this.view = view;
    this.template = template;
    this.options = options;
    ({ prefix: this.prefix, params: this.params }  = this.options);
    if (!this.params) { this.params = {}; }
    this.symbols              = {};
    this.symbolsByDataPath    = {};
    this.symbolsBySubViewName = {};
    this.dataPaths            = {};
    this.subViewNames         = {};
    if (!this.prefix) { this.prefix = ''; }
    this.html                 = this.init();
  }

  toString() { return this.template; }

  addSymbolInternal(symbol) {
    let { dataPaths, subViewNames } = symbol;

    this.symbols[symbol.id] = symbol;

    for (let dataPath of Array.from(dataPaths)) {
      if (this.symbolsByDataPath[dataPath] == null) { this.symbolsByDataPath[dataPath] = []; }
      this.symbolsByDataPath[dataPath].push(symbol);
    }

    for (let subViewName of Array.from(subViewNames)) {
      if (this.symbolsBySubViewName[subViewName] == null) { this.symbolsBySubViewName[subViewName] = []; }
      this.symbolsBySubViewName[subViewName].push(symbol);
    }

    return symbol;
  }

  addSymbol(childView) {
    return this.symbols[childView.id] = {
      id      : childView.id,
      tagName : __guardMethod__(childView, 'getTagName', o => o.getTagName())
    };
  }

  appendChild(childView) {
    return this.addAdhocSymbol(childView);
  }

  prependChild(childView) {
    return this.addAdhocSymbol(childView);
  }

  registerDataPaths(paths) {
    return Array.from(paths).map((path) => this.dataPaths[path] = true);
  }

  registerSubViewNames(subViewNames) {
    return Array.from(subViewNames).map((subViewName) => this.subViewNames[subViewName] = true);
  }

  getDataPaths() { return Object.keys(this.dataPaths); }

  getSubViewNames() { return Object.keys(this.subViewNames); }

  refreshChildren(childType, items, forEach) {
    let symbol;
    if (forEach == null) { forEach = function() {}; }
    let unique = {};

    for (let item of Array.from(items)) {

      let symbols = this[symbolKeys[childType]][item];

      if (symbols == null) { continue; }

      for (symbol of Array.from(symbols)) {

        unique[symbol.id] = symbol;
      }
    }

    return (() => {
      let result = [];
      for (let id of Object.keys(unique)) {
        symbol = unique[id];
        let item1;
        let el = this.view.getElement().querySelector(`#${id}`);
        if (el == null) { continue; }

        let out = __guard__(symbol, x => x.render());
        if (out) { item1 = forEach.call(el, out); }
        result.push(item1);
      }
      return result;
    })();
  }

  embedSubViews(subviews) {
    if (subviews == null) { subviews = this.getSubViewNames(); }
    return this.refreshChildren('subview', subviews);
  }

  update(paths) {
    if (paths == null) { paths = this.getDataPaths(); }
    return this.refreshChildren('path', paths, function(html) { return this.innerHTML = html; });
  }
}

Pistachio.initClass();

function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
