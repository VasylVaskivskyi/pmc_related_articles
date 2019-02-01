# Realted articles search tool for EuropePMC 
This tool allows you to explore relationships between articles that have common accession numbers (e.g. uniprot, refseq, refsnp), and then export graph in JSON, GML and GXMML or save as SVG.

![alt text](https://raw.githubusercontent.com/VasylVaskivskyi/pmc_related_articles/master/d3js/viewport.JPG)

For all of these to work you need Neo4j server.\
https://neo4j.com/download-center/#releases

Python dependencies: 	
```
pandas, requests
```
**How Python script works**
1. Download dump of accession numbers with associated paper indices from EuropePMC.\
  ftp://ftp.ebi.ac.uk/pub/databases/pmc/TextMinedTerms/
2. Concatenate all csv files into one big table.
3. Remove duplicates and create indices for unique values
4. Add indices to all values (including duplicates) in big table
5. Create relationship table
6. Add titles to the table with papers
7. Import everything into Neo4j using **neo4j-admin import** command

**How to run everything:**
1. Specify paths in PATHS.txt and run main.py script. It takes up to 30 minutes to finish everything.
2. Write in following settings in Neo4j config file (NEO4J_home_folder/conf/neo4j.conf):
```
dbms.active_database=imp.db (put name of your database  here)
dbms.security.auth_enabled=false (if you don't want to set up a password)
```
3. Open code of index.js and specify your login, password, and path to server; or leave them as they are (neo4j, 1234 localhost:7474)
4. Run index.html


**Warning:**\
Because of current limitatins of **admin-import tool** If you want to run script again, you have to delete the database "imp.db" or specify another name for it.

**[Papers available in database.](https://europepmc.org/search?query=%28FIRST_PDATE:%5B1900-01-01+TO+2018-11-30%5D%29+AND+ACCESSION_TYPE:*&page=1)**

**[Ready database for Neo4j is available here.](https://drive.google.com/open?id=1xiqYwQsHvS9fJkrnh-xthyPQi2RrVQFI)**

Just put it in NEO4J_home_folder/data/databases.

Sample IDs to put in query: PMC6299211, 30510815, PMC6218573, 30425980, 30425978 

Visualization script is modified version of tool made by  [@micwan88](https://github.com/micwan88/d3js-neo4j-example). 
