import pandas as pd
import hashlib
import random

db = pd.read_csv("Test Data/baby_names.csv")


def generate_hash(row):
    temp = str(row["year"]) + row["name"] + str(row["percent"]
                                                ) + row["sex"] + str(random.randint(1, 10000))
    hash_value = hashlib.sha512(temp.encode('utf-8')).hexdigest()
    return hash_value


db["hash"] = db.apply(generate_hash, axis=1)

f = open("hashes.txt", "w")

for _, row in db.iterrows():
    f.write("   (\"" + row['name'] + "\", \"" + row['hash'] + "\"),\n")
    # print(row['name'] + " " + row['hash'])

f.close()
