import os

filepath = "/Users/admin/DevelopmentRCM/KPLIAN/BACKEND/ms-bucket/src/main/java/com/kplian/bucket/domain/service/FileService.java"

with open(filepath, 'r') as f:
    content = f.read()

old_str = 'fileRepository.find("id in ?1 and deletedAt is null", ids)'
new_str = 'fileRepository.find("id in (?1) and deletedAt is null", ids)'

if old_str in content:
    content = content.replace(old_str, new_str)
    with open(filepath, 'w') as f:
        f.write(content)
    print("Patched FileService.java successfully.")
else:
    print("String not found in FileService.java.")
