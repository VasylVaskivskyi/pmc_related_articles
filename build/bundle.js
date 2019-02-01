/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/file-saver/dist/FileSaver.min.js":
/*!*******************************************************!*\
  !*** ./node_modules/file-saver/dist/FileSaver.min.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(a,b){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (b),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?\n\t\t\t\t(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else {}})(this,function(){\"use strict\";function b(a,b){return\"undefined\"==typeof b?b={autoBom:!1}:\"object\"!=typeof b&&(console.warn(\"Depricated: Expected third argument to be a object\"),b={autoBom:!b}),b.autoBom&&/^\\s*(?:text\\/\\S*|application\\/xml|\\S*\\/\\S*\\+xml)\\s*;.*charset\\s*=\\s*utf-8/i.test(a.type)?new Blob([\"\\uFEFF\",a],{type:a.type}):a}function c(b,c,d){var e=new XMLHttpRequest;e.open(\"GET\",b),e.responseType=\"blob\",e.onload=function(){a(e.response,c,d)},e.onerror=function(){console.error(\"could not download file\")},e.send()}function d(a){var b=new XMLHttpRequest;return b.open(\"HEAD\",a,!1),b.send(),200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent(\"click\"))}catch(c){var b=document.createEvent(\"MouseEvents\");b.initMouseEvent(\"click\",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b)}}var f=\"object\"==typeof window&&window.window===window?window:\"object\"==typeof self&&self.self===self?self:\"object\"==typeof global&&global.global===global?global:void 0,a=f.saveAs||\"object\"!=typeof window||window!==f?function(){}:\"download\"in HTMLAnchorElement.prototype?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement(\"a\");g=g||b.name||\"download\",j.download=g,j.rel=\"noopener\",\"string\"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target=\"_blank\")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href)},4E4),setTimeout(function(){e(j)},0))}:\"msSaveOrOpenBlob\"in navigator?function(f,g,h){if(g=g||f.name||\"download\",\"string\"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else{var i=document.createElement(\"a\");i.href=f,i.target=\"_blank\",setTimeout(function(){e(i)})}}:function(a,b,d,e){if(e=e||open(\"\",\"_blank\"),e&&(e.document.title=e.document.body.innerText=\"downloading...\"),\"string\"==typeof a)return c(a,b,d);var g=\"application/octet-stream\"===a.type,h=/constructor/i.test(f.HTMLElement)||f.safari,i=/CriOS\\/[\\d]+/.test(navigator.userAgent);if((i||g&&h)&&\"object\"==typeof FileReader){var j=new FileReader;j.onloadend=function(){var a=j.result;a=i?a:a.replace(/^data:[^;]*;/,\"data:attachment/file;\"),e?e.location.href=a:location=a,e=null},j.readAsDataURL(a)}else{var k=f.URL||f.webkitURL,l=k.createObjectURL(a);e?e.location=l:location.href=l,e=null,setTimeout(function(){k.revokeObjectURL(l)},4E4)}};f.saveAs=a.saveAs=a, true&&(module.exports=a)});\n\n//# sourceMappingURL=FileSaver.min.js.map\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack:///./node_modules/file-saver/dist/FileSaver.min.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var g;\n\n// This works in non-strict mode\ng = (function() {\n\treturn this;\n})();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || new Function(\"return this\")();\n} catch (e) {\n\t// This works if the window reference is available\n\tif (typeof window === \"object\") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it's\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n\n//# sourceURL=webpack:///(webpack)/buildin/global.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: save_as_json */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"save_as_json\", function() { return save_as_json; });\n // import { saveAs } from 'file-saver'\n\nvar _require = __webpack_require__(/*! file-saver */ \"./node_modules/file-saver/dist/FileSaver.min.js\"),\n    saveAs = _require.saveAs; //######################### const #########################\n\n\nvar graphWidth = 1024;\nvar graphHeight = 650;\nvar arrowHeight = 5;\nvar arrowWidth = 5;\nvar neo4jAPIURL = 'http://localhost:7474/db/data/transaction/commit';\nvar neo4jLogin = 'neo4j';\nvar neo4jPassword = '1234';\nvar circleSize = 20;\nvar textPosOffsetY = 5;\nvar collideForceSize = circleSize + 5;\nvar linkForceSize = 150; //######################### variable #########################\n\nvar nodeItemMap = {};\nvar linkItemMap = {};\nvar nodes = [];\nvar edges = [];\nvar neo_input_json;\nvar modified_json;\nvar d3Simulation = null;\nvar circles;\nvar circleText;\nvar lines;\nvar lineText;\nvar current_id;\nvar currentAccessionID;\nvar itemColorMap = {};\nvar colorScale = d3.scaleOrdinal(d3.schemeSet2);\nvar drag_handler = d3.drag().on('start', drag_start).on('drag', drag_move).on('end', drag_end);\nvar zoom_handler = d3.zoom().filter(function () {\n  //Only enable wheel zoom and mousedown to pan\n  return d3.event.type == 'wheel' | d3.event.type == 'mousedown';\n}).on('zoom', zoom_actions);\n\nfunction unfreezeItms() {\n  var nodeItmArray = d3Simulation.nodes();\n\n  if (nodeItmArray != null) {\n    nodeItmArray.forEach(function (nodeItm) {\n      if (nodeItm.fx != null) {\n        nodeItm.fx = null;\n        nodeItm.fy = null;\n      }\n    });\n  }\n}\n\nfunction drag_start(d) {\n  //if (!d3.event.active && d3Simulation != null)\n  d3Simulation.alphaTarget(0.3).restart();\n  d.fx = d.x;\n  d.fy = d.y;\n}\n\nfunction drag_move(d) {\n  d.fx = d3.event.x;\n  d.fy = d3.event.y;\n}\n\nfunction drag_end(d) {\n  if (!d3.event.active && d3Simulation != null) d3Simulation.alphaTarget(0); //d.fx = null;\n  //d.fy = null;\n}\n\nfunction zoom_actions() {\n  d3.select('#resultSvg').select('g').attr('transform', d3.event.transform);\n}\n\nfunction initGraph() {\n  var svg = d3.select('#resultSvg');\n  var zoomGLayer = svg.append('g');\n  var centerX = graphWidth / 4;\n  var centerY = graphHeight / 4;\n  svg.attr('width', graphWidth).attr('height', graphHeight);\n  /*\r\n    var defs = svg.append('defs');\r\n    Not use marker as IE does not support it and so embed the arrow in the path directly\r\n    // define arrow markers for graph links\r\n    defs.append('marker')\r\n      .attr('id', 'end-arrow')\r\n      .attr('viewBox', '0 -5 10 10')\r\n      .attr('refX', 10)\r\n      .attr('markerWidth', 5)\r\n      .attr('markerHeight', 5)\r\n      .attr('orient', 'auto')\r\n      .append('path')\r\n      .attr('d', 'M0,-5L10,0L0,5');\r\n    */\n\n  zoomGLayer.append('g').attr('id', 'path-group').attr('transform', 'translate(' + centerX + ',' + centerY + ')');\n  zoomGLayer.append('g').attr('id', 'path-label-group').attr('transform', 'translate(' + centerX + ',' + centerY + ')');\n  zoomGLayer.append('g').attr('id', 'circle-group').attr('transform', 'translate(' + centerX + ',' + centerY + ')');\n  zoomGLayer.append('g').attr('id', 'text-group').attr('transform', 'translate(' + centerX + ',' + centerY + ')');\n  zoom_handler(svg);\n}\n\nfunction stopSimulation() {\n  if (d3Simulation != null) {\n    d3Simulation.stop().on('tick', null);\n    d3Simulation = null;\n  }\n}\n\nfunction tick() {\n  lines.attr('d', drawLine); //lineText.attr('transform', transformPathLabel);\n\n  circles.attr('transform', transform);\n  circleText.attr('transform', transform);\n}\n\nfunction transformPathLabel(d) {\n  var sourceX = d.source.x + (d.target.x - d.source.x) / 2;\n  var sourceY = d.source.y + (d.target.y - d.source.y) / 2;\n  return 'translate(' + sourceX + ',' + sourceY + ')';\n}\n\nfunction transform(d) {\n  return 'translate(' + d.x + ',' + d.y + ')';\n}\n\nfunction drawLine(d) {\n  var deltaX, deltaY, dist, cosTheta, sinTheta, sourceX, sourceY, targetX, targetY;\n  deltaX = d.target.x - d.source.x;\n  deltaY = d.target.y - d.source.y;\n  dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);\n  cosTheta = deltaX / dist;\n  sinTheta = deltaY / dist;\n  sourceX = d.source.x + circleSize * cosTheta;\n  sourceY = d.source.y + circleSize * sinTheta;\n  targetX = d.target.x - circleSize * cosTheta, targetY = d.target.y - circleSize * sinTheta; //Not use marker as IE does not support it and so embed the arrow in the path directly\n\n  var arrowLeftX, arrowLeftY, arrowRightX, arrowRightY;\n  arrowLeftX = targetX - arrowHeight * sinTheta - arrowWidth * cosTheta;\n  arrowLeftY = targetY + arrowHeight * cosTheta - arrowWidth * sinTheta;\n  arrowRightX = targetX + arrowHeight * sinTheta - arrowWidth * cosTheta;\n  arrowRightY = targetY - arrowHeight * cosTheta - arrowWidth * sinTheta;\n  return 'M' + sourceX + ' ' + sourceY + ' L' + targetX + ' ' + targetY + ' M' + targetX + ' ' + targetY + ' L' + arrowLeftX + ' ' + arrowLeftY + ' L' + arrowRightX + ' ' + arrowRightY + ' Z';\n}\n\nfunction clearProperties() {\n  $('#propertiesBox').empty();\n}\n\nfunction showProperties(d) {\n  clearProperties();\n  var propertiesText = '';\n  var link = '';\n  var ex_labs = ['p_ind', 'acs_ind']; //var propertiesText = 'id: ' + d.id;\n  //For nodes\n  //if (d.labels != null)\n  //propertiesText += ', labels: ' + d.labels.join(', ');\n  //For links\n  //if (d.type != null)\n  //  propertiesText += ', type: ' + d.type;\n\n  $.map(d.properties, function (value, key) {\n    if (!ex_labs.includes(key)) {\n      propertiesText += key + ': ' + value + '<br/><br/>';\n    }\n  });\n\n  if (Object.keys(d.properties).includes('PMCID')) {\n    link = 'https://europepmc.org/abstract/PMC/' + d.properties.PMCID;\n  } else if (!Object.keys(d.properties).includes('PMCID')) {\n    link = 'https://europepmc.org/abstract/MED/' + d.properties.PMID;\n  }\n\n  $('#propertiesBox').append($('<p></p>').html(propertiesText));\n  $('#open_article').attr('href', link);\n}\n\nfunction updateGraph() {\n  current_id = $.trim($('#queryText').val());\n\n  if (current_id.substr(0, 4).toLowerCase() == 'acs:') {\n    currentAccessionID = current_id.substr(4);\n    current_id = null;\n  }\n\n  var d3LinkForce = d3.forceLink().distance(linkForceSize).links(mapToArray(linkItemMap)).id(function (d) {\n    return d.id;\n  });\n  d3Simulation = d3.forceSimulation().force('charge', d3.forceManyBody().strength(-250)).force('collideForce', d3.forceCollide(collideForceSize).iterations(1)) //.force('center', d3.forceCenter(100, 100))\n  .force('x', d3.forceX(graphWidth / 4).strength(0.03)).force('y', d3.forceY(graphHeight / 4).strength(0.03)).nodes(mapToArray(nodeItemMap)).force('linkForce', d3LinkForce);\n  circles = d3.select('#circle-group').selectAll('circle').data(d3Simulation.nodes(), function (d) {\n    return d.id;\n  });\n  circleText = d3.select('#text-group').selectAll('text').data(d3Simulation.nodes(), function (d) {\n    return d.id;\n  });\n  lines = d3.select('#path-group').selectAll('path').data(d3LinkForce.links(), function (d) {\n    return d.id;\n  });\n  /*  lineText = d3.select('#path-label-group').selectAll('text')\r\n        .data(d3LinkForce.links(), function(d) {return d.id;});\r\n  */\n\n  circles.exit().remove();\n  circles = circles.enter().append('circle').attr('r', circleSize).attr('fill', function (d) {\n    return nodeColor(d, '#1E90FF');\n  }).attr('stroke', 'black').call(drag_handler).on('mouseover', function (d) {\n    d3.select(this).attr('fill', function (d) {\n      return nodeColorBrighter(d, '#AFEEEE');\n    }).attr('stroke', 'gray');\n    showProperties(d);\n  }).on('mouseout', function (d) {\n    d3.select(this).attr('fill', function (d) {\n      return nodeColor(d, '#1E90FF');\n    }).attr('stroke', 'black');\n  }).on('dblclick', function (d) {\n    d.fx = d.x;\n    d.fy = d.y;\n    submitQuery(d.id);\n  }).merge(circles);\n  circleText.exit().remove();\n  circleText = circleText.enter().append('text').attr('y', textPosOffsetY).attr('text-anchor', 'middle').text(function (d) {\n    if (d.labels[0] == 'Paper') {\n      var t = d.properties.Title;\n    } else {\n      var t = d.properties.Term;\n    }\n\n    return t.substr(0, 6);\n  }).merge(circleText);\n  lines.exit().remove();\n  lines = lines.enter().append('path').merge(lines);\n  /*\r\n      lineText.exit().remove();\r\n      lineText = lineText.enter().append('text')\r\n        .attr('y', textPosOffsetY)\r\n        .attr('text-anchor', 'middle')\r\n        .text(null)  //function(d) {return d.type;}\r\n        .merge(lineText);\r\n  */\n\n  d3Simulation.on('tick', tick).on('end', function () {\n    unfreezeItms();\n  });\n}\n\nfunction submitQuery(nodeID) {\n  removeAlert();\n  var queryStr = null;\n\n  if (nodeID == null || !nodeID) {\n    queryStr = $.trim($('#queryText').val());\n\n    if (queryStr == '') {\n      promptAlert($('#graphContainer'), 'Error: query text cannot be empty !', true);\n      return;\n    }\n\n    if ($('#chkboxCypherQry:checked').val() != 1) {\n      if (queryStr.substr(0, 4).toLowerCase() == 'acs:') {\n        queryStr = \"OPTIONAL MATCH zz= (:Paper)-[:ACCESSION]->(acs:Accession {Term:'\" + queryStr.substr(4).toUpperCase() + \"'}) RETURN zz\";\n      } else if (queryStr.substr(0, 3) == 'PMC') {\n        queryStr = \"OPTIONAL MATCH zz=(p:Paper{PMCID:'\" + queryStr + \"'})-[:ACCESSION]->(acs:Accession) \" + \"OPTIONAL MATCH pp= (p:Paper{PMCID:'\" + queryStr + \"'})-[:ACCESSION]->(acs:Accession)<-[:ACCESSION]-(:Paper) RETURN pp, zz\";\n      } else {\n        queryStr = \"OPTIONAL MATCH zz=(p:Paper{PMID:'\" + queryStr + \"'})-[:ACCESSION]->(acs:Accession) \" + \"OPTIONAL MATCH pp= (p:Paper{PMID:'\" + queryStr + \"'})-[:ACCESSION]->(acs:Accession)<-[:ACCESSION]-(:Paper) RETURN pp, zz\";\n      }\n\n      console.log(queryStr);\n    }\n  } else queryStr = 'match (n)-[j]-(k) where id(n) = ' + nodeID + ' return n,j,k';\n\n  stopSimulation();\n\n  if (nodeID == null || !nodeID) {\n    nodeItemMap = {};\n    linkItemMap = {};\n  }\n\n  var jqxhr = $.post(neo4jAPIURL, '{\"statements\":[{\"statement\":\"' + queryStr + '\", \"resultDataContents\":[\"graph\"]}]}', function (data) {\n    //console.log(JSON.stringify(data));\n    if (data.errors != null && data.errors.length > 0) {\n      promptAlert($('#graphContainer'), 'Error: ' + data.errors[0].message + '(' + data.errors[0].code + ')', true);\n      return;\n    }\n\n    if (data.results != null && data.results.length > 0 && data.results[0].data != null && data.results[0].data.length > 0) {\n      var neo4jDataItmArray = data.results[0].data;\n      neo4jDataItmArray.forEach(function (dataItem) {\n        //Node\n        if (dataItem.graph.nodes != null && dataItem.graph.nodes.length > 0) {\n          var neo4jNodeItmArray = dataItem.graph.nodes;\n          neo4jNodeItmArray.forEach(function (nodeItm) {\n            if (!(nodeItm.id in nodeItemMap)) {\n              nodeItemMap[nodeItm.id] = nodeItm;\n            }\n          });\n        } //Link\n\n\n        if (dataItem.graph.relationships != null && dataItem.graph.relationships.length > 0) {\n          var neo4jLinkItmArray = dataItem.graph.relationships;\n          neo4jLinkItmArray.forEach(function (linkItm) {\n            if (!(linkItm.id in linkItemMap)) {\n              linkItm.source = linkItm.startNode;\n              linkItm.target = linkItm.endNode;\n              linkItemMap[linkItm.id] = linkItm;\n            }\n          });\n        }\n      });\n      console.log('nodeItemMap.size:' + Object.keys(nodeItemMap).length);\n      console.log('linkItemMap.size:' + Object.keys(linkItemMap).length);\n      var nodes = [nodeItemMap];\n      var edges = [linkItemMap];\n      neo_input_json = JSON.stringify({\n        nodes: nodes,\n        edges: edges\n      }, null, 2);\n      updateGraph();\n      modified_json = {\n        nodes: nodes,\n        edges: edges\n      };\n      return;\n    } //also update graph when empty\n\n\n    updateGraph();\n    promptAlert($('#graphContainer'), 'No record found !', false);\n  }, 'json');\n  jqxhr.fail(function (data) {\n    promptAlert($('#graphContainer'), 'Error: submitted query text but got error return (' + data + ')', true);\n  });\n}\n\nfunction save_as_json() {\n  var blob = new Blob([neo_input_json], {\n    type: 'text/plain;charset=utf-8'\n  });\n  saveAs(blob, 'graph.json');\n}\n\nfunction save_as_gml() {\n  var n_gml = '';\n  var e_gml = '';\n  var full_json = modified_json;\n  var n_keys = Object.keys(full_json.nodes[0]); //var neo_json = JSON.parse(neo_input_json)\n\n  var e_keys = Object.keys(full_json.edges[0]); //console.log(n_keys);\n\n  n_keys.forEach(function (x) {\n    var key = x;\n    var n = full_json.nodes[0][key];\n    var p_keys = Object.keys(n.properties);\n    var props = '';\n    var other_params = '\\t  z 0.0\\n\\t  w 30.0\\n\\t  h 30.0\\n\\t  d 30.0\\n';\n    p_keys.forEach(function (p) {\n      props += '\\t' + p + ' ' + '\"' + n.properties[p] + '\"' + '\\n';\n    });\n    n_gml += '  node\\n  [\\n' + '\\tid ' + n.id + '\\n' + '\\tlabel \"' + n.labels[0] + '\"' + '\\n' + props + '\\tgraphics\\n' + '\\t[\\n' + '\\t  x ' + Number(n.x).toFixed(3) + '\\n' + '\\t  y ' + Number(n.y).toFixed(3) + '\\n' + other_params + '\\t]\\n' + '  ]\\n';\n  });\n  n_gml = 'graph\\n[\\n' + n_gml + '\\n';\n  e_keys.forEach(function (x) {\n    var key = x;\n    var e = full_json.edges[0][key];\n    e_gml += '  edge\\n  [\\n' + '\\tid ' + e.id + '\\n' + '\\tsource ' + e.source.id + '\\n' + '\\ttarget ' + e.target.id + '\\n' + '\\ttype ' + '\"' + e.type + '\"\\n' + '\\tgraphics\\n' + '\\t[\\n' + '\\t  type \"line\"\\n' + '\\t  Line\\n' + '\\t  [\\n' + '\\t\\tpoint\\n' + '\\t\\t[\\n' + '\\t\\tx ' + Number(e.source.x).toFixed(3) + '\\n' + '\\t\\ty ' + Number(e.source.y).toFixed(3) + '\\n' + '\\t\\t]\\n' + '\\t\\tpoint\\n' + '\\t\\t[\\n' + '\\t\\tx ' + Number(e.target.x).toFixed(3) + '\\n' + '\\t\\ty ' + Number(e.target.y).toFixed(3) + '\\n' + '\\t\\t]\\n' + '\\t  ]\\n' + '\\t]\\n' + '  ]\\n';\n    console.log(e_gml);\n  });\n  e_gml = e_gml + '\\n]';\n  var full_gml = n_gml + e_gml;\n  var blob = new Blob([full_gml], {\n    type: 'text/plain;charset=utf-8'\n  });\n  saveAs(blob, 'graph.gml');\n}\n\nfunction save_as_xgmml() {\n  var n_xgmml = '';\n  var e_xgmml = '';\n  var full_json = modified_json;\n  var n_keys = Object.keys(full_json.nodes[0]);\n  var e_keys = Object.keys(full_json.edges[0]);\n  n_keys.forEach(function (x) {\n    var ex_labs = ['x', 'y', 'p_ind', 'acs_ind'];\n    var key = x;\n    var n = full_json.nodes[0][key];\n    var p_keys = Object.keys(n.properties);\n    var props = '';\n    var other_params = '\\t  z 0.0\\n\\t  w 30.0\\n\\t  h 30.0\\n\\t  d 30.0\\n';\n    p_keys.forEach(function (p) {\n      if (!ex_labs.includes(p)) {\n        props += '<att ' + 'name=\"' + p + '\"' + ' value=\"' + n.properties[p] + '\"' + '/>\\n';\n      }\n    });\n    var lab = '';\n    var fill = '';\n\n    if (n.labels[0] == 'Accession') {\n      lab = n.properties.Term;\n      fill = '#fc8d62';\n    } else if (n.labels[0] == 'Paper') {\n      lab = n.properties.PMCID;\n      fill = '#66c2a5';\n    }\n\n    n_xgmml += '<node id=\"' + n.id + '\"' + ' label=\"' + lab + '\"' + ' weight=\"0\">\\n' + props + '<att ' + 'name=\"Node type\"' + ' value=\"' + n.labels[0] + '\"' + '/>\\n' + '<graphics type=\"circle\" x=\"' + Number(n.x).toFixed(3) + '\" y=\"' + Number(n.y).toFixed(3) + '\"' + ' fill=\"' + fill + '\">\\n' + '</graphics>\\n' + '</node>\\n';\n  });\n  e_keys.forEach(function (x) {\n    var key = x;\n    var e = full_json.edges[0][key];\n    e_xgmml += '<edge ' + 'label=\"' + e.type + '\"' + ' source=\"' + e.source.id + '\"' + ' target=\"' + e.target.id + '\"' + ' weight=\"1\"' + '>\\n' + '</edge>\\n';\n  });\n  var full_xgmml = '<?xml version=\"1.0\"?>\\n' + '<!DOCTYPE graph SYSTEM \"xgmml.dtd\">\\n' + '<graph directed=\"1\" graphic=\"1\" Layout=\"points\">\\n' + n_xgmml + e_xgmml + '</graph>';\n  var blob = new Blob([full_xgmml], {\n    type: 'text/plain;charset=utf-8'\n  });\n  saveAs(blob, 'graph.xgmml');\n}\n\nfunction save_as_svg() {\n  var svg_data = document.getElementById('resultSvg').innerHTML;\n  var head = '<svg title=\"graph\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">';\n  var style = '<style>circle {cursor: pointer;stroke-width: 1.5px;}text {font: 10px arial;}path {stroke: DimGrey;stroke-width: 1.5px;}</style>';\n  var full_svg = head + style + svg_data + '</svg>';\n  var blob = new Blob([full_svg], {\n    type: 'image/svg+xml'\n  });\n  saveAs(blob, 'graph.svg');\n}\n\nfunction nodeColor(d, color) {\n  var col = '';\n\n  if (current_id == null && d.properties.Term == currentAccessionID) {\n    col = color;\n  } else if (current_id !== null && (d.properties.PMCID == current_id || d.properties.PMID == current_id)) {\n    col = color;\n  } else {\n    col = getItemColor(d);\n  }\n\n  return col;\n}\n\nfunction nodeColorBrighter(d, color) {\n  var col = '';\n\n  if (current_id == null && d.properties.Term == currentAccessionID) {\n    col = color;\n  } else if (current_id !== null && (d.properties.PMCID == current_id || d.properties.PMID == current_id)) {\n    col = color;\n  } else {\n    col = getColorBrighter(getItemColor(d));\n  }\n\n  return col;\n}\n\nfunction getItemColor(d) {\n  if (!(d.labels[0] in itemColorMap)) itemColorMap[d.labels[0]] = colorScale(d.labels[0]);\n  return itemColorMap[d.labels[0]];\n}\n\nfunction getColorBrighter(targetColor) {\n  return d3.rgb(targetColor).brighter(0.7).toString();\n} //Page Init\n\n\n$(function () {\n  setupNeo4jLoginForAjax(neo4jLogin, neo4jPassword);\n  initGraph();\n  $('#queryText').keyup(function (e) {\n    if (e.which == 13) {\n      submitQuery();\n    }\n  });\n  $('#btnSend').click(function () {\n    submitQuery();\n  });\n  $('#save_as_json').click(save_as_json);\n  $('#save_as_gml').click(save_as_gml);\n  $('#save_as_xgmml').click(save_as_xgmml);\n  $('#save_as_svg').click(save_as_svg);\n  $('#chkboxCypherQry').change(function () {\n    if (this.checked) $('#queryText').prop('placeholder', 'Cypher');else $('#queryText').prop('placeholder', 'Enter PMCID, PMID or acs:Accession Number');\n  });\n});\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });