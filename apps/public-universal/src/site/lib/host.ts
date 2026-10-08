// This value is forwarded to the API only. The API's domain registry remains tenant authority.
export function validIncomingHost(host: string): boolean {
  return host.length > 0 && host.length <= 253 && !/[\s/@?#\\]/.test(host) && !host.includes(",");
}
