import os
from datetime import datetime
import download
import process
import import_to_neo

print(datetime.now().time(), "starting")
start = datetime.now()
#neo4j_home_dir = "C:/neo4j-enterprise/"
#database_name = "imp.db"
#path_to_databases = "C:/source/python_feeder/databases/db/"
#path_to_output_csv = "C:/source/python_feeder/neo/db"

with open("PATHS.txt","r") as f:

    for line in f.readlines():
        if line.startswith("neo4j"):
            neo4j_home_dir = str(line.split("=")[1]).rstrip("\r\n")

        elif line.startswith("name"):
            database_name = str(line.split("=")[1]).rstrip("\r\n")

        elif line.startswith("where"):
            path_to_databases = str(line.split("=")[1]).rstrip("\r\n")

        elif line.startswith("path"):
            path_to_output_csv = str(line.split("=")[1]).rstrip("\r\n")

        elif line.startswith("#"):
            None
        f.close()



ask = input("Have you already specified paths to working directories in PATHS.txt?(y/n)\n")
while True:
    if ask == "y":
        print("\nOk\n")
        break
    elif ask =="n":
       print("\nPlease open PATHS.txt and specify there paths to working directories.\n")
       exit()
    else:
        print("\nIncorrect input\n")
        continue

if not os.path.exists(path_to_databases):
    os.makedirs(path_to_databases)
if not os.path.exists(path_to_output_csv):
    os.makedirs(path_to_output_csv)

download.download_data(path_to_databases)
process.processing(path_to_databases, path_to_output_csv)
import_to_neo.import_data(neo4j_home_dir, database_name, path_to_output_csv)


finish = datetime.now()
elapsed = finish - start
print(datetime.now().time(), "finished")
print("time elapsed", elapsed)