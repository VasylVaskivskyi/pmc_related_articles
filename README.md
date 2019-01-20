# pmc_related_articles
Python dependencies
 -pandas
 -requests
 -ftplib

How script works
1. Download dump of accession numbers with associated paper indices from EuropePMC. ftp://ftp.ebi.ac.uk/pub/databases/pmc/TextMinedTerms/
2. Concatenate all csv files into one big table.
3. Remove duplicates and create indices for unique values
4. Add indices to all values (including duplicates) in big table
5. Create relationship table
6. Add titles to the table with papers
7. Import everything into Neo4j using neo4j-admin import command
