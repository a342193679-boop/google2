import { useEffect } from 'react'
import { initPlugins } from '@app/plugins/registry'
import { setupBuiltinPlugins } from '@app/plugins/index'
import { createCapabilitiesProxy } from '@app/plugins/capabilities'

type StoreCtx = React.MutableRefObject<any>

export function useInitPlugins(storeRef: StoreCtx) {
  useEffect(() => {
    setupBuiltinPlugins()
    initPlugins({ getStore: () => storeRef.current, getCapabilities: () => createCapabilitiesProxy(() => storeRef.current) })
  }, [storeRef])
}

