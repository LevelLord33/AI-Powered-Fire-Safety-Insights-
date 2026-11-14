import os
import shutil
import datetime

project_root = r"c:\Users\Admin\Desktop\flame-in-freefall"
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
backup_dir = fr"C:\Users\Admin\Desktop\flame-in-freefall_backup_{timestamp}"

print(f"Creating backup at: {backup_dir}")

ignore_patterns = shutil.ignore_patterns(
    "node_modules",
    ".venv",
    "venv",
    "__pycache__",
    "dist",
    "build",
    ".git",
    ".env",
    "*.env*",
    "secrets.toml",
    "*.pyc"
)

# Walk and copy selected directories and files
os.makedirs(backup_dir, exist_ok=False)

items_to_copy = [
    "backend",
    "src",
    "tests",
    "data",
    "scratch",
    "presentation"
]

for item in items_to_copy:
    src_path = os.path.join(project_root, item)
    dst_path = os.path.join(backup_dir, item)
    if os.path.exists(src_path):
        print(f"Copying {item}...")
        shutil.copytree(src_path, dst_path, ignore=ignore_patterns)

# Frontend specific copy (ensuring node_modules and dist are excluded)
frontend_src = os.path.join(project_root, "frontend")
frontend_dst = os.path.join(backup_dir, "frontend")
print("Copying frontend...")
shutil.copytree(frontend_src, frontend_dst, ignore=ignore_patterns)

# Copy root files (documentation, audit reports, configs)
for root_file in os.listdir(project_root):
    src_file = os.path.join(project_root, root_file)
    dst_file = os.path.join(backup_dir, root_file)
    if os.path.isfile(src_file):
        # Exclude secrets
        if any(sec in root_file.lower() for sec in [".env", "secret", "token", "password"]):
            print(f"Excluding secret file from backup: {root_file}")
            continue
        shutil.copy2(src_file, dst_file)

print(f"Backup created successfully at: {backup_dir}")

# Verify contents
required_paths = [
    os.path.join("data", "processed", "bass_ii_experiments.csv"),
    os.path.join("data", "processed", "flex_experiments.csv"),
    os.path.join("data", "processed", "flex_experimental_results.csv"),
    "backend",
    os.path.join("frontend", "src"),
    "src",
    "tests",
    "PHASE_12_2_FINAL_SOURCE_CHECK_REPORT.md",
    "PHASE_12_1_SCIENTIFIC_CONSISTENCY_REPORT.md",
    "CSV_PROVENANCE_AUDIT.md",
    "data_inventory.md"
]

all_verified = True
print("\n--- Verifying Required Backup Files ---")
for rel_p in required_paths:
    chk_p = os.path.join(backup_dir, rel_p)
    exists = os.path.exists(chk_p)
    status = "OK" if exists else "MISSING"
    print(f"[{status}] {rel_p}")
    if not exists:
        all_verified = False

# Ensure secrets are NOT in backup
secrets_found = []
for root, dirs, files in os.walk(backup_dir):
    for f in files:
        if any(sec in f.lower() for sec in [".env", "secrets.toml"]):
            secrets_found.append(os.path.join(root, f))

if secrets_found:
    print(f"WARNING: Found secrets in backup: {secrets_found}")
else:
    print("[OK] Verified zero secret files (.env, secrets.toml) in backup.")

print(f"\nFinal Backup Verification: {'PASSED' if all_verified and not secrets_found else 'FAILED'}")
