with open('app/actions/data.ts', 'rb') as f:
    content = f.read()

# Remove think tags and their content
# The pattern is: <think>...</think>
import re

# Find and remove think tags
content_str = content.decode('utf-8', errors='replace')

# Remove think opening tag
content_str = content_str.replace('<think>', '')
content_str = content_str.replace('</think>', '')

# Also handle any corrupted variants
content_str = content_str.replace('studiereigoInterno', 'codigoInterno')

with open('app/actions/data.ts', 'w', encoding='utf-8') as f:
    f.write(content_str)

print('Cleaned think tags')

# Verify
with open('app/actions/data.ts', 'r', encoding='utf-8') as f:
    verify = f.read()
if 'think' in verify.lower() and '<think>' in verify:
    print('WARNING: think tags still present')
else:
    print('Think tags removed successfully')
