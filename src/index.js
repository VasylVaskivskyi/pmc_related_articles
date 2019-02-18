'use strict'
//icons http://svgicons.sparkk.fr/
//import { saveAs } from '../libraries/js/FileSaver.min.js'
//var { saveAs } = require('file-saver')

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

var iconPosOffset = { lock: [23, -33], info: [23, -10], cross: [23, 13], desc: [23, 35] }
var lockIconSVG =
  'm18,8l-1,0l0,-2c0,-2.76 -3.28865,-5.03754 -5,-5c-1.71135,0.03754 -5.12064,0.07507 -5,4l1.9,0c0,-1.71 1.39,-2.1 3.1,-2.1c1.71,0 3.1,1.39 3.1,3.1l0,2l-9.1,0c-1.1,0 -2,0.9 -2,2l0,10c0,1.1 0.9,2 2,2l12,0c1.1,0 2,-0.9 2,-2l0,-10c0,-1.1 -0.9,-2 -2,-2zm0,12l-12,0l0,-10l12,0l0,10z'
var crossIconSVG =
  'M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z'
var infoIconSVG =
  'M17.218,2.268L2.477,8.388C2.13,8.535,2.164,9.05,2.542,9.134L9.33,10.67l1.535,6.787c0.083,0.377,0.602,0.415,0.745,0.065l6.123-14.74C17.866,2.46,17.539,2.134,17.218,2.268 M3.92,8.641l11.772-4.89L9.535,9.909L3.92,8.641z M11.358,16.078l-1.268-5.613l6.157-6.157L11.358,16.078z'
var descIconSVG = 
  'M10.219,1.688c-4.471,0-8.094,3.623-8.094,8.094s3.623,8.094,8.094,8.094s8.094-3.623,8.094-8.094S14.689,1.688,10.219,1.688 M10.219,17.022c-3.994,0-7.242-3.247-7.242-7.241c0-3.994,3.248-7.242,7.242-7.242c3.994,0,7.241,3.248,7.241,7.242C17.46,13.775,14.213,17.022,10.219,17.022 M15.099,7.03c-0.167-0.167-0.438-0.167-0.604,0.002L9.062,12.48l-2.269-2.277c-0.166-0.167-0.437-0.167-0.603,0c-0.166,0.166-0.168,0.437-0.002,0.603l2.573,2.578c0.079,0.08,0.188,0.125,0.3,0.125s0.222-0.045,0.303-0.125l5.736-5.751C15.268,7.466,15.265,7.196,15.099,7.03'
var boxSVG = 'M0 0 L23 0 L23 23 L0 23 Z'

//######################### variable #########################
var nodeItemMap = {}
var linkItemMap = {}

var iconLock
var iconCross
var iconInfo
var iconDesc

var nodes = []
var edges = []
var neo_input_json
var modified_json

var currentNode = null

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
  iconDesc.attr('transform', function(d) {
    return transformIcon(d, 'desc')
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
  if (currentNode != null){
    d = currentNode
  }else{
    d = d
  }
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

  $('#table_div').append("<thead><th colspan='3'>Connected to</th></thead><tbody></tbody>" )
  $.map(linkItemMap, function(value, key) {
    if (value.startNode == d.id) {
      name = value.target.labels[0] + ' number'
      $('#table_div > tbody').append(
        '<tr>' +
          '<td>' +
          name +
          '</td>' +
          '<td>' +
          value.target.properties.Database +
          '</td>' +
          '<td id="acc">' +
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
          '<td id="PMCID">' +
          value.source.properties.PMCID +
          '</td>' +
          '</tr>'
      )
    }
  })

  propertiesTableSelector(d)

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
  if (currentID.substr(0, 4).toLowerCase() == 'acc:') {
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
  iconDesc = d3
    .select('#control-icon-group')
    .selectAll('g.descIcon')
    .data([], function(d) {
      return d.id
    })

  iconLock.exit().remove()
  iconCross.exit().remove()
  iconInfo.exit().remove()
  iconDesc.exit().remove()

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

function removeNode(d) {
  delete nodeItemMap[d.id]
  $.map(linkItemMap, function(value, key) {
    if (value.startNode == d.id || value.endNode == d.id)
      delete linkItemMap[key]
  })
  $('#context').css('display', 'none')
  updateGraph()
}


function propertiesTableSelector(d) {
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
          d3.select(this).style('fill', '#fcc200')
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
          d3.select(this).style('fill', null)

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
  var selectedNode = d

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
  iconDesc = d3
    .select('#control-icon-group')
    .selectAll('g.descIcon')
    .data([d], function(d) {
      return d.id
    })


  iconLock.exit().remove()
  iconLock.remove()
  iconCross.exit().remove()
  iconCross.remove()
  iconInfo.exit().remove()
  iconInfo.remove()
  iconDesc.exit().remove()
  iconDesc.remove()

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
      iconDesc.remove()
   
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
      iconDesc.remove()

    })


var iconDescEnter = iconDesc
  .enter()
  .append('g')
  .attr('class', 'descIcon')
  .attr('transform', function(d) {
    return transformIcon(d, 'desc')
  })
  .on('click', function(d) {
      d3.select('#control-icon-group')
        .selectAll('g.descIcon path')
        .style('fill', '#fcc200')
        .style('stroke', 'white')


    d3.select('#circle-group')
      .selectAll('circle')
      .filter(function(d) {
        if (d.id == selectedNode.id) {
          if (d3.select(this).attr('clicked') != 'true') {
            d3.select(this)
              .style('fill', '#fcc200')
              .attr('clicked', 'true')
            currentNode = d
          } else if (d3.select(this).attr('clicked') == 'true') {
            d3.select(this)
              .style('fill', null)
              .attr('clicked', 'false')
            currentNode = null

            iconLock.remove()
            iconCross.remove()
            iconInfo.remove()
            iconDesc.remove()
          }
        }
      })
  })



  iconLockEnter
    .append('path')
    .attr('class', 'overlay')
    .attr('d', boxSVG)
  iconLockEnter.append('path').attr('d', lockIconSVG).append('svg:title').text('Release node')
  
  iconCrossEnter
    .append('path')
    .attr('class', 'overlay')
    .attr('d', boxSVG)
  iconCrossEnter.append('path').attr('d', crossIconSVG).append('svg:title').text('Delete node')

  iconInfoEnter
    .append('path')
    .attr('class', 'overlay')
    .attr('d', boxSVG)
  iconInfoEnter.append('path').attr('d', infoIconSVG).append('svg:title').text('Open node in external site')
 
  iconDescEnter
    .append('path')
    .attr('class', 'overlay')
    .attr('d', boxSVG)
  iconDescEnter.append('path').attr('d', descIconSVG).append('svg:title').text('Lock description')


  iconLock = iconLockEnter.merge(iconLock)
  iconCross = iconCrossEnter.merge(iconCross)
  iconInfo = iconInfoEnter.merge(iconInfo)
  iconDesc = iconDescEnter.merge(iconDesc)
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



  $('#save_as_json').on('click', function(){save_as_json(neo_input_json)})
  $('#save_as_gml_gephi').on('click', function(){save_as_gml_gephi(modified_json)})
  $('#save_as_gml_vos').on('click', function(){save_as_gml_vos(modified_json)})
  $('#save_as_xgmml').on('click', function(){save_as_xgmml(modified_json)})
  $('#save_as_svg').on('click', save_as_svg)



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

  $('#display_legend').click(function() {
    if ($(this).attr('class') == 'dropdown-item'){
      $('#legend').css('display','block')
      $(this).attr('class','dropdown-item active')
    }else{
      $('#legend').css('display','none')
      $(this).attr('class','dropdown-item')
    }
      
  })


  $('#chkboxCypherQry').change(function() {
    if (this.checked) $('#queryText').prop('placeholder', 'Cypher')
    else
      $('#queryText').prop(
        'placeholder',
        'Enter PMCID, PMID or acc:Accession Number'
      )
  })
})
