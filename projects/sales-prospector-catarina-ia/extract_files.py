import os
import shutil
import urllib.parse

source_dir = '/tmp/file_attachments/tree/primary%3ADownload%2FSALES-PROSPECT-IA-main/document'
dest_root = '/app'

os.makedirs(dest_root, exist_ok=True)

files = os.listdir(source_dir)

for filename in files:
    # Decode the filename to get the path
    decoded_path = urllib.parse.unquote(filename)

    # Remove the common prefix if present
    prefix = "primary:Download/SALES-PROSPECT-IA-main/"
    if decoded_path.startswith(prefix):
        relative_path = decoded_path[len(prefix):]
    else:
        relative_path = decoded_path

    # Determine which project it belongs to
    if relative_path.startswith("SALES-PROSPECT-IA-main/"):
        final_path = os.path.join(dest_root, "sales-prospect", relative_path[len("SALES-PROSPECT-IA-main/"):])
    elif relative_path.startswith("Ia-Catarina-birth-voices-hub-init-12876488533232509420/"):
         final_path = os.path.join(dest_root, "catarina-hub", relative_path[len("Ia-Catarina-birth-voices-hub-init-12876488533232509420/"):])
    else:
        print(f"Unknown project for: {relative_path}")
        continue

    # Create directories
    os.makedirs(os.path.dirname(final_path), exist_ok=True)

    # Copy file
    shutil.copy2(os.path.join(source_dir, filename), final_path)
    print(f"Extracted: {final_path}")

print("Extraction complete.")
