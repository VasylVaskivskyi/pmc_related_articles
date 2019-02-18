function submitQuery(nodeID) {
  removeAlert()
  var queryStr = null

  var queryNode = ''

  if (nodeID != null){
      queryStr = 'MATCH (n)-[j]-(k) WHERE id(n) = ' + nodeID + ' RETURN n,j,k'
  }
  else if (nodeID == null || !nodeID) {
      queryStr = $.trim($('#queryText').val())

      if (queryStr == '') {
        promptAlert($('#graphContainer'),
          'Error: query text cannot be empty!',true)
        return
      }


      if (queryStr.substr(0,3).toLowerCase() == 'con'){
          queryStr = isItConnected(queryStr)
      }
      else if(queryStr.substr(0,3).toLowerCase() == 'rel'){
          queryStr = searchRelationship(queryStr)
      }
      else if ($('#chkboxCypherQry:checked').val() != 1){
          queryStr = searchGraph(queryStr)
          nodeItemMap = {}
          linkItemMap = {}          
      }
      else if ($('#chkboxCypherQry:checked').val() == 1){
        queryStr = queryStr
        nodeItemMap = {}
        linkItemMap = {}
      }
    }

    console.log(queryStr)

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

function isItConnected(query) {

  var fromNode = ''
  var toNode = ''

  var qdata = query.match(/([\w:\w]+)/gi)
  qdata.splice(0,1)

  if (query == '') {
    promptAlert(
      $('#graphContainer'),
      'Error: query text cannot be empty!',
      true
    )
    return
  }else if (qdata.length > 2){
    promptAlert(
      $('#graphContainer'),
      'Error: you cannot use more than TWO values!',
      true
    )
    return
  }else  if ( qdata[0] != null && (qdata[0] == currentID || qdata[0] == currentAccessionID) ) {
    promptAlert(
      $('#graphContainer'),
      'Error: you cannot use same values!',
      true
    )
    return
  }else  if ( qdata[1] != null && (qdata[0] == qdata[1])) {
    promptAlert(
      $('#graphContainer'),
      'Error: you cannot use same values!',
      true
    )
    return
  }


  if (qdata.length == 1) {
        if (currentAccessionID != null && currentID == null) {
          fromNode = modifyAsNode('p1', currentAccessionID)
          toNode = modifyAsNode('p2', qdata[0])
        } else if (currentID != null) {
          fromNode = modifyAsNode('p1', currentID)
          toNode = modifyAsNode('p2', qdata[0])

          query =
            'MATCH ' +
            fromNode +
            ',' +
            toNode +
            ', path=shortestpath((p1)-[*..15]-(p2)) RETURN path'
        }
  } else if (qdata.length == 2){
    nodeItemMap = {}
    linkItemMap = {}
    var val1 = qdata[0].trim()
    var val2 = qdata[1].trim()
    fromNode = modifyAsNode('p1', val1)
    toNode = modifyAsNode('p2', val2)
    query =
      'MATCH ' +
      fromNode +
      ',' +
      toNode +
      ', path=shortestpath((p1)-[*..15]-(p2)) RETURN path'
  }
  return query
}

function searchGraph(query){
      var queryNode = modifyAsNode('p', query)

      if (query.substr(0, 4).toLowerCase() == 'acc:') {
        query =
          'OPTIONAL MATCH zz=(:Paper)-[:ACCESSION]->' + queryNode + ' RETURN zz'
      } else {
        query = 'OPTIONAL MATCH zz=' + queryNode + '-[:ACCESSION]->(acc:Accession)' +
          ' OPTIONAL MATCH pp=' + queryNode + '-[:ACCESSION]->(acc:Accession)<-[:ACCESSION]-(:Paper) RETURN pp, zz'
      }
 
      return query
}

function searchRelationship(query){
   var qdata = query.match(/([\w:\w]+)/gi)
   qdata.splice(0,1)
   var acc = "'" + qdata[0].substr(4) + "'"
   var dbs = qdata.slice(2,qdata.length)
   var dblist = "['"+dbs.join("','") + "']"
   query = "WITH " + dblist + " AS dbs " +
              "MATCH pp=(:Accession{Term:"+ acc +"})<-[:ACCESSION]-(:Paper)-[:ACCESSION]->(a:Accession) "+
              "WHERE a.Database in dbs " +
              "RETURN pp"
   return query
}

function modifyAsNode(neovar, val) {
  var label = ''
  var property = ''
  if (val.substr(0, 3) == 'PMC') {
    label = 'Paper'
    property = 'PMCID'
  } else if (val.substr(0, 4).toLowerCase() == 'acc:') {
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