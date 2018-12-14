/////////////////////////////////////////////////////////////////////////////////
//////////////////ADDITIONAL INFO START
//////////////////////////////////////////////////////////////////////////////
//available annotaions for accession number from the following databases:
//"pdb", "arrayexpress", "bioproject", "hpa", "omim", 
//"gen", "uniprot", "nct",  "refsnp",  "refseq",  "gca", "go",  "interpro", "pfam",
// "pxd", "ensembl", "igsr", "reactome", "ega", "biosample", "emma", 
//"metabolights", "biomodels", "hgnc"


//unavailable annotaions for accession number from the following databases:
//"rrid", "eva", "doi","chembl", "eudract",

//sample query
//WITH "30139767" AS pid
//OPTIONAL MATCH zz = (p:Paper{id:pid})<-[a_r:ACCESSION]-(acs:Accession)
//OPTIONAL MATCH pp = (p:Paper{id:pid})<-[a_r:ACCESSION]-(acs:Accession)<-[r_r:RELATED_TO]-(r_p:Related_paper)
//RETURN *


/////////////////////TO GET JSON OUTPUT
//:POST /db/data/transaction/commit
//  {"statements":[{"statement":"MATCH pp = (p:Paper{id:'30427217'})<-[a_r:ACCESSION]-(acs:Accession)<-[r_r:RELATED_TO]-(r_p:Related_paper) RETURN pp",
//                  "resultDataContents":["graph"]}]}



/////////////////////////////////////////////////////////////////////////////////
//////////////////ADDITIONAL INFO END
//////////////////////////////////////////////////////////////////////////////



/////WARNING BEFORE RUNNING IN NEO4J BROWSER ACTIVATE OPTION "Enable multi statement query editor"


///////////////////////////////////////////
////////////////GETTING PAPER INFO START
/////////////////////////////////////////// 100 papers 2min, 500 p 11 min


CALL apoc.load.json("https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=(ACCESSION_TYPE%3A*)&resultType=lite&cursorMark=*&pageSize=500&format=json")
YIELD value AS all_papers
UNWIND all_papers.resultList.result AS results_all_papers
MERGE (paper:Paper{title:COALESCE(results_all_papers.title,"NOT SET"), source:COALESCE(results_all_papers.source,"NOT SET"), id:COALESCE(results_all_papers.id,"NOT SET") } )

WITH paper





//GET NAMES FROM DATABASES
CALL apoc.load.json("https://www.ebi.ac.uk/europepmc/webservices/rest/"+ paper.source + "/" + paper.id + "/textMinedTerms?semantic_type=ACCESSION&page=1&pageSize=1000&format=json")
YIELD value AS data

UNWIND data.semanticTypeList.semanticType AS results
UNWIND results.tmSummary AS extr
MERGE (acs:Accession {term:extr.term, db:extr.dbName})
MERGE (paper)<-[a_r:ACCESSION]-(acs)    

WITH acs, paper

CALL apoc.load.json("https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=" + acs.term + "&resultType=lite&cursorMark=*&pageSize=1000&format=json")
YIELD value AS rel_pap

UNWIND rel_pap.resultList.result AS results
MERGE (acs)<-[r_b:RELATED_TO]-(rel_p:Related_paper {title:COALESCE(results.title,"NOT SET"), source:COALESCE(results.source,"NOT SET"), id:COALESCE(results.id,"NOT SET")} )


MATCH pp = (p:Paper)<-[a_r:ACCESSION]-(acs:Accession)<-[r_r:RELATED_TO]-(r_p:Related_paper)
WHERE p.id = rel_p.id
DETACH DELETE rel_p


RETURN "main finished";



///////////////////////////////////////////
////////////////GETTING PAPER INFO MAIN END
///////////////////////////////////////////



///////////////////////////////////////////////////////////
///////////GETTING ANNOTATIONS FOR ACCESSION NUMBERS START
/////////////////////////////////////////////////////////

////////////////////////////////PDB +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="pdb"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("http://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/"+ acs.term, "$." + tolower(acs.term),{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS pdb
SET acs.title = pdb.value.title;



///////////////////////////////UNIPROT +



WITH NULL AS a_uniprot
OPTIONAL MATCH(acs:Accession)
WHERE acs.db="uniprot"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.xml("https://www.uniprot.org/uniprot/"+ toupper(acs.term) +".xml", null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS uni
WITH  acs, uni.value._children AS val
WITH acs,
	[n in val[0]._children WHERE n._type = "name"| n._text][0] AS name, 
	 [n in val[0]._children WHERE n._type = "protein"] AS prot_data,
	 [n in val[0]._children WHERE n._type = "organism" | n._children[0]._text][0] AS organism
UNWIND prot_data AS prot_data2
WITH  acs, 
	organism, 
	name, 
	[n in prot_data2._children[0]._children WHERE n._type = "fullName"| n._text][0] AS uniprot
SET acs.title = uniprot, 
	acs.name=name, 
	acs.org_scientific_name = organism;





///////////////////////////////GO  +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="go"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("https://www.ebi.ac.uk/QuickGO/services/ontology/go/search?query=" + acs.term + "&limit=1&page=1","$.results", {failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS go_data
WITH acs, go_data.value.name AS go
SET acs.title = go;




/////////////////////////////////NCT  +     ////////// in need for eudract

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="nct"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.xml("https://clinicaltrials.gov/ct2/show/" + acs.term + "?displayxml=true", null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS nct_data
WITH acs, [n in nct_data.value._children WHERE n._type="official_title" | n._text][0] AS nct
SET acs.title = nct;





////////////////////////////////////arrayexpress +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="arrayexpress"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.xml("https://www.ebi.ac.uk/arrayexpress/xml/v3/experiments/" + acs.term, null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS arrexp_data
WITH acs, 
	[ n in arrexp_data.value._children[0]._children WHERE n._type = "name" | n._text][0] AS arrexp_title,
	[ n in arrexp_data.value._children[0]._children WHERE n._type = "experimenttype" | n._text][0] AS arrexp_exptype
SET acs.title = arrexp_title, acs.experiment_type = arrexp_exptype;




/////////////////////////////////////// ENA bioproject +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="bioproject"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.xml("https://www.ebi.ac.uk/ena/data/view/" + acs.term + "&display=xml", null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS bioproject_data
WITH acs, [ n in bioproject_data.value._children[0]._children WHERE n._type="TITLE" | n._text][0] AS bioproject
SET acs.title = bioproject;





///////////////////////////////////////biosample +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="biosample"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("https://www.ebi.ac.uk/biosamples/samples/" + acs.term + ".json", null,{failOnError:false}) 
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS biosample_data
WITH acs, 
	biosample_data.value.characteristics.`description title`[0].text AS desc_1,
	biosample_data.value.characteristics.Title[0].text AS desc_2,
	biosample_data.value.characteristics.`environment feature`[0].text AS features,
	biosample_data.value.name AS biosample
SET acs.title = biosample, acs.description1 = desc_1, acs.description2 = desc_2, acs.features = features;





/////////////////////////////////////// EGA +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="ega"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("https://ega-archive.org/metadata/v2/studies/" + acs.term ,"$.response.result[*]", {failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS ega
WITH acs, ega.value.title AS ega_title, 
	ega.value.studyType AS study_type
SET acs.title=ega_title, acs.type=study_type;




///////////////////////////////////////  EMDB +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="emdb"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.xml("http://www.ebi.ac.uk/pdbe/entry/download/" + acs.term + "/xml", null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS emdb_data
WITH acs, [ n in emdb_data.value._children WHERE n._type="deposition" | n._children][0] AS data
WITH acs, [p in data WHERE p._type ="title"| p._text][0] AS emdb
SET acs.title = emdb;




///////////////////////////////////////ENSEMBL +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="ensembl"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("https://rest.ensembl.org/lookup/id/" + acs.term + "?content-type=application/json", null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS ensembl_data
WITH acs, ensembl_data.value.description AS ensembl_description, 
	ensembl_data.value.display_name AS ensembl_title
SET acs.title = ensembl_title, acs.description = ensembl_description;





///////////////////////////////////////european nucleotide archive gen +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="gen"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.xml("https://www.ebi.ac.uk/ena/data/view/" + acs.term + "&display=xml", null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS gen
UNWIND gen.value._children AS gen_data
WITH acs, [n in gen_data._children WHERE n._type = "description"| n._text] AS gen
SET acs.title = gen;




//////////////////////////////////// interpro +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="interpro"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("https://www.ebi.ac.uk/interpro/beta/api/entry/interpro/" + acs.term +"?format=json", null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS inter_data
WITH acs, inter_data.value.metadata.name.name AS interpro
SET acs.title = interpro;




////////////////////////////////////pfam +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="pfam"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.xml("https://pfam.xfam.org/family/" + acs.term + "?output=xml",null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS pfam
UNWIND pfam.value._children AS pfam_data
WITH acs, [n in pfam_data._children WHERE n._type = "description"| n._text][0] AS pfam
SET acs.title = pfam;




/////////////////////////////////proteome +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="pxd"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.xml("http://central.proteomexchange.org/cgi/GetDataset?ID=" + acs.term + "&outputMode=XML", null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS pxd
WITH acs,[ n in pxd.value._children WHERE n._type = "DatasetSummary" | n.title][0] AS pxd
SET acs.title = pxd;




///////////////////////////////refseq +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="refseq"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nuccore&id=" + acs.term + "&api_key=6acba501f4cdd5195973383af14793378c08&retmode=json", "$.result.*.title",{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS refseq_data
WITH acs, refseq_data.value.result[0] AS refseq
SET acs.title=refseq;




/////////////////////////////refsnp  +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="refsnp"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	WITH acs, replace(acs.term,"rs","") AS term
	CALL apoc.load.json("https://api.ncbi.nlm.nih.gov/variation/v0/beta/refsnp/" + term, null,{failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS refsnp
WITH acs, refsnp, refsnp.value.primary_snapshot_data.variant_type AS var_type
UNWIND refsnp.value.primary_snapshot_data.placements_with_allele AS data
WITH acs, var_type, collect(data)[0] AS var_data
WITH acs, var_type,  [n in var_data.alleles | n.hgvs] AS vars
SET acs.type=var_type, acs.variations = vars;







//////////////////////////// omim +

OPTIONAL MATCH(acs:Accession)
WHERE acs.db="omim"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=omim&id=" + acs.term + "&api_key=6acba501f4cdd5195973383af14793378c08&retmode=json", "$.result.*.title", {failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS omim_data
WITH acs, omim_data.value.result[0] AS omim
SET acs.title = omim;

/////////////////////////////////////////hgnc + 


OPTIONAL MATCH(acs:Accession)
WHERE acs.db="hgnc"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.xml("https://rest.genenames.org/search/hgnc_id/" + replace(acs.term, "HGNC:", "",) + ", null, {failOnError:false})
	YIELD value
	RETURN value',
	"",{acs:acs})
YIELD value AS hgnc_data
WITH [ n in hgnc_data._children WHERE n._type = "result" | [ r in n._children[0]._children WHERE r.name="symbol"| r._text] ] AS hgnc 
SET acs.symbol = hgnc;

//////////////////////////////////////// biomodels + 
OPTIONAL MATCH(acs:Accession)
WHERE acs.db="biomodels"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
CALL apoc.load.json("https://www.ebi.ac.uk/biomodels/" + acs.term + "?format=json", "$", {failOnError:false})
	YIELD value 
    WITH acs, value.name AS val
	RETURN val',
	"",{acs:acs})
YIELD value AS biomodels_data
WITH acs, biomodels_data.val AS biomodels
SET acs.title = biomodels;


/////////////////////////////////// metabolights +
OPTIONAL MATCH(acs:Accession)
WHERE acs.db="metabolights"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("http://www.ebi.ac.uk/ebisearch/ws/rest/metabolights/entry/" + acs.term +"?fields=name&format=json")
	YIELD value
	WITH acs, value.entries[0].fields.name[0] AS val
	RETURN val',
	"",{acs:acs})
YIELD value AS metabolights_data
WITH acs, metabolights_data.val AS metabolights
SET acs.title = metabolights;

/////////////////////////////////// emma +
OPTIONAL MATCH(acs:Accession)
WHERE acs.db="emma"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("http://www.mousemine.org/mousemine/service/search?q=" + acs.term)
	YIELD value
	WITH acs, value.results[0].fields AS val
	RETURN val',
	"",{acs:acs})
YIELD value AS emma_data
WITH acs, 
	emma_data.val.name AS mutation_strain, 
	emma_data.val.primaryIdentifier AS MGI_ID,
	emma_data.val.attributeString AS description
SET acs.mutation_strain = mutation_strain, 
	acs.MGI_ID = MGI_ID,
	acs.description = description;

/////////////////////////////////// reactome +
OPTIONAL MATCH(acs:Accession)
WHERE acs.db="reactome"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.json("https://reactome.org/ContentService/data/query/" + acs.term ,null,{failOnError:false})
	YIELD value
	WITH value.displayName AS val
	RETURN val',
	"",{acs:acs})
YIELD value AS reactome_data
WITH acs, reactome_data.val AS reactome
SET acs.title =  reactome;

//////////////////////////////// igsr +
OPTIONAL MATCH(acs:Accession)
WHERE acs.db="igsr"
CALL apoc.do.when(acs IS NOT NULL, 
	'WITH {acs} AS acs 
	CALL apoc.load.html("https://www.coriell.org/0/Sections/Search/Sample_Detail.aspx?Ref=" + acs.term + "&Product=CC", {title:"span.pull-right"},{failOnError:false})
	YIELD value
	WITH value.title[0].text AS val
	RETURN val',
	"",{acs:acs})
YIELD value AS igsr_data
WITH acs, igsr_data.val AS igsr
SET acs.title = igsr;

////////////////////////////////hpa human protein atlas +
OPTIONAL MATCH(acs:Accession)
WHERE acs.db="hpa"
CALL apoc.do.when(acs IS NOT NULL, 
'CALL apoc.load.xml("https://www.ebi.ac.uk/proteins/api/proteins/hpa:" + acs.term + "?offset=0&size=1")
YIELD value
WITH acs, [n in value._children[0]._children WHERE n._type = "name" | n._text][0] AS uniprot_id,
[p in value._children[0]._children WHERE p._type = "protein" | p._children[0]._children[0]._text][0] AS title
RETURN uniprot_id, title',
"",{acs:acs})
YIELD value
SET acs += value;


//////////////////////////////// gca + 
OPTIONAL MATCH(acs:Accession)
WHERE acs.db="gca"
CALL apoc.do.when(acs IS NOT NULL,
	'CALL apoc.load.json("http://www.ebi.ac.uk/ebisearch/ws/rest/genome_assembly/entry/" + acs.term + "?fields=description&format=json")
	YIELD value
	RETURN value.entries[0].fields.description[0] AS title',
	"",{acs:acs})
YIELD value
SET acs += value;


////////////////////////////////////////////////////////////
//////////////GETTING ANNOTATIONS FOR ACCESSION NUMBERS END
//////////////////////////////////////////////////////////
