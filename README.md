# depdocs

generate documentation from depject modules

**work in progress**

```shell
npm install --save depdocs
```

## example

```
const { join, dirname } = require('path')
const depdocs = require('depdocs')

depdocs([
  join(dirname(require.resolve('patchcore')), './!(index).js'),
  join(dirname(require.resolve('patchcore')), './!(node_modules|example)/**/*.js')
], function (err, content) {
  if (err) console.error(err)
  else console.log(content)
})
```

## usage

### `depdocs = require('depdocs')`

### `depdocs([globs], (err, content) => {})`

## license

The Apache License

Copyright &copy; 2017 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
