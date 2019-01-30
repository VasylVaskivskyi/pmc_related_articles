'use strict'

// import { saveAs } from 'file-saver'
var { saveAs } = require('file-saver')

//######################### const #########################
var graphWidth = 1024
var graphHeight = 650
var arrowHeight = 5
var arrowWidth = 5

var neo4jAPIURL = 'http://localhost:7474/db/data/transaction/commit'
var neo4jLogin = 'neo4j'
var neo4jPassword = '1234'

var circleSize = 20
var textPosOffsetY = 5

var collideForceSize = circleSize + 5
var linkForceSize = 150

//######################### variable #########################
var nodeItemMap = {}
var linkItemMap = {}

var nodes = []
var edges = []
var neo_input_json
var modified_json

var d3Simulation = null
var circles
var circleText
var lines
var lineText

var current_id
var currentAccessionID

var itemColorMap = {}
var colorScale = d3.scaleOrdinal(d3.schemeSet2)

var drag_handler = d3
  .drag()
  .on('start', drag_start)
  .on('drag', drag_move)
  .on('end', drag_end)

var zoom_handler = d3
  .zoom()
  .filter(function() {
    //Only enable wheel zoom and mousedown to pan
    return (d3.event.type == 'wheel') | (d3.event.type == 'mousedown')
  })
  .on('zoom', zoom_actions)

function unfreezeItms() {
  var nodeItmArray = d3Simulation.nodes()
  if (nodeItmArray != null) {
    nodeItmArray.forEach(function(nodeItm) {
      if (nodeItm.fx != null) {
        nodeItm.fx = null
        nodeItm.fy = null
      }
    })
  }
}

function drag_start(d) {
  //if (!d3.event.active && d3Simulation != null)
  d3Simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

function drag_move(d) {
  d.fx = d3.event.x
  d.fy = d3.event.y
}

function drag_end(d) {
  if (!d3.event.active && d3Simulation != null) d3Simulation.alphaTarget(0)
  //d.fx = null;
  //d.fy = null;
}

function zoom_actions() {
  d3.select('#resultSvg')
    .select('g')
    .attr('transform', d3.event.transform)
}

function initGraph() {
  var svg = d3.select('#resultSvg')
  var zoomGLayer = svg.append('g')

  var centerX = graphWidth / 4
  var centerY = graphHeight / 4

  svg.attr('width', graphWidth).attr('height', graphHeight)

  /*
    var defs = svg.append('defs');
    Not use marker as IE does not support it and so embed the arrow in the path directly
    // define arrow markers for graph links
    defs.append('marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5');
    */
  zoomGLayer
    .append('g')
    .attr('id', 'path-group')
    .attr('transform', 'translate(' + centerX + ',' + centerY + ')')
  zoomGLayer
    .append('g')
    .attr('id', 'path-label-group')
    .attr('transform', 'translate(' + centerX + ',' + centerY + ')')
  zoomGLayer
    .append('g')
    .attr('id', 'circle-group')
    .attr('transform', 'translate(' + centerX + ',' + centerY + ')')
  zoomGLayer
    .append('g')
    .attr('id', 'text-group')
    .attr('transform', 'translate(' + centerX + ',' + centerY + ')')

  zoom_handler(svg)
}

function stopSimulation() {
  if (d3Simulation != null) {
    d3Simulation.stop().on('tick', null)
    d3Simulation = null
  }
}

function tick() {
  lines.attr('d', drawLine)

  //lineText.attr('transform', transformPathLabel);
  circles.attr('transform', transform)
  circleText.attr('transform', transform)
}

function transformPathLabel(d) {
  var sourceX = d.source.x + (d.target.x - d.source.x) / 2
  var sourceY = d.source.y + (d.target.y - d.source.y) / 2
  return 'translate(' + sourceX + ',' + sourceY + ')'
}

function transform(d) {
  return 'translate(' + d.x + ',' + d.y + ')'
}

function drawLine(d) {
  var deltaX,
    deltaY,
    dist,
    cosTheta,
    sinTheta,
    sourceX,
    sourceY,
    targetX,
    targetY

  deltaX = d.target.x - d.source.x
  deltaY = d.target.y - d.source.y
  dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  cosTheta = deltaX / dist
  sinTheta = deltaY / dist

  sourceX = d.source.x + circleSize * cosTheta
  sourceY = d.source.y + circleSize * sinTheta
  ;(targetX = d.target.x - circleSize * cosTheta),
    (targetY = d.target.y - circleSize * sinTheta)

  //Not use marker as IE does not support it and so embed the arrow in the path directly
  var arrowLeftX, arrowLeftY, arrowRightX, arrowRightY

  arrowLeftX = targetX - arrowHeight * sinTheta - arrowWidth * cosTheta
  arrowLeftY = targetY + arrowHeight * cosTheta - arrowWidth * sinTheta
  arrowRightX = targetX + arrowHeight * sinTheta - arrowWidth * cosTheta
  arrowRightY = targetY - arrowHeight * cosTheta - arrowWidth * sinTheta

  return (
    'M' +
    sourceX +
    ' ' +
    sourceY +
    ' L' +
    targetX +
    ' ' +
    targetY +
    ' M' +
    targetX +
    ' ' +
    targetY +
    ' L' +
    arrowLeftX +
    ' ' +
    arrowLeftY +
    ' L' +
    arrowRightX +
    ' ' +
    arrowRightY +
    ' Z'
  )
}

function clearProperties() {
  $('#propertiesBox').empty()
}

function showProperties(d) {
  clearProperties()
  var propertiesText = ''
  var link = ''
  var ex_labs = ['p_ind', 'acs_ind']
  //var propertiesText = 'id: ' + d.id;
  //For nodes
  //if (d.labels != null)
  //propertiesText += ', labels: ' + d.labels.join(', ');
  //For links
  //if (d.type != null)
  //  propertiesText += ', type: ' + d.type;

  $.map(d.properties, function(value, key) {
    if (!ex_labs.includes(key)) {
      propertiesText += key + ': ' + value + '<br/><br/>'
    }
  })
  if (Object.keys(d.properties).includes('PMCID')) {
    link = 'https://europepmc.org/abstract/PMC/' + d.properties.PMCID
  } else if (!Object.keys(d.properties).includes('PMCID')) {
    link = 'https://europepmc.org/abstract/MED/' + d.properties.PMID
  }
  $('#propertiesBox').append($('<p></p>').html(propertiesText))
  $('#open_article').attr('href', link)
}

function updateGraph() {
  current_id = $.trim($('#queryText').val())
  if (current_id.substr(0, 4).toLowerCase() == 'acs:') {
    currentAccessionID = current_id.substr(4)
    current_id = null
  }


  var d3LinkForce = d3
    .forceLink()
    .distance(linkForceSize)
    .links(mapToArray(linkItemMap))
    .id(function(d) {
      return d.id
    })

  d3Simulation = d3
    .forceSimulation()
    .force('charge', d3.forceManyBody().strength(-250))
    .force('collideForce', d3.forceCollide(collideForceSize).iterations(1))
    //.force('center', d3.forceCenter(100, 100))
    .force('x', d3.forceX(graphWidth / 4).strength(0.03))
    .force('y', d3.forceY(graphHeight / 4).strength(0.03))
    .nodes(mapToArray(nodeItemMap))
    .force('linkForce', d3LinkForce)

  circles = d3
    .select('#circle-group')
    .selectAll('circle')
    .data(d3Simulation.nodes(), function(d) {
      return d.id
    })
  circleText = d3
    .select('#text-group')
    .selectAll('text')
    .data(d3Simulation.nodes(), function(d) {
      return d.id
    })
  lines = d3
    .select('#path-group')
    .selectAll('path')
    .data(d3LinkForce.links(), function(d) {
      return d.id
    })
  /*  lineText = d3.select('#path-label-group').selectAll('text')
        .data(d3LinkForce.links(), function(d) {return d.id;});
*/

  circles.exit().remove()
  circles = circles
    .enter()
    .append('circle')
    .attr('r', circleSize)
    .attr('fill', function(d){return nodeColor(d,'#1E90FF')})
    .attr('stroke', 'black')
    .call(drag_handler)
    .on('mouseover', function(d) {
      d3.select(this)
        .attr('fill', function(d){return nodeColorBrighter(d,'#AFEEEE')})
        .attr('stroke', 'gray')
      showProperties(d)
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .attr('fill', function(d) {return nodeColor(d,'#1E90FF')})
        .attr('stroke', 'black')
    })
    .on('dblclick', function(d) {
      d.fx = d.x
      d.fy = d.y
      submitQuery(d.id)
    })
    .merge(circles)

  circleText.exit().remove()
  circleText = circleText
    .enter()
    .append('text')
    .attr('y', textPosOffsetY)
    .attr('text-anchor', 'middle')
    .text(function(d) {
      if (d.labels[0] == 'Paper') {
        var t = d.properties.Title
      } else {
        var t = d.properties.Term
      }
      return t.substr(0, 6)
    })
    .merge(circleText)

  lines.exit().remove()
  lines = lines
    .enter()
    .append('path')
    .merge(lines)

  /*
      lineText.exit().remove();
      lineText = lineText.enter().append('text')
        .attr('y', textPosOffsetY)
        .attr('text-anchor', 'middle')
        .text(null)  //function(d) {return d.type;}
        .merge(lineText);
*/
  d3Simulation.on('tick', tick).on('end', function() {
    unfreezeItms()
  })
}

function submitQuery(nodeID) {
  removeAlert()

  var queryStr = null
  if (nodeID == null || !nodeID) {
    queryStr = $.trim($('#queryText').val())
    if (queryStr == '') {
      promptAlert(
        $('#graphContainer'),
        'Error: query text cannot be empty !',
        true
      )
      return
    }
    if ($('#chkboxCypherQry:checked').val() != 1) {
      if (queryStr.substr(0, 4).toLowerCase() == 'acs:') {
        queryStr =
          "OPTIONAL MATCH zz= (:Paper)-[:ACCESSION]->(acs:Accession {Term:'" +
          queryStr.substr(4) +
          "'}) RETURN zz"
      } else if (queryStr.substr(0, 3) == 'PMC') {
        queryStr =
          "OPTIONAL MATCH zz=(p:Paper{PMCID:'" +
          queryStr +
          "'})-[:ACCESSION]->(acs:Accession) " +
          "OPTIONAL MATCH pp= (p:Paper{PMCID:'" +
          queryStr +
          "'})-[:ACCESSION]->(acs:Accession)<-[:ACCESSION]-(:Paper) RETURN pp, zz"
      } else {
        queryStr =
          "OPTIONAL MATCH zz=(p:Paper{PMID:'" +
          queryStr +
          "'})-[:ACCESSION]->(acs:Accession) " +
          "OPTIONAL MATCH pp= (p:Paper{PMID:'" +
          queryStr +
          "'})-[:ACCESSION]->(acs:Accession)<-[:ACCESSION]-(:Paper) RETURN pp, zz"
      }
      console.log(queryStr)
    }
  } else
    queryStr = 'match (n)-[j]-(k) where id(n) = ' + nodeID + ' return n,j,k'

  stopSimulation()

  if (nodeID == null || !nodeID) {
    nodeItemMap = {}
    linkItemMap = {}
  }

  var jqxhr = $.post(
    neo4jAPIURL,
    '{"statements":[{"statement":"' +
      queryStr +
      '", "resultDataContents":["graph"]}]}',
    function(data) {
      //console.log(JSON.stringify(data));
      if (data.errors != null && data.errors.length > 0) {
        promptAlert(
          $('#graphContainer'),
          'Error: ' + data.errors[0].message + '(' + data.errors[0].code + ')',
          true
        )
        return
      }

      if (
        data.results != null &&
        data.results.length > 0 &&
        data.results[0].data != null &&
        data.results[0].data.length > 0
      ) {
        var neo4jDataItmArray = data.results[0].data
        neo4jDataItmArray.forEach(function(dataItem) {
          //Node
          if (dataItem.graph.nodes != null && dataItem.graph.nodes.length > 0) {
            var neo4jNodeItmArray = dataItem.graph.nodes
            neo4jNodeItmArray.forEach(function(nodeItm) {
              if (!(nodeItm.id in nodeItemMap)) {
                nodeItemMap[nodeItm.id] = nodeItm
              }
            })
          }
          //Link
          if (
            dataItem.graph.relationships != null &&
            dataItem.graph.relationships.length > 0
          ) {
            var neo4jLinkItmArray = dataItem.graph.relationships
            neo4jLinkItmArray.forEach(function(linkItm) {
              if (!(linkItm.id in linkItemMap)) {
                linkItm.source = linkItm.startNode
                linkItm.target = linkItm.endNode
                linkItemMap[linkItm.id] = linkItm
              }
            })
          }
        })

        console.log('nodeItemMap.size:' + Object.keys(nodeItemMap).length)
        console.log('linkItemMap.size:' + Object.keys(linkItemMap).length)

        var nodes = [nodeItemMap]
        var edges = [linkItemMap]
        neo_input_json = JSON.stringify({ nodes: nodes, edges: edges }, null, 2)

        updateGraph()
        modified_json = { nodes: nodes, edges: edges }

        return
      }

      //also update graph when empty
      updateGraph()
      promptAlert($('#graphContainer'), 'No record found !', false)
    },
    'json'
  )

  jqxhr.fail(function(data) {
    promptAlert(
      $('#graphContainer'),
      'Error: submitted query text but got error return (' + data + ')',
      true
    )
  })
}

export function save_as_json() {
  var blob = new Blob([neo_input_json], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'graph.json')
}

function save_as_gml() {
  var n_gml = ''
  var e_gml = ''
  var full_json = modified_json
  var n_keys = Object.keys(full_json.nodes[0])
  //var neo_json = JSON.parse(neo_input_json)
  var e_keys = Object.keys(full_json.edges[0])
  //console.log(n_keys);

  n_keys.forEach(function(x) {
    var key = x
    var n = full_json.nodes[0][key]
    var p_keys = Object.keys(n.properties)
    var props = ''
    var other_params = '\t  z 0.0\n\t  w 30.0\n\t  h 30.0\n\t  d 30.0\n'
    p_keys.forEach(function(p) {
      props += '\t' + p + ' ' + '"' + n.properties[p] + '"' + '\n'
    })
    n_gml +=
      '  node\n  [\n' +
      '\tid ' +
      n.id +
      '\n' +
      '\tlabel "' +
      n.labels[0] +
      '"' +
      '\n' +
      props +
      '\tgraphics\n' +
      '\t[\n' +
      '\t  x ' +
      Number(n.x).toFixed(3) +
      '\n' +
      '\t  y ' +
      Number(n.y).toFixed(3) +
      '\n' +
      other_params +
      '\t]\n' +
      '  ]\n'
  })

  n_gml = 'graph\n[\n' + n_gml + '\n'

  e_keys.forEach(function(x) {
    var key = x
    var e = full_json.edges[0][key]

    e_gml +=
      '  edge\n  [\n' +
      '\tid ' +
      e.id +
      '\n' +
      '\tsource ' +
      e.source.id +
      '\n' +
      '\ttarget ' +
      e.target.id +
      '\n' +
      '\ttype ' +
      '"' +
      e.type +
      '"\n' +
      '\tgraphics\n' +
      '\t[\n' +
      '\t  type "line"\n' +
      '\t  Line\n' +
      '\t  [\n' +
      '\t\tpoint\n' +
      '\t\t[\n' +
      '\t\tx ' +
      Number(e.source.x).toFixed(3) +
      '\n' +
      '\t\ty ' +
      Number(e.source.y).toFixed(3) +
      '\n' +
      '\t\t]\n' +
      '\t\tpoint\n' +
      '\t\t[\n' +
      '\t\tx ' +
      Number(e.target.x).toFixed(3) +
      '\n' +
      '\t\ty ' +
      Number(e.target.y).toFixed(3) +
      '\n' +
      '\t\t]\n' +
      '\t  ]\n' +
      '\t]\n' +
      '  ]\n'
    console.log(e_gml)
  })
  e_gml = e_gml + '\n]'

  var full_gml = n_gml + e_gml
  var blob = new Blob([full_gml], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'graph.gml')
}

function save_as_xgmml() {
  var n_xgmml = ''
  var e_xgmml = ''
  var full_json = modified_json
  var n_keys = Object.keys(full_json.nodes[0])
  var e_keys = Object.keys(full_json.edges[0])

  n_keys.forEach(function(x) {
    var ex_labs = ['x', 'y', 'p_ind', 'acs_ind']
    var key = x
    var n = full_json.nodes[0][key]
    var p_keys = Object.keys(n.properties)
    var props = ''
    var other_params = '\t  z 0.0\n\t  w 30.0\n\t  h 30.0\n\t  d 30.0\n'
    p_keys.forEach(function(p) {
      if (!ex_labs.includes(p)) {
        props +=
          '<att ' +
          'name="' +
          p +
          '"' +
          ' value="' +
          n.properties[p] +
          '"' +
          '/>\n'
      }
    })
    var lab = ''
    var fill = ''
    if (n.labels[0] == 'Accession') {
      lab = n.properties.Term
      fill = '#fc8d62'
    } else if (n.labels[0] == 'Paper') {
      lab = n.properties.PMCID
      fill = '#66c2a5'
    }
    n_xgmml +=
      '<node id="' +
      n.id +
      '"' +
      ' label="' +
      lab +
      '"' +
      ' weight="0">\n' +
      props +
      '<att ' +
      'name="Node type"' +
      ' value="' +
      n.labels[0] +
      '"' +
      '/>\n' +
      '<graphics type="circle" x="' +
      Number(n.x).toFixed(3) +
      '" y="' +
      Number(n.y).toFixed(3) +
      '"' +
      ' fill="' +
      fill +
      '">\n' +
      '</graphics>\n' +
      '</node>\n'
  })

  e_keys.forEach(function(x) {
    var key = x
    var e = full_json.edges[0][key]
    e_xgmml +=
      '<edge ' +
      'label="' +
      e.type +
      '"' +
      ' source="' +
      e.source.id +
      '"' +
      ' target="' +
      e.target.id +
      '"' +
      ' weight="1"' +
      '>\n' +
      '</edge>\n'
  })

  var full_xgmml =
    '<?xml version="1.0"?>\n' +
    '<!DOCTYPE graph SYSTEM "xgmml.dtd">\n' +
    '<graph directed="1" graphic="1" Layout="points">\n' +
    n_xgmml +
    e_xgmml +
    '</graph>'
  var blob = new Blob([full_xgmml], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'graph.xgmml')
}

function save_as_svg() {
  var svg_data = document.getElementById('resultSvg').innerHTML
  var head =
    '<svg title="graph" version="1.1" xmlns="http://www.w3.org/2000/svg">'
  var style =
    '<style>circle {cursor: pointer;stroke-width: 1.5px;}text {font: 10px arial;}path {stroke: DimGrey;stroke-width: 1.5px;}</style>'

  var full_svg = head + style + svg_data + '</svg>'
  var blob = new Blob([full_svg], { type: 'image/svg+xml' })
  saveAs(blob, 'graph.svg')
}

function nodeColor(d,color){
  var col = ''
  if (current_id == null && d.properties.Term == currentAccessionID) {
    col = color
  } else if (
    current_id !== null &&
    (d.properties.PMCID == current_id ||
      d.properties.PMID == current_id)
  ) {
    col = color
  } else {
    col = getItemColor(d)
  }
  return col
}

function nodeColorBrighter(d,color){
  var col = ''
  if (current_id == null && d.properties.Term == currentAccessionID) {
    col = color
  } else if (
    current_id !== null &&
    (d.properties.PMCID == current_id ||
      d.properties.PMID == current_id)
  ) {
    col = color
  } else {
    col = getColorBrighter(getItemColor(d))
  }
  return col
}

function getItemColor(d) {
  if (!(d.labels[0] in itemColorMap))
    itemColorMap[d.labels[0]] = colorScale(d.labels[0])
  return itemColorMap[d.labels[0]]
}

function getColorBrighter(targetColor) {
  return d3
    .rgb(targetColor)
    .brighter(0.7)
    .toString()
}

function getColorDarker(targetColor) {
  return d3
    .rgb(targetColor)
    .darker()
    .toString()
}

//Page Init
$(function() {
  setupNeo4jLoginForAjax(neo4jLogin, neo4jPassword)

  initGraph()

  $('#queryText').keyup(function(e) {
    if (e.which == 13) {
      submitQuery()
    }
  })

  $('#btnSend').click(function() {
    submitQuery()
  })

  $('#save_as_json').click(save_as_json)
  $('#save_as_gml').click(save_as_gml)
  $('#save_as_xgmml').click(save_as_xgmml)
  $('#save_as_svg').click(save_as_svg)

  $('#chkboxCypherQry').change(function() {
    if (this.checked) $('#queryText').prop('placeholder', 'Cypher')
    else
      $('#queryText').prop(
        'placeholder',
        'Enter PMCID, PMID or acs:Accession Number'
      )
  })
})
