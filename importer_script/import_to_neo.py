import shutil
from datetime import datetime
import subprocess


def import_data(neo4j_home_dir, database_name, path_to_output_csv):
    import_query = neo4j_home_dir + '/bin/'+ 'neo4j-admin import --database="'+ database_name +'" --id-type="INTEGER" --nodes "' + path_to_output_csv + 'papers.csv" --nodes "' + path_to_output_csv + 'accessions.csv" --relationships "' + path_to_output_csv + 'relationships.csv'

    print(datetime.now().time(), "starting import to Neo4j")
    ##os.system("x-terminal-emulator -e /bin/bash" + import_query)


    proc = subprocess.run("cmd /c " + import_query, stderr=subprocess.PIPE)

    if proc.returncode == 0:
        print(datetime.now().time(), "import finished")
    elif proc.returncode == 1:
        stderr = proc.stderr
        err = stderr.decode().split("\r\n", 1)[0]
        while True:
            if err.startswith("Directory"):
                print(err)
                ask = input("\nChange name of new database, delete existing database, skip import?(change/delete/skip)\n")
                if ask == "change":
                    new_name = input("\nInput new name for database (e.g. test.db)\n")
                    import_query = neo4j_home_dir +  '/bin/' +  'neo4j-admin import --database="' + new_name + '" --id-type="INTEGER" --nodes "' + path_to_output_csv + 'papers.csv" --nodes "' + path_to_output_csv + 'accessions.csv" --relationships "' + path_to_output_csv + 'relationships.csv'
                    subprocess.run("cmd /c " + import_query, stderr=subprocess.PIPE)
                    break
                elif ask == "delete":
                    shutil.rmtree(neo4j_home_dir+"/data/databases/" + database_name)
                    import_query = neo4j_home_dir +  '/bin/' + 'neo4j-admin import --database="' + database_name + '" --id-type="INTEGER" --nodes "' + path_to_output_csv + 'papers.csv" --nodes "' + path_to_output_csv + 'accessions.csv" --relationships "' + path_to_output_csv + 'relationships.csv'
                    subprocess.run("cmd /c " + import_query, stderr=subprocess.PIPE)
                    break
                elif ask == "skip":
                    print("\nDatabase is not imported in Neo4j\n")
                    break
                else:
                    print("\nIncorrect input\n")
                    continue

#import_data(neo4j_home_dir, database_name, path_to_output_csv)
