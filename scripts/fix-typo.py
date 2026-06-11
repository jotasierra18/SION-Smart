with open('app/actions/data.ts', 'rb') as f:
    content = f.read()

# Find and replace the problematic byte sequence
# The hex for 'č' is c4 8d, but it might be corrupted
old = b'  \xc4\x8digoInterno: string'
new = b'  codigoInterno: string'

if old in content:
    content = content.replace(old, new)
    print('Fixed corrupted character')
else:
    # Try to find any variant
    idx = content.find(b'igoInterno')
    if idx >= 0:
        print(f'Found at index {idx}')
        print('Bytes around:', content[idx-5:idx+25])
        print('Hex:', content[idx-5:idx+25].hex())
    else:
        print('Not found')

with open('app/actions/data.ts', 'wb') as f:
    f.write(content)
print('Done')
