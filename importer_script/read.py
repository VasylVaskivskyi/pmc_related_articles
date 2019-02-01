with open("PATHS.txt","r") as f:

    for line in f.readlines():
        if line.startswith("neo4j"):
            neo4j_home_dir = line.split("=")[1]

        elif line.startswith("name"):
            database_name = line.split("=")[1]

        elif line.startswith("where"):
            path_to_databases = line.split("=")[1]

        elif line.startswith("path"):
            path_to_output_csv = line.split("=")[1]

        elif line.startswith("#"):
            None
        f.close()

print(neo4j_home_dir,database_name, path_to_databases, path_to_output_csv)