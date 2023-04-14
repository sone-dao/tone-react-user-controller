const chokidar = require('chokidar')
const shelljs = require('shelljs')

const watcher = chokidar.watch('.', {
    ignored: ['dist', 'types', 'package.json']
})

watcher.on('change', () => {
    console.log('👷 Rebuilding...')
    shelljs.exec('rollup -c')
    console.log('✔️ Built successfully.')
})

console.log('👀 Watching for changes...')