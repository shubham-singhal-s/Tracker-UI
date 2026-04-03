#!/bin/zsh
# Usage: echo "<base64-ciphertext>" | ./decrypt.sh
#    or: ./decrypt.sh <base64-ciphertext>

PRIVATE_KEY="$HOME/.ssh/id_rsa"

if [ -t 0 ] && [ $# -eq 0 ]; then
	echo "Usage: echo <base64-ciphertext> | $0 OR $0 <base64-ciphertext>" >&2
	exit 1
fi

# Read input from argument or stdin
if [ $# -gt 0 ]; then
	CIPHERTEXT="$1"
else
	CIPHERTEXT="$(cat)"
fi

echo "$CIPHERTEXT" | base64 -d | \
	openssl rsautl -decrypt -inkey "$PRIVATE_KEY"
# Ensure output ends with a newline
echo
