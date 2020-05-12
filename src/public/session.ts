'use strict'

export type SessionData = Record<string, any>

export type SessionMeta = {
    createdAt: string,
    lastAccess: {
        at: string,
        url: string
    }
}

export interface Session {
    getId(): string
    getMeta(): SessionMeta
    getData(): SessionData
    save(data: Record<string, any>): void
}