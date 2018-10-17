import ucore from 'ucore'
import ucoreRpc from 'ucore/rpc/client'
import ucoreStore from 'ucore/store'

// import app from './features/app'
import archive from './features/archive'
import fs from './features/fs'
import workspace from './features/workspace'

const websocketUrl = window.location.origin.replace(/^http/, 'ws') + '/ucore'

const core = ucore()
core.register(ucoreRpc, { url: websocketUrl })
core.register(ucoreStore)
core.register(workspace)
core.register(archive)
core.register(fs)
core.ready((err) => {
  if (err) console.log('BOOT ERROR', err)
})

export default core
