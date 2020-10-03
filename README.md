# Timberwolf

## Development

```bash
npm install
npm run rebuild:electron # builds native deps against electron's custom node version
npm start
```

### Testing

```bash
npm rebuild # builds native deps against node version used during tests
npm test
```

## Package & Run

Creates a build in `out` folder

```bash
npm run package
open ./out/Timberwolf-darwin-x64/Timberwolf.app
```
