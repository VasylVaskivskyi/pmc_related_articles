
function save_as_json(json_input) {
  var blob = new Blob([json_input], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'graph.json')
}

function save_as_gml_vos(full_json) {
  var n_gml = ''
  var e_gml = ''
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
      '\tid ' + n.id + '\n' +
      '\tlabel "' + title + '"' + '\n' +
      '\ttype "' + n.labels[0] + '"' + '\n' +
      props +
      '\t  x ' + Number(n.x).toFixed(3) + '\n' +
      '\t  y ' + Number(n.y).toFixed(3) + '\n' +
      other_params + 
      '  ]\n'
  })

  n_gml = 'graph\n[\n' + n_gml + '\n'

  e_keys.forEach(function(x) {
    var key = x
    var e = full_json.edges[0][key]

    e_gml +=
      '  edge\n  [\n' +
      '\tid ' + e.id + '\n' + 
      '\tsource ' + e.source.id + '\n' +
      '\ttarget ' + e.target.id + '\n' +
      '  ]\n'
    console.log(e_gml)
  })
  e_gml = e_gml + '\n]'

  var full_gml = n_gml + e_gml
  var blob = new Blob([full_gml], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'graph.gml')
}

function save_as_gml_gephi(full_json) {
  var n_gml = ''
  var e_gml = ''
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
      '\tid ' + n.id + '\n' +
      '\tlabel "' + n.labels[0] + '"' + '\n' +
      props + 
      '\tgraphics\n' +
      '\t[\n' +
      '\t  x ' + Number(n.x).toFixed(3) + '\n' +
      '\t  y ' + Number(n.y).toFixed(3) + '\n' +
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
      '\tid ' + e.id + '\n' +
      '\tsource ' + e.source.id + '\n' +
      '\ttarget ' + e.target.id + '\n' +
      '\ttype ' + '"' + e.type + '"\n' +
      '\tgraphics\n' +
      '\t[\n' +
      '\t  type "line"\n' +
      '\t  Line\n' +
      '\t  [\n' +
      '\t\tpoint\n' +
      '\t\t[\n' +
      '\t\tx ' + Number(e.source.x).toFixed(3) + '\n' +
      '\t\ty ' + Number(e.source.y).toFixed(3) + '\n' +
      '\t\t]\n' +
      '\t\tpoint\n' +
      '\t\t[\n' +
      '\t\tx ' + Number(e.target.x).toFixed(3) + '\n' +
      '\t\ty ' + Number(e.target.y).toFixed(3) + '\n' +
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

function save_as_xgmml(full_json) {
  var n_xgmml = ''
  var e_xgmml = ''
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
          '<att ' + 'name="' + p + '"' + ' value="' + n.properties[p] + '"' + '/>\n'
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
      '<node id="' + n.id + '"' + ' label="' + lab + '"' + ' weight="0">\n' + 
      props + 
      '<att ' + 'name="Node type"' + ' value="' + n.labels[0] + '"' + '/>\n' +
      '<graphics type="circle" x="' + Number(n.x).toFixed(3) + '" y="' + Number(n.y).toFixed(3) + '"' + ' fill="' + fill + '">\n' +
      '</graphics>\n' +
      '</node>\n'
  })

  e_keys.forEach(function(x) {
    var key = x
    var e = full_json.edges[0][key]
    e_xgmml +=
      '<edge ' + 'label="' + e.type + '"' +  ' source="' +  e.source.id + '"' + ' target="' + e.target.id + '"' +  ' weight="1"' + '>\n' +
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