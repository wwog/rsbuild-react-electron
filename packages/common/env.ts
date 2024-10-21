export function isDev() {
  return process.env.NODE_ENV === 'development'
}

export function isProd() {
  return process.env.NODE_ENV === 'production'
}

export function isMac() {
  return process.platform === 'darwin'
}

export function isWin() {
  return process.platform === 'win32'
}

export function isLinux() {
  return process.platform === 'linux'
}

export function getOs() {
  if (isMac()) {
    return 'mac'
  }
  if (isWin()) {
    return 'win'
  }
  if (isLinux()) {
    return 'linux'
  }
  return 'win'
}

export function getCPUArch(): string {
  return process.arch
}


export function getPort() {
  return Number(process.env.PORT) || 8163
}