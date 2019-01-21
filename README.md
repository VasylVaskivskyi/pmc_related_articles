# pmc_related_articles

In this database you can explore relationships between articles that have common accession numbers (e.g. uniprot, refseq, refsnp).

![alt text](https://raw.githubusercontent.com/VasylVaskivskyi/pmc_related_articles/master/d3js/screenshot.JPG)

For all of these to work you need Neo4j (server)[https://neo4j.com/download-center/#releases].\

Python dependencies: 	
```
pandas, requests
```
**How Python script works**
1. Download dump of accession numbers with associated paper indices from (EuropePMC)[ftp://ftp.ebi.ac.uk/pub/databases/pmc/TextMinedTerms/].
2. Concatenate all csv files into one big table.
3. Remove duplicates and create indices for unique values
4. Add indices to all values (including duplicates) in big table
5. Create relationship table
6. Add titles to the table with papers
7. Import everything into Neo4j using **neo4j-admin import** command

**How to run everything:**
1. Specify paths in process_and_import.py, and run script. It takes up to 30 minutes to finish everything.
2. Write in following settings in Neo4j config file (NEO4J_home_folder/conf/neo4j.conf):
```
dbms.active_database=imp.db
dbms.security.auth_enabled=false (if you don't want to set up a password)
```
3. Open source code of query.html and specify your login, password, and path to server;


**Warning:**\
Because of current limitatins of **admin-import tool** If you want to run script again, you have to delete the database "imp.db" or specify another name for it.

**List of papers available in (database)**[https://europepmc.org/search?query=ACCESSION_TYPE%3A*]

**Ready output database of process_and_import.py is available (here)**[https://drive.google.com/open?id=1zYwG32NxZfxDbqPLu4upCQOUNb8H2qGW]
Just put it in NEO4J_home_folder/data/databases.

Visualization script is modified version of tool made by  (@micwan88)[https://github.com/micwan88/d3js-neo4j-example]. 
