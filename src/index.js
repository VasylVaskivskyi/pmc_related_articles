'use strict'
//icons http://svgicons.sparkk.fr/
//import { saveAs } from '../libraries/js/FileSaver.min.js'
var { saveAs } = require('file-saver')

//######################### const #########################
var w =
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth

var graphWidth = 1280
var graphHeight = 650
var arrowHeight = 5
var arrowWidth = 5

var neo4jAPIURL = 'http://localhost:7474/db/data/transaction/commit'

var neo4jLogin = 'neo4j'
var neo4jPassword = '1234'

var circleSize = 22
var textPosOffsetY = 5

var collideForceSize = circleSize + 5
var linkForceSize = 150

var iconPosOffset = { lock: [23, -33], info: [23, -10], cross: [23, 13] }
var lockIconSVG =
  'm18,8l-1,0l0,-2c0,-2.76 -3.28865,-5.03754 -5,-5c-1.71135,0.03754 -5.12064,0.07507 -5,4l1.9,0c0,-1.71 1.39,-2.1 3.1,-2.1c1.71,0 3.1,1.39 3.1,3.1l0,2l-9.1,0c-1.1,0 -2,0.9 -2,2l0,10c0,1.1 0.9,2 2,2l12,0c1.1,0 2,-0.9 2,-2l0,-10c0,-1.1 -0.9,-2 -2,-2zm0,12l-12,0l0,-10l12,0l0,10z'
var crossIconSVG =
  'M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'
var infoIconSVG =
  'M16.469,8.924l-2.414,2.413c-0.156,0.156-0.408,0.156-0.564,0c-0.156-0.155-0.156-0.408,0-0.563l2.414-2.414c1.175-1.175,1.175-3.087,0-4.262c-0.57-0.569-1.326-0.883-2.132-0.883s-1.562,0.313-2.132,0.883L9.227,6.511c-1.175,1.175-1.175,3.087,0,4.263c0.288,0.288,0.624,0.511,0.997,0.662c0.204,0.083,0.303,0.315,0.22,0.52c-0.171,0.422-0.643,0.17-0.52,0.22c-0.473-0.191-0.898-0.474-1.262-0.838c-1.487-1.485-1.487-3.904,0-5.391l2.414-2.413c0.72-0.72,1.678-1.117,2.696-1.117s1.976,0.396,2.696,1.117C17.955,5.02,17.955,7.438,16.469,8.924 M10.076,7.825c-0.205-0.083-0.437,0.016-0.52,0.22c-0.083,0.205,0.016,0.437,0.22,0.52c0.374,0.151,0.709,0.374,0.997,0.662c1.176,1.176,1.176,3.088,0,4.263l-2.414,2.413c-0.569,0.569-1.326,0.883-2.131,0.883s-1.562-0.313-2.132-0.883c-1.175-1.175-1.175-3.087,0-4.262L6.51,9.227c0.156-0.155,0.156-0.408,0-0.564c-0.156-0.156-0.408-0.156-0.564,0l-2.414,2.414c-1.487,1.485-1.487,3.904,0,5.391c0.72,0.72,1.678,1.116,2.696,1.116s1.976-0.396,2.696-1.116l2.414-2.413c1.487-1.486,1.487-3.905,0-5.392C10.974,8.298,10.55,8.017,10.076,7.825'
var boxSVG = 'M0 0 L23 0 L23 23 L0 23 Z'

//######################### variable #########################
var nodeItemMap = {}
var linkItemMap = {}

var iconLock
var iconCross
var iconInfo

var nodes = []
var edges = []
var neo_input_json
var modified_json

var d3Simulation = null
var circles
var circleText
var lines
var lineText

var currentID = null
var currentAccessionID = null

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
  zoomGLayer
    .append('g')
    .attr('id', 'control-icon-group')
    .attr('transform', 'translate(' + centerX + ',' + centerY + ')')

  zoom_handler(svg)
}

function tick() {
  lines.attr('d', drawLine)

  //lineText.attr('transform', transformPathLabel);
  circles.attr('transform', transform)
  circleText.attr('transform', transform)
  iconLock.attr('transform', function(d) {
    return transformIcon(d, 'lock')
  })
  iconCross.attr('transform', function(d) {
    return transformIcon(d, 'cross')
  })
  iconInfo.attr('transform', function(d) {
    return transformIcon(d, 'info')
  })
}

function transformPathLabel(d) {
  var sourceX = d.source.x + (d.target.x - d.source.x) / 2
  var sourceY = d.source.y + (d.target.y - d.source.y) / 2
  return 'translate(' + sourceX + ',' + sourceY + ')'
}

function transform(d) {
  return 'translate(' + d.x + ',' + d.y + ')'
}

function transformIcon(d, type) {
  var sourceX = d.x + iconPosOffset[type][0]
  var sourceY = d.y + iconPosOffset[type][1]
  return 'translate(' + sourceX + ',' + sourceY + ')'
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
  $('#propertiesBox > #props').empty()
  $('#propertiesBox > table').empty()
}

function showProperties(d) {

  clearProperties()

  var propertiesText = ''
  var link = ''
  var ex_labs = ['p_ind', 'acs_ind']
  var name = ''

  //NODE PROPERTIES

  $.map(d.properties, function(value, key) {
    if (!ex_labs.includes(key)) {
      propertiesText += key + ': ' + value + '<br/><br/>'
    }
  })

  //TABLE

  $('#table_div').append(
    "<thead><th colspan='3'>Connected to</th></thead><tbody></tbody>"
  )
  $.map(linkItemMap, function(value, key) {
    if (value.startNode == d.id) {
      name = value.target.labels[0] + ' number'
      $('#table_div > tbody').append(
        '<tr>' +
          '<td>' +
          name +
          '</td>' +
          "<td id='acc'>" +
          value.target.properties.Term +
          '</td>' +
          '</tr>'
      )
    }
    if (value.endNode == d.id) {
      name = value.source.labels[0]
      $('#table_div > tbody').append(
        '<tr>' +
          '<td>' +
          name +
          '</td>' +
          '<td>' +
          value.source.properties.Title +
          '</td>' +
          "<td id='PMCID'>" +
          value.source.properties.PMCID +
          '</td>' +
          '</tr>'
      )
    }
  })

  propertiesTable(d)

  //LINKS

  if (Object.keys(d.properties).includes('PMCID')) {
    link = 'https://europepmc.org/abstract/PMC/' + d.properties.PMCID
  } else if (!Object.keys(d.properties).includes('PMCID')) {
    link = 'https://europepmc.org/abstract/MED/' + d.properties.PMID
  }

  $('#propertiesBox > #props').append($('<p></p>').html(propertiesText))
  $('#open_article').attr('href', link)
}

function updateGraph() {
  currentID = $.trim($('#queryText').val())
  if (currentID.substr(0, 4).toLowerCase() == 'acs:') {
    currentAccessionID = currentID.substr(4)
    currentID = null
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
        .data(d3LinkForce.links(), function(d) {return d.id;});*/

  /* ICONS */
  iconLock = d3
    .select('#control-icon-group')
    .selectAll('g.lockIcon')
    .data([], function(d) {
      return d.id
    })
  iconCross = d3
    .select('#control-icon-group')
    .selectAll('g.crossIcon')
    .data([], function(d) {
      return d.id
    })
  iconInfo = d3
    .select('#control-icon-group')
    .selectAll('g.infoIcon')
    .data([], function(d) {
      return d.id
    })

  iconLock.exit().remove()
  iconCross.exit().remove()
  iconInfo.exit().remove()

  /* NODES AND LINKS */
  circles.exit().remove()
  circles = circles
    .enter()
    .append('circle')
    .attr('r', circleSize)
    .attr('fill', function(d) { 
            return nodeColor(d, '#1E90FF')
        })
    .attr('stroke', 'black')
    .call(drag_handler)
    .on('mouseover', function(d) {
      d3.select(this)
        .attr('fill', function(d) {
          return nodeColorBrighter(d, '#AFEEEE')      
           })
        .attr('stroke', 'gray')
      showProperties(d)
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .attr('fill', function(d) {
            return nodeColor(d, '#1E90FF')
          })

        .attr('stroke', 'black')
    })
    .on('dblclick', function(d) {
      d.fx = d.x
      d.fy = d.y
      submitQuery(d.id)
    })
    .on('click', function(d) {
      
      nodeMenu(d)
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
      return t.substr(0, 7)
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
  var queryNode = ''
  if (nodeID == null || !nodeID) {
    queryStr = $.trim($('#queryText').val())
    if (queryStr == '') {
      promptAlert(
        $('#graphContainer'),
        'Error: query text cannot be empty!',
        true
      )
      return
    }

    if ($('#chkboxCypherQry:checked').val() != 1) {
      queryNode = modifyAsNode('p', queryStr)

      if (queryStr.substr(0, 4).toLowerCase() == 'acs:') {
        queryStr =
          'OPTIONAL MATCH zz=(:Paper)-[:ACCESSION]->' + queryNode + ' RETURN zz'
      } else {
        queryStr =
          'OPTIONAL MATCH zz=' +
          queryNode +
          '-[:ACCESSION]->(acs:Accession)' +
          ' OPTIONAL MATCH pp=' +
          queryNode +
          '-[:ACCESSION]->(acs:Accession)<-[:ACCESSION]-(:Paper) RETURN pp, zz'
      }

      console.log(queryStr)
    } else {
      queryStr = queryStr
    }
  } else {
    queryStr = 'MATCH (n)-[j]-(k) WHERE id(n) = ' + nodeID + ' RETURN n,j,k'
  }

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
      promptAlert($('#graphContainer'), 'No record found!', false)
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

function isItConnected() {
  removeAlert()

  var queryStr = null
  var fromNode = ''
  var toNode = ''
  var searchStr = $.trim($('#queryText').val())

  queryStr = $.trim($('#isItConnected').val())

  if (queryStr == '') {
    promptAlert(
      $('#graphContainer'),
      'Error: query text cannot be empty!',
      true
    )
    return
  }

  if (
    queryStr != '' &&
    (queryStr == searchStr ||
      queryStr == currentID ||
      queryStr == currentAccessionID)
  ) {
    promptAlert(
      $('#graphContainer'),
      'Error: you cannot use same values!',
      true
    )
    return
  }

  console.log('1', queryStr)

  if ($('#chkboxConnected:checked').val() != 1) {
    if (currentAccessionID != null && currentID == null) {
      fromNode = modifyAsNode('p1', currentAccessionID)
      toNode = modifyAsNode('p2', queryStr)
    } else if (currentID != null) {
      fromNode = modifyAsNode('p1', currentID)
      toNode = modifyAsNode('p2', queryStr)

      queryStr =
        'MATCH ' +
        fromNode +
        ',' +
        toNode +
        ', path=shortestpath((p1)-[*..15]-(p2)) RETURN path'
    }
  } else {
    nodeItemMap = {}
    linkItemMap = {}
    var val1 = queryStr.split(',')[0].trim()
    var val2 = queryStr.split(',')[1].trim()
    fromNode = modifyAsNode('p1', val1)
    toNode = modifyAsNode('p2', val2)
    queryStr =
      'MATCH ' +
      fromNode +
      ',' +
      toNode +
      ', path=shortestpath((p1)-[*..15]-(p2)) RETURN path'
  }

  console.log('2', queryStr)

  stopSimulation()

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

        updateGraph()
        return
      }

      //also update graph when empty
      updateGraph()
      promptAlert($('#graphContainer'), 'No record found!', false)
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

function modifyAsNode(neovar, val) {
  var label = ''
  var property = ''
  if (val.substr(0, 3) == 'PMC') {
    label = 'Paper'
    property = 'PMCID'
  } else if (val.substr(0, 4).toLowerCase() == 'acs:') {
    val = val.substr(4).toUpperCase()
    label = 'Accession'
    property = 'Term'
  } else {
    label = 'Paper'
    property = 'PMID'
  }

  var node =
    '(' + neovar + ':' + label + '{' + property + ':' + "'" + val + "'" + '})'
  return node
}

function removeNode(d) {
  delete nodeItemMap[d.id]
  $.map(linkItemMap, function(value, key) {
    if (value.startNode == d.id || value.endNode == d.id)
      delete linkItemMap[key]
  })
  $('#context').css('display', 'none')
  updateGraph()
}


function propertiesTable(d) {
  var propertiesNode = d.id
  var selectedrow = null
  var lineselection = null

  $('#table_div > tbody > tr').on('mouseover', function() {
    var selector = null
    var selection = null
    var tpaper =
      $(this)
        .children('#PMCID')
        .text() || null
    var tacc =
      $(this)
        .children('#acc')
        .text() || null

    if (tpaper != null) {
      selector = 'PMCID'
      selection = tpaper
    } else if (tacc != null) {
      selector = 'Term'
      selection = tacc
    }

    d3.select('#circle-group')
      .selectAll('circle')
      .filter(function(d) {
        if (d.properties[selector] == selection) {
          selectedrow = d.id
          d3.select(this).attr('fill', '#fcc200')
        }
      })

    d3.select('#path-group')
      .selectAll('path')
      .filter(function(d) {
        if (
          (d.source.id == selectedrow && d.target.id == propertiesNode) ||
          (d.source.id == propertiesNode && d.target.id == selectedrow)
        ) {
          lineselection = d.index
          d3.select(this)
            .style('stroke', '#fcc200')
            .style('stroke-width', '3px')
        }
      })
  })

  $('#table_div > tbody > tr').on('mouseout', function() {
    d3.select('#circle-group')
      .selectAll('circle')
      .filter(function(d) {
        if (d.id == selectedrow) {
          d3.select(this).attr('fill', function(d) {
            return nodeColor(d, '#1E90FF')
          })
        }
      })

    d3.select('#path-group')
      .selectAll('path')
      .filter(function(d) {
        if (d.index == lineselection) {
          d3.select(this)
            .style('stroke', 'DimGrey')
            .style('stroke-width', '1.5px')
        }
      })
  })
}

function stopSimulation() {
  if (d3Simulation != null) {
    d3Simulation.stop().on('tick', null)
    d3Simulation = null
  }
}

function save_as_json() {
  var blob = new Blob([neo_input_json], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'graph.json')
}

function save_as_gml_vos() {
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
      var ex_labs = ['p_ind', 'acs_ind', 'Title']
      if (!ex_labs.includes(p)) {
        props += '\t' + p + ' ' + '"' + n.properties[p] + '"' + '\n'
      }
    })
    var title = n.properties.Title || n.properties.Term
    n_gml +=
      '  node\n  [\n' +
      '\tid ' +
      n.id +
      '\n' +
      '\tlabel "' +
      title +
      '"' +
      '\n' +
      '\ttype "' +
      n.labels[0] +
      '"' +
      '\n' +
      props +
      '\t  x ' +
      Number(n.x).toFixed(3) +
      '\n' +
      '\t  y ' +
      Number(n.y).toFixed(3) +
      '\n' +
      other_params +
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
      '  ]\n'
    console.log(e_gml)
  })
  e_gml = e_gml + '\n]'

  var full_gml = n_gml + e_gml
  var blob = new Blob([full_gml], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'graph.gml')
}

function save_as_gml_gephi() {
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

function nodeColor(d, color) {
  var col = ''
  if (currentID == null && d.properties.Term == currentAccessionID) {
    col = color
  } else if (
    currentID !== null &&
    (d.properties.PMCID == currentID || d.properties.PMID == currentID)
  ) {
    col = color
  } else {
    col = getItemColor(d)
  }
  return col
}

function nodeColorBrighter(d, color) {
  var col = ''
  if (currentID == null && d.properties.Term == currentAccessionID) {
    col = color
  } else if (
    currentID !== null &&
    (d.properties.PMCID == currentID || d.properties.PMID == currentID)
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

function nodeMenu(d) {

  iconLock = d3
    .select('#control-icon-group')
    .selectAll('g.lockIcon')
    .data([d], function(d) {
      return d.id
    })
  iconCross = d3
    .select('#control-icon-group')
    .selectAll('g.crossIcon')
    .data([d], function(d) {
      return d.id
    })
  iconInfo = d3
    .select('#control-icon-group')
    .selectAll('g.infoIcon')
    .data([d], function(d) {
      return d.id
    })

  iconLock.exit().remove()
  iconLock.remove()
  iconCross.exit().remove()
  iconCross.remove()
  iconInfo.exit().remove()
  iconInfo.remove()

  var iconLockEnter = iconLock
    .enter()
    .append('g')
    .attr('class', 'lockIcon')
    .attr('transform', function(d) {
      return transformIcon(d, 'lock')
    })
    .on('click', function(d) {
      d.fx = null
      d.fy = null

      iconLock.remove()
      iconCross.remove()
      iconInfo.remove()   
    })

  var iconCrossEnter = iconCross
    .enter()
    .append('g')
    .attr('class', 'crossIcon')
    .attr('transform', function(d) {
      return transformIcon(d, 'cross')
    })
    .on('click', function(d) {
      removeNode(d)
      updateGraph()
    })

  var iconInfoEnter = iconInfo
    .enter()
    .append('g')
    .attr('class', 'infoIcon')
    .attr('transform', function(d) {
      return transformIcon(d, 'info')
    })
    .on('click', function(d) {
      var link = ''
      if (Object.keys(d.properties).includes('PMCID')) {
        link = 'https://europepmc.org/abstract/PMC/' + d.properties.PMCID
      } else if (!Object.keys(d.properties).includes('PMCID')) {
        link = 'https://europepmc.org/abstract/MED/' + d.properties.PMID
      }
      window.open(link)
      iconLock.remove()
      iconCross.remove()
      iconInfo.remove()
    })

  iconLockEnter
    .append('path')
    .attr('class', 'overlay')
    .attr('d', boxSVG)
  iconLockEnter.append('path').attr('d', lockIconSVG)
  iconCrossEnter
    .append('path')
    .attr('class', 'overlay')
    .attr('d', boxSVG)
  iconCrossEnter.append('path').attr('d', crossIconSVG)
  iconInfoEnter
    .append('path')
    .attr('class', 'overlay')
    .attr('d', boxSVG)
  iconInfoEnter.append('path').attr('d', infoIconSVG)

  iconLock = iconLockEnter.merge(iconLock)
  iconCross = iconCrossEnter.merge(iconCross)
  iconInfo = iconInfoEnter.merge(iconInfo)
}

$(function() {
  $('[data-toggle="popover"]').popover({
    container: 'body',
  })
})

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
  $('#btnConnected').click(function() {
    isItConnected()
  })

  $('#save_as_json').click(save_as_json)
  $('#save_as_gml_gephi').click(save_as_gml_gephi)
  $('#save_as_gml_vos').click(save_as_gml_vos)
  $('#save_as_xgmml').click(save_as_xgmml)
  $('#save_as_svg').click(save_as_svg)

  $('#display_title').click(function() {
    $(this).attr('class', 'dropdown-item active')
    $('#display_id').attr('class', 'dropdown-item')
    circleText.text(function(d) {
      if (d.labels[0] == 'Paper') {
        var t = d.properties.Title.substr(0, 5) + '..'
      } else {
        var t = d.properties.Term
      }
      return t.substr(0, 7)
    })
    updateGraph()
  })

  $('#display_id').click(function() {
    $(this).attr('class', 'dropdown-item active')
    $('#display_title').attr('class', 'dropdown-item')
    circleText.text(function(d) {
      if (d.labels[0] == 'Paper') {
        var t = d.properties.PMCID.substr(3) || d.properties.PMID
      } else {
        var t = d.properties.Term
      }
      return t.substr(0, 7)
    })
    updateGraph()
  })

  $('#chkboxCypherQry').change(function() {
    if (this.checked) $('#queryText').prop('placeholder', 'Cypher')
    else
      $('#queryText').prop(
        'placeholder',
        'Enter PMCID, PMID or acs:Accession Number'
      )
  })
})
