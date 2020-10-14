DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

${DIR}/../node_modules/.bin/apollo client:codegen  --target=typescript --includes "${DIR}/../src/ui/**"
