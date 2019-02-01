import os
from ftplib import FTP
from datetime import datetime



def download_data(path_to_databases):
    print(datetime.now().time(), "getting data tables")
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

    #################### Replacing database name #########################
    try:
        fn = "rsID_PMC.csv"
        with open(path_to_databases + fn, "r") as f:
            s = f.read()
            s = s.replace("rsID", "refsnp")
            f.close()
        with open(path_to_databases + fn, "w") as f:
            f.write(s)
            f.close()
    except FileNotFoundError:
        None

    try:
        for filename in os.listdir(path_to_databases):
            if filename.endswith(".csv"):
                os.rename(path_to_databases + filename, path_to_databases + filename.lower().replace("_pmc", ""))
    except FileExistsError:
        print("\nFiles with accession numbers are already exist in " + path_to_databases)
        ask = input("\nUse existing files or delete them?(use/delete)\n")
        while True:
            if ask == "use":
                for filename in os.listdir(path_to_databases):
                    if filename.endswith(".csv") and "_PMC" in filename :
                        os.remove(path_to_databases + filename)
                break
            elif ask == "delete":
                for filename in os.listdir(path_to_databases):
                    if filename.endswith(".csv") and "_PMC" not in filename :
                        os.remove(path_to_databases + filename)
                for filename in os.listdir(path_to_databases):
                    if filename.endswith(".csv"):
                        os.rename(path_to_databases + filename, path_to_databases + filename.lower().replace("_pmc", ""))
                break
            else:
                print("Incorrect input")
                continue
