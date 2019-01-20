import requests
import json
import pandas
from pandas import DataFrame
from pandas.io.json import json_normalize
from datetime import datetime

import os
from ftplib import FTP

pandas.options.mode.chained_assignment = None
pandas.options.display.max_columns = 10
pandas.options.display.width = None

def progress(i_val, nrows, name):
    if nrows < 100 :
        tenp = (nrows / 100) * 10
        if i_val % tenp == 0:
            percent = (i_val / nrows) * 100
        print(datetime.now().time(), name, (i_val/nrows) * 100, "%")
    else:
        tenp = (nrows  // 100) * 10
        if i_val % tenp == 0:
            percent = (i_val / nrows) * 100
            print(datetime.now().time(), name, round(percent, 2), "%")


			
#################### Replace me values #########################

neo4j_home_dir = "C:/neo4j-enterprise/bin/"
path_to_databases = "C:/source/python_feeder/databases/"
path_to_output_csv = "C:/source/python_feeder/neo/"




if not os.path.exists(path_to_databases):
    os.makedirs(path_to_databases)

if not os.path.exists(path_to_output_csv):
    os.makedirs(path_to_output_csv)


ftp = FTP("ftp.ebi.ac.uk")
ftp.login()
ftp.cwd('pub/databases/pmc/TextMinedTerms/')
##ftp.retrlines('LIST')
filenames = ftp.nlst()
filenames.remove("PRIVACY-NOTICE.txt")

for filename in filenames:
    localfile = (path_to_databases + filename)
    file = open(localfile, "wb")
    ftp.retrbinary("RETR " + filename, file.write)

    file.close()

ftp.quit()


#################### Processing doi file beacuse it has double comas #########################
fn = "doi_PMC.csv"
with open(path_to_databases + fn, "r") as f:
    s = f.read()
    s = s.replace(",,", ",")
    s = s.replace(".,", ",")
    s = s.replace("],", ",")
    f.close()
with open(path_to_databases + fn, "w") as f:
    f.write(s)
    f.close()



for filename in os.listdir(path_to_databases):
    if filename.endswith(".csv"):
        os.rename(path_to_databases+filename, path_to_databases+filename.lower().replace("_pmc",""))


#################### Concatenating all tables to one #########################

print("time start", datetime.now().time())


big_table = pandas.DataFrame(data=None, columns=["Term", "PMCID", "PMID", "Database"])

for filename in os.listdir(path_to_databases):
    table = pandas.read_csv(path_to_databases+filename, usecols= [0,1,2], dtype = str)
    table["Database"] = table.columns[0]
    table.columns = ["Term","PMCID","PMID", "Database"]
    big_table = big_table.append(table, ignore_index=True, sort = False)



#################### Processing duplicates #########################

unique_ids = big_table.drop_duplicates(subset = "PMCID", keep="first")
unique_ids.drop(columns=["Term","Database","PMID"], inplace=True)
unique_ids["paper_index"] = unique_ids.index

unique_acs = big_table.drop_duplicates(subset = "Term", keep="first")
unique_acs.drop(columns=["PMCID","PMID","Database"], inplace=True)
unique_acs["acs_index"] = unique_acs.index


big_table["paper_index"] = big_table.index
big_table["acs_index"] = big_table.index




big_table_w_pid = big_table.merge(unique_ids, how = "inner", on = "PMCID", sort = True)
big_table_pna = big_table_w_pid.merge(unique_acs, how = "inner", on = "Term", sort = True)

nodes = big_table_pna.drop(columns = ["paper_index_x", "acs_index_x"])
nodes.columns = ["Term", "PMCID","PMID", "Database", "p_ind:ID(Paper-ID)", "acs_ind:ID(Accession-ID)"]
nodes = nodes[["Term", "Database", "PMCID", "PMID", "p_ind:ID(Paper-ID)", "acs_ind:ID(Accession-ID)"]] ### Changed order of columns


#################### Creating relationships#########################

relationships = nodes[["p_ind:ID(Paper-ID)", "acs_ind:ID(Accession-ID)"]]
relationships[":TYPE"] = "ACCESSION"
relationships.columns = [":START_ID(Paper-ID)", ":END_ID(Accession-ID)", ":TYPE"]





#################### Separating apaper nodes from accession nodes #########################


paper_nodes = nodes[["p_ind:ID(Paper-ID)", "PMCID", "PMID"]]
paper_nodes.drop_duplicates(subset = "p_ind:ID(Paper-ID)", keep = "first", inplace = True )
paper_nodes.reset_index(inplace= True, drop = True)
paper_nodes[":LABEL"] = "Paper"


acs_nodes = nodes[["acs_ind:ID(Accession-ID)", "Term", "Database"]]
acs_nodes.drop_duplicates(subset = "acs_ind:ID(Accession-ID)", keep = "first", inplace = True )
acs_nodes.reset_index(inplace= True, drop = True)
acs_nodes[":LABEL"] = "Accession"




#################### Getting a dataframe with titles #########################


total_meta_table = pandas.DataFrame(data = None, columns = ["title","pmcid"])
next_cursor = "*"
current_cursor = ""
i = 0
for i in range(0,500):
    resp = requests.get("https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=(ACCESSION_TYPE:*)&resultType=lite&cursorMark=" + next_cursor + "&pageSize=1000&format=json")
    result = json.loads(resp.content)
    current_cursor = result["request"]["cursorMark"]
    next_cursor = result["nextCursorMark"]
    if next_cursor == current_cursor :
        print("end of citations")
        break
    data = result["resultList"]["result"]
    tab = json_normalize(data)
    meta_table = tab[["title","pmcid"]]

    total_meta_table = total_meta_table.append(meta_table, ignore_index=True, sort = False)
    progress(i,500,"fetching titles")
    i += 1



total_meta_table["title"] = total_meta_table["title"].str.replace(",", "")
total_meta_table["title"] = total_meta_table["title"].str.replace(";", "")
total_meta_table["title"] = total_meta_table["title"].str.replace("\"", "")
total_meta_table["title"] = total_meta_table["title"].str.replace("\n", "")
total_meta_table["title"] = total_meta_table["title"].str.strip(",.\n\r")
total_meta_table.columns = ["Title", "PMCID"]

#total_meta_table.to_csv(path_to_output_csv + "titles.csv", index = False)

nodes_w_title = paper_nodes.merge(total_meta_table, on = "PMCID", how = "left")

empty_title_rows = len(nodes_w_title.loc[pandas.isna(nodes_w_title["Title"]), :])


#################### Replacing empty titles with pubtype #########################
if  empty_title_rows > 0:
    empty_title_indexes = nodes_w_title.loc[pandas.isna(nodes_w_title["Title"]), :].index

    i = 0
    for t in empty_title_indexes:

        id = nodes_w_title.loc[t, "PMCID"]
        resp = requests.get("https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=" + id + "&resultType=lite&cursorMark=*&pageSize=1&format=json")
        result = json.loads(resp.content)
        data = result["resultList"]["result"]

        if data ==[]:
            nodes_w_title.loc[t, "Title"] = "No title found"
        elif "title" in data[0]:
            title = data[0]["title"]
            title = title.replace(";", "")
            title = title.replace(",", "")
            title = title.replace("\n", "")
            title = title.strip(".,\n\r", )
            nodes_w_title.loc[t, "Title"] = title
        elif data[0]["pubType"] == "admin":
            nodes_w_title.loc[t, "Title"] = "No title found"
        else:
            title = data[0].get("pubType","No title found")
            title = title.replace(";", "-")
            title = title.replace(",", "")
            title = title.replace("\n","")
            title = title.strip(".,\n\r", )
            nodes_w_title.loc[t, "Title"] = title

        progress(i, len(empty_title_indexes), "adding missing titles")



final_paper_nodes = nodes_w_title[["p_ind:ID(Paper-ID)", "PMCID", "PMID", "Title", ":LABEL"]]

print("end time", datetime.now().time())


clear = final_paper_nodes

clear["Title"] = final_paper_nodes["Title"].str.replace("\n","")

clear.to_csv(path_to_output_csv + "papers.csv", index = False)
acs_nodes.to_csv(path_to_output_csv + "accessions.csv",index = False)
relationships.to_csv(path_to_output_csv + "relationships.csv",index = False)






##x = subprocess.run(["python", "C:/source/python_feeder/prnt.py"], capture_output=True, text=True)
import_query = neo4j_home_dir + 'neo4j-admin import --database="imp.db" --id-type="INTEGER" --nodes "' + path_to_output_csv + 'papers.csv" --nodes "' + path_to_output_csv + 'accessions.csv" --relationships "' + path_to_output_csv + 'relationships.csv'


#with open(path_to_output_csv + "run_import.bat", "w") as f:
#    f.write(import_query)
#    f.close()


os.system("start /wait cmd /c " + import_query)


