Timberwolf javascript client for node & browser.

Currently just intercepts logs from console.

```ts
import {attach} from '@timberw0lf/client'

attach({port: 8080, name: 'Logs from my app'})

console.log('this log will be sent to Timberwolf')
```
