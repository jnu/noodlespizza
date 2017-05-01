#! /bin/bash -eux

# Sync secrets to prod machine. Assumes you have them locally in the given
# location. Also assumes `noodles` ssh alias.

rsync -r ./secrets noodles:~/
