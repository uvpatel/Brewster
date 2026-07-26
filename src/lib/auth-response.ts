type MaybeRecord = Record<string, unknown>

function isRecord(value: unknown): value is MaybeRecord {
  return typeof value === "object" && value !== null
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (!isRecord(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const directMessage = getString(error.message)
  if (directMessage) return directMessage

  const nested = error.error
  if (isRecord(nested)) {
    const nestedMessage = getString(nested.message)
    if (nestedMessage) return nestedMessage
  }

  const body = error.body
  if (isRecord(body)) {
    const bodyMessage = getString(body.message)
    if (bodyMessage) return bodyMessage
  }

  return fallback
}

export function responseErrorMessage(response: unknown, fallback: string) {
  if (!isRecord(response)) return null

  const error = response.error
  if (!error) return null

  return getAuthErrorMessage(error, fallback)
}

export function responseData(response: unknown) {
  if (!isRecord(response)) return null
  return isRecord(response.data) ? response.data : null
}

export function hasSessionToken(response: unknown) {
  const data = responseData(response)
  return Boolean(getString(data?.token))
}