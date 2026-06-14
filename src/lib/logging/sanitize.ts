const REDACTION_KEYS = new Set([
  'password', 'token', 'secret', 'key', 'auth', 'cookie', 'session', 'credential',
  'apikey', 'privatekey', 'accesstoken', 'refreshtoken', 'authorization', 'x-api-key',
  'bearer', 'jwt', 'passwd', 'pwd', 'access_token', 'refresh_token', 'id_token',
  'api_key', 'set-cookie', 'sessionid', 'csrf', 'client_secret', 'private_key'
]);

export function sanitizeForLog(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack ? '[STACK TRACE REDACTED]' : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeForLog);
  }

  if (typeof value === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (REDACTION_KEYS.has(normalizedKey) || REDACTION_KEYS.has(key.toLowerCase())) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitizeForLog(val);
      }
    }
    return sanitizedObj;
  }

  return value;
}
