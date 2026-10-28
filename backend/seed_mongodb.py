"""
Seed script to populate MongoDB with authentic RADIX Hackathon test data.
Usage:
  python seed_mongodb.py "mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority"
"""
import sys
import json
import os
from pathlib import Path
import pymongo

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

def seed(mongo_uri: str, db_name: str = "radix_talent_match"):
    print(f"Connecting to MongoDB: {mongo_uri.split('@')[-1] if '@' in mongo_uri else mongo_uri}...")
    client = pymongo.MongoClient(mongo_uri)
    db = client[db_name]
    client.admin.command("ping")
    print("✓ Successfully connected to MongoDB!")

    # 1. Seed JDs
    with open(DATA_DIR / "sample_jds.json", "r", encoding="utf-8") as f:
        jds = json.load(f)
    db.jds.delete_many({})
    db.jds.insert_many(jds)
    print(f"✓ Seeded {len(jds)} real Job Descriptions into collection 'jds'.")

    # 2. Seed Candidates
    with open(DATA_DIR / "sample_candidates.json", "r", encoding="utf-8") as f:
        candidates = json.load(f)
    db.candidates.delete_many({})
    db.candidates.insert_many(candidates)
    print(f"✓ Seeded {len(candidates)} real Candidate Profiles into collection 'candidates'.")

    # 3. Seed Company Benchmarks
    with open(DATA_DIR / "talent_check_company_skillsets.json", "r", encoding="utf-8") as f:
        benchmarks = json.load(f)
    db.company_benchmarks.delete_many({})
    db.company_benchmarks.insert_one(benchmarks)
    print("✓ Seeded official 12-skillset Company Benchmarks into 'company_benchmarks'.")

    # 4. Seed Milestones
    with open(DATA_DIR / "milestones.json", "r", encoding="utf-8") as f:
        milestones = json.load(f)
    db.milestones.delete_many({})
    db.milestones.insert_many(milestones)
    print(f"✓ Seeded {len(milestones)} Milestones into 'milestones'.")

    print("\n🎉 All authentic hackathon data successfully seeded into MongoDB!")

if __name__ == "__main__":
    uri = sys.argv[1] if len(sys.argv) > 1 else os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    seed(uri)
