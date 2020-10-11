# Timberwolf

## Development

```bash
cd electron-app
yarn install
yarn run rebuild:electron # builds native deps against electron's custom node version
yarn start
```

### Testing

```bash
cd electron-app
yarn install --force # builds native deps against node version used during tests
yarn test
```

## Package & Run

Creates a build in `out` folder.

```bash
yarn run package

# Open directly
./out/Timberwolf-darwin-x64/Timberwolf.app
```

### stdin

```bash
cat ./log.txt | ./out/Timberwolf-darwin-x64/Timberwolf.app/Contents/MacOS/Timberwolf
```

### websocket

```bash
# open the app
./out/Timberwolf-darwin-x64/Timberwolf.app

# open a websocket client to send logs
wscat -c ws://localhost:8080
```
