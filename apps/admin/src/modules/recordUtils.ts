export type UnknownRecord = Record<string, unknown>;
export function asRecord(value: unknown): UnknownRecord { return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {}; }
export function asRecords(value: unknown): UnknownRecord[] { return Array.isArray(value) ? value.filter((item): item is UnknownRecord => Boolean(item && typeof item === "object" && !Array.isArray(item))) : []; }
export function listItems(value: unknown): UnknownRecord[] { return asRecords(asRecord(value).items); }
export function stringValue(record: UnknownRecord, key: string, fallback = "—"): string { const value=record[key]; return value === undefined || value === null || value === "" ? fallback : String(value); }
export function numberValue(record: UnknownRecord, key: string, fallback = 0): number { const value=record[key]; return typeof value === "number" ? value : Number(value ?? fallback) || fallback; }
export function arrayValue(record: UnknownRecord, key: string): unknown[] { return Array.isArray(record[key]) ? record[key] as unknown[] : []; }
export function booleanValue(record: UnknownRecord,key:string): boolean { return Boolean(record[key]); }
export function formatDate(value: unknown): string { if(typeof value!=="string"||!value)return "—"; const date=new Date(value); return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(date); }
export function uuidish(value: string): boolean { return /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value); }
