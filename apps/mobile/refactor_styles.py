import os
import re

base_path = 'src/modules/warehouse/presentation'
folders = ['Warehouse', 'Inventory', 'Movement']

for folder in folders:
    file_path = os.path.join(base_path, folder, f'{folder}Screen.tsx')
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    with open(file_path, 'r') as f:
        content = f.read()
        
    match = re.search(r'const styles = StyleSheet\.create\({', content)
    if not match:
        print(f"No styles found in: {file_path}")
        continue
        
    start_index = match.start()
    
    component_code = content[:start_index].rstrip()
    style_code = content[start_index:]
    
    # modify style code to be exported
    style_code = style_code.replace('const styles = StyleSheet.create({', 'export const styles = StyleSheet.create({', 1)
    
    # add imports
    imports = "import { StyleSheet } from 'react-native';\nimport { Colors, Spacing, Typography } from '../../../../../shared/theme/constants';\n\n"
    style_code = imports + style_code
    
    # add import to component code
    import_match = list(re.finditer(r'^import .*;?$', component_code, re.MULTILINE))
    if import_match:
        last_import = import_match[-1]
        insert_pos = last_import.end()
        component_code = component_code[:insert_pos] + f"\nimport {{ styles }} from './styles/{folder}ScreenStyles';" + component_code[insert_pos:]
    else:
        component_code = f"import {{ styles }} from './styles/{folder}ScreenStyles';\n" + component_code
        
    # write style file
    styles_dir = os.path.join(base_path, folder, 'styles')
    os.makedirs(styles_dir, exist_ok=True)
    style_file_path = os.path.join(styles_dir, f'{folder}ScreenStyles.ts')
    
    with open(style_file_path, 'w') as f:
        f.write(style_code)
        
    # write component file
    with open(file_path, 'w') as f:
        f.write(component_code + "\n")
        
    print(f"Refactored styles for {folder}")

