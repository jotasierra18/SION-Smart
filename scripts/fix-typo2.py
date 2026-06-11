with open('app/actions/data.ts', 'rb') as f:
    content = f.read()

# The corrupted character is č (U+010D) which in UTF-8 is C4 8D
# But it might be encoded differently due to corruption
# Let's find the exact bytes
idx = content.find(b'igoInterno')
if idx >= 0:
    # Check 5 bytes before
    before = content[idx-5:idx]
    print(f'Bytes before: {before.hex()} = {before}')
    
    # The issue is that 'c' is replaced with 'č' (c4 8d in UTF-8)
    # Let's search for the pattern with č
    old_pattern = b'\xc4\x8digoInterno'
    if old_pattern in content:
        content = content.replace(old_pattern, b'codigoInterno')
        print('Fixed č in codigoInterno')
    else:
        print('Pattern with č not found')
        # Try with just the corrupted line
        old_line = b'  \xc4\x8digoInterno: string'
        new_line = b' <think>igoInterno: string'
        if old_line in content:
            content = content.replace(old_line, new_line)
            print('Fixed corrupted line')
        else:
            print('Corrupted line not found')
            # Show all lines with igoInterno
            import re
            matches = list(re.finditer(b'.{10}igoInterno.{10}', content))
            for m in matches:
                print(f'Found: {m.group()} at {m.start()}')
else:
    print('igoInterno not found')

with open('app/actions/data.ts', 'wb') as f:
    f.write(content)
print('Done')
