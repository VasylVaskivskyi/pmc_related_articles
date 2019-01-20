# pmc_related_articles
In this database you can create relationships between articles that have common accession numbers (e.g. uniprot, refseq, refsnp) and explore them using D3 js renderer.
For all of these to work you need Neo4j server. https://neo4j.com/download-center/#releases

Write in following settings in Neo4j config file (NEO4J_home_folder/conf/neo4j.conf):

dbms.active_database=imp.db
dbms.security.auth_enabled=false (if you don't want to set up a password)

Python dependencies: pandas, requests, ftplib

How Python script works
1. Download dump of accession numbers with associated paper indices from EuropePMC. ftp://ftp.ebi.ac.uk/pub/databases/pmc/TextMinedTerms/
2. Concatenate all csv files into one big table.
3. Remove duplicates and create indices for unique values
4. Add indices to all values (including duplicates) in big table
5. Create relationship table
6. Add titles to the table with papers
7. Import everything into Neo4j using "neo4j-admin import" command


Warning:
Because of current limitatins of "admin-import tool" If you want to run script again, you have to delete the database "imp.db" or specify another name for it.
