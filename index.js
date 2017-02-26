const { keys, assign } = Object
const { readFile } = require('fs')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const globStream = require('glob-stream')
const requireFromString = require('require-from-string')
const { each } = require('libnested')
const dedent = require('dedent')

module.exports = depdocs

function depdocs (globs, cb) {
  return pull(
    getFiles(globs),
    loadFiles(),
    runModules(),
    modulesToGraph((err, graph) => {
      if (err) return cb(err)
      const docs = graphToDocs(graph)
      cb(null, docs)
    })
  )
}

function getFiles (globs) {
  return pullGlob(globs)
}

function loadFiles () {
  return pull.asyncMap((file, cb) => {
    readFile(file.path, 'utf8', (err, content) => {
      if (err) cb(err)
      else cb(null, assign(file, { content }))
    })
  })
}

function runModules () {
  return pull.map(file => {
    return assign(
      { file },
      requireFromString(file.content, file.path)
    )
  })
}

function modulesToGraph (cb) {
  return pull.reduce((sofar, module) => {
    if (typeof module.gives === 'string') {
      module = assign({}, module, { gives: { [module.gives]: true } })
    }
    each(module.gives, (gives, path) => {
      const name = path.join('/')
      if (sofar[name] === undefined) sofar[name] = []
      sofar[name].push({
        name,
        path: module.file.path,
        gives: nestedToFlatModules(module.gives),
        needs: nestedToFlatModules(module.needs)
      })
    })
    return sofar
  }, {}, cb)
}

function nestedToFlatModules (nested) {
  var result = {}
  each(nested, (module, path) => {
    const name = path.join('/')
    result[name] = module
  })
  return result
}

function graphToDocs (graph) {
  var docs = '# api'
  each(graph, (modules, path) => {
    docs += '\n\n' + docsEntry(modules, path)
  })
  return docs
}

function docsEntry (modules, path) {
  const name = path.join('/')
  if (modules.length === 1) {
    const module = modules[0]
    return dedent(`
      ## ${name}

      **needs**:

      ${keys(module.needs).map(needName => {
        const need = module.needs[needName]
        return `- ${linkifyModuleName(needName)} : ${need}`
      }).join('\n')}

      **gives**:

      ${keys(module.gives).map(giveName => {
        return `- ${linkifyModuleName(giveName)}`
      }).join('\n')}
    `)
  }

  return dedent(`
    ## ${name}

    ${modules.map(module => {
      return dedent(`
        ### ${module.name}

        **needs**:

        ${keys(module.needs).map(needName => {
          const need = module.needs[needName]
          return `- ${linkifyModuleName(needName)} : ${need}`
        }).join('\n')}

        **gives**:

        ${keys(module.gives).map(giveName => {
          return `- ${linkifyModuleName(giveName)}`
        }).join('\n')}
      `)
    }).join('\n\n')}
  `)
}

function linkifyModuleName (name) {
  return `[${name}](#${name})`
}

function pullGlob (globs, options) {
  return toPull.source(globStream(globs, options))
}
