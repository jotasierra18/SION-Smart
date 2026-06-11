with open('app/actions/data.ts', 'rb') as f:
    content = f.read()

# Find all occurrences of 'igoInterno'
idx = 0
while True:
    idx = content.find(b'igoInterno', idx)
    if idx == -1:
        break
    
    # Show 20 bytes before and after
    start = max(0, idx - 20)
    end = min(len(content), idx + 30)
    segment = content[start:end]
    
    print(f'Found at byte {idx}:')
    print(f'  Hex: {segment.hex()}')
    print(f'  Text: {segment.decode("utf-8", errors="replace")}')
    print()
    
    idx += 1

# Also check for any non-ASCII characters in the file
non_ascii = []
for i, b in enumerate(content):
    if b > 127:
        non_ascii.append((i, b))

if non_ascii:
    print(f'Found {len(non_ascii)} non-ASCII bytes:')
    for pos, byte in non_ascii[:20]:
        print(f'  Byte {pos}: 0x{byte:02x}')
else:
    print('No non-ASCII bytes found')
