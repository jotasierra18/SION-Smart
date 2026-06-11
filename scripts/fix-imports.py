import os
import re

files_to_fix = [
    './app/(dashboard)/page.tsx',
    './app/(dashboard)/layout.tsx',
    './app/(dashboard)/clientes/page.tsx',
    './app/(dashboard)/clientes/nuevo/page.tsx',
    './app/(dashboard)/solicitudes/[id]/page.tsx',
    './app/(dashboard)/solicitudes/[id]/editar/page.tsx',
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f'File not found: {filepath}')
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace import
    content = content.replace(
        "import { auth } from '@/lib/auth'",
        "import { getSession } from '@/lib/auth'"
    )
    
    # Replace auth.api.getSession call
    content = content.replace(
        'const session = await auth.api.getSession({ headers: await headers() })',
        'const session = await getSession()'
    )
    
    # Remove headers import if no longer needed
    if 'headers()' not in content and 'headers }' in content:
        content = content.replace("import { headers } from 'next/headers'\n", '')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Fixed: {filepath}')

print('Done')
