export async function loadMessagesEN() {
  const data = await import('i18n/out/en.json')
  return data.default
}

export async function loadMessagesZhCN() {
  const data = await import('i18n/out/zh-CN.json')
  return data.default
}

export async function loadMessagesZhTW() {
  const data = await import('i18n/out/zh-TW.json')
  return data.default
}

export async function loadMessagesKO() {
  const data = await import('i18n/out/ko.json')
  return data.default
}
