import os

def replace_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Could not read {file_path}: {e}")
        return

    # Store original content to check if changes were made
    original_content = content

    # Perform replacements
    replacements = {
        "East Hararghe's": "Ethiopia's",
        "Harar & East Hararghe": "Ethiopia",
        "Harar, East Hararghe": "Ethiopia",
        "East Hararghe": "Ethiopia",
        "West Hararghe": "Other Regions",
        "Hararghe": "Ethiopia"
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    # Only write back if there are changes
    if content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_path}")
        except Exception as e:
            print(f"Could not write {file_path}: {e}")

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Directories to ignore
    ignore_dirs = {'.git', 'node_modules', 'venv', '.gemini', '__pycache__', 'dist', 'build'}
    
    # Allowed extensions
    allowed_exts = {'.js', '.jsx', '.py', '.md', '.json', '.html', '.txt'}

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Remove ignored directories from traversal
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]

        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            if ext in allowed_exts:
                file_path = os.path.join(dirpath, filename)
                
                # Skip this script itself
                if os.path.basename(file_path) == "update_national.py":
                    continue
                    
                replace_in_file(file_path)

if __name__ == "__main__":
    main()
