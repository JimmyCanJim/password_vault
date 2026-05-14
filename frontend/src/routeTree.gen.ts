import { Route as rootRouteImport } from './routes/__root'
import { Route as UnlockRouteImport } from './routes/unlock'
import { Route as SetupRouteImport } from './routes/setup'
import { Route as LockedRouteImport } from './routes/_locked'
import { Route as LockedIndexRouteImport } from './routes/_locked.index'
import { Route as LockedVaultRouteImport } from './routes/_locked.vault'
import { Route as LockedSettingsRouteImport } from './routes/_locked.settings'
import { Route as LockedVaultIndexRouteImport } from './routes/_locked.vault.index'
import { Route as LockedVaultNewRouteImport } from './routes/_locked.vault.new'
import { Route as LockedVaultIdRouteImport } from './routes/_locked.vault.$id'
import { Route as LockedVaultIdViewRouteImport } from './routes/_locked.vault.$id.view'

const UnlockRoute = UnlockRouteImport.update({
  id: '/unlock',
  path: '/unlock',
  getParentRoute: () => rootRouteImport,
} as any)
const SetupRoute = SetupRouteImport.update({
  id: '/setup',
  path: '/setup',
  getParentRoute: () => rootRouteImport,
} as any)
const LockedRoute = LockedRouteImport.update({
  id: '/_locked',
  getParentRoute: () => rootRouteImport,
} as any)
const LockedIndexRoute = LockedIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => LockedRoute,
} as any)
const LockedVaultRoute = LockedVaultRouteImport.update({
  id: '/vault',
  path: '/vault',
  getParentRoute: () => LockedRoute,
} as any)
const LockedSettingsRoute = LockedSettingsRouteImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => LockedRoute,
} as any)
const LockedVaultIndexRoute = LockedVaultIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => LockedVaultRoute,
} as any)
const LockedVaultNewRoute = LockedVaultNewRouteImport.update({
  id: '/new',
  path: '/new',
  getParentRoute: () => LockedVaultRoute,
} as any)
const LockedVaultIdRoute = LockedVaultIdRouteImport.update({
  id: '/$id',
  path: '/$id',
  getParentRoute: () => LockedVaultRoute,
} as any)
const LockedVaultIdViewRoute = LockedVaultIdViewRouteImport.update({
  id: '/view',
  path: '/view',
  getParentRoute: () => LockedVaultIdRoute,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof LockedIndexRoute
  '/setup': typeof SetupRoute
  '/unlock': typeof UnlockRoute
  '/settings': typeof LockedSettingsRoute
  '/vault': typeof LockedVaultRouteWithChildren
  '/vault/$id': typeof LockedVaultIdRouteWithChildren
  '/vault/new': typeof LockedVaultNewRoute
  '/vault/': typeof LockedVaultIndexRoute
  '/vault/$id/view': typeof LockedVaultIdViewRoute
}
export interface FileRoutesByTo {
  '/setup': typeof SetupRoute
  '/unlock': typeof UnlockRoute
  '/settings': typeof LockedSettingsRoute
  '/': typeof LockedIndexRoute
  '/vault/$id': typeof LockedVaultIdRouteWithChildren
  '/vault/new': typeof LockedVaultNewRoute
  '/vault': typeof LockedVaultIndexRoute
  '/vault/$id/view': typeof LockedVaultIdViewRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/_locked': typeof LockedRouteWithChildren
  '/setup': typeof SetupRoute
  '/unlock': typeof UnlockRoute
  '/_locked/settings': typeof LockedSettingsRoute
  '/_locked/vault': typeof LockedVaultRouteWithChildren
  '/_locked/': typeof LockedIndexRoute
  '/_locked/vault/$id': typeof LockedVaultIdRouteWithChildren
  '/_locked/vault/new': typeof LockedVaultNewRoute
  '/_locked/vault/': typeof LockedVaultIndexRoute
  '/_locked/vault/$id/view': typeof LockedVaultIdViewRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/setup'
    | '/unlock'
    | '/settings'
    | '/vault'
    | '/vault/$id'
    | '/vault/new'
    | '/vault/'
    | '/vault/$id/view'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/setup'
    | '/unlock'
    | '/settings'
    | '/'
    | '/vault/$id'
    | '/vault/new'
    | '/vault'
    | '/vault/$id/view'
  id:
    | '__root__'
    | '/_locked'
    | '/setup'
    | '/unlock'
    | '/_locked/settings'
    | '/_locked/vault'
    | '/_locked/'
    | '/_locked/vault/$id'
    | '/_locked/vault/new'
    | '/_locked/vault/'
    | '/_locked/vault/$id/view'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  LockedRoute: typeof LockedRouteWithChildren
  SetupRoute: typeof SetupRoute
  UnlockRoute: typeof UnlockRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/unlock': {
      id: '/unlock'
      path: '/unlock'
      fullPath: '/unlock'
      preLoaderRoute: typeof UnlockRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/setup': {
      id: '/setup'
      path: '/setup'
      fullPath: '/setup'
      preLoaderRoute: typeof SetupRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_locked': {
      id: '/_locked'
      path: ''
      fullPath: '/'
      preLoaderRoute: typeof LockedRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_locked/': {
      id: '/_locked/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof LockedIndexRouteImport
      parentRoute: typeof LockedRoute
    }
    '/_locked/vault': {
      id: '/_locked/vault'
      path: '/vault'
      fullPath: '/vault'
      preLoaderRoute: typeof LockedVaultRouteImport
      parentRoute: typeof LockedRoute
    }
    '/_locked/settings': {
      id: '/_locked/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof LockedSettingsRouteImport
      parentRoute: typeof LockedRoute
    }
    '/_locked/vault/': {
      id: '/_locked/vault/'
      path: '/'
      fullPath: '/vault/'
      preLoaderRoute: typeof LockedVaultIndexRouteImport
      parentRoute: typeof LockedVaultRoute
    }
    '/_locked/vault/new': {
      id: '/_locked/vault/new'
      path: '/new'
      fullPath: '/vault/new'
      preLoaderRoute: typeof LockedVaultNewRouteImport
      parentRoute: typeof LockedVaultRoute
    }
    '/_locked/vault/$id': {
      id: '/_locked/vault/$id'
      path: '/$id'
      fullPath: '/vault/$id'
      preLoaderRoute: typeof LockedVaultIdRouteImport
      parentRoute: typeof LockedVaultRoute
    }
    '/_locked/vault/$id/view': {
      id: '/_locked/vault/$id/view'
      path: '/view'
      fullPath: '/vault/$id/view'
      preLoaderRoute: typeof LockedVaultIdViewRouteImport
      parentRoute: typeof LockedVaultIdRoute
    }
  }
}

interface LockedVaultIdRouteChildren {
  LockedVaultIdViewRoute: typeof LockedVaultIdViewRoute
}

const LockedVaultIdRouteChildren: LockedVaultIdRouteChildren = {
  LockedVaultIdViewRoute: LockedVaultIdViewRoute,
}

const LockedVaultIdRouteWithChildren = LockedVaultIdRoute._addFileChildren(
  LockedVaultIdRouteChildren,
)

interface LockedVaultRouteChildren {
  LockedVaultIdRoute: typeof LockedVaultIdRouteWithChildren
  LockedVaultNewRoute: typeof LockedVaultNewRoute
  LockedVaultIndexRoute: typeof LockedVaultIndexRoute
}

const LockedVaultRouteChildren: LockedVaultRouteChildren = {
  LockedVaultIdRoute: LockedVaultIdRouteWithChildren,
  LockedVaultNewRoute: LockedVaultNewRoute,
  LockedVaultIndexRoute: LockedVaultIndexRoute,
}

const LockedVaultRouteWithChildren = LockedVaultRoute._addFileChildren(
  LockedVaultRouteChildren,
)

interface LockedRouteChildren {
  LockedSettingsRoute: typeof LockedSettingsRoute
  LockedVaultRoute: typeof LockedVaultRouteWithChildren
  LockedIndexRoute: typeof LockedIndexRoute
}

const LockedRouteChildren: LockedRouteChildren = {
  LockedSettingsRoute: LockedSettingsRoute,
  LockedVaultRoute: LockedVaultRouteWithChildren,
  LockedIndexRoute: LockedIndexRoute,
}

const LockedRouteWithChildren =
  LockedRoute._addFileChildren(LockedRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  LockedRoute: LockedRouteWithChildren,
  SetupRoute: SetupRoute,
  UnlockRoute: UnlockRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
