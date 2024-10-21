export enum Page {
  Main = 'main',
}

export enum SendChannel {
  MaximizeWindow = 'maximize-window',
  Unmaximize = 'unmaximize',
  CloseWindow = 'close-window',
  RestoreWindow = 'restore-window',
  MinimizeWindow = 'minimize-window',
  SwitchDevTools = 'switch-dev-tools',
  Broadcast = 'broadcast',
}

export enum InvokeChannel {
  GetStore = 'get-store',
  SetStore = 'set-store',
  GetWindowMaximized = 'get-window-maximized',
  SetI18n = 'set-i18n',
}

export enum SyncChannel {
  GetI18n = 'get-i18n',
}

export enum BroadcastType {
  SetI18n = 'setI18n',
}
