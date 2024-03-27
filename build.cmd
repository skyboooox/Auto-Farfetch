
npx esbuild ./main.mjs --bundle --platform=node --outfile=main.cjs --target=node18
node --experimental-sea-config sea-config.json
node -e "require('fs').copyFileSync(process.execPath, 'server.exe')" 
npx postject server.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --overwrite