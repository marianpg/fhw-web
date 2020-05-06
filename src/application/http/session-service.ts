'use strict'

import { SessionsConfig } from '../../public/config'
import { Session as ISession, SessionData, SessionMeta } from '../../public/session'

import {
    Request as ExpRequest,
    Response as ExpResponse
} from 'express'
import { isDefined, now, PaddedCounter } from '../helper'

import { v4 as uuidv4 } from 'uuid'
import { FileUtils } from '../filesystem-utils/file'
import { Logging } from '../logging'

type SessionFile = {
    id: string,
    meta: SessionMeta,
    data: Record<string, any>
}

class Session implements ISession {
    constructor(
        private file: SessionFile
    ) { }

    getId(): string {
        return this.file.id
    }
    getMeta(): SessionMeta {
        return {
            createdAt: this.file.meta.createdAt,
            lastAccess: {
                at: this.file.meta.lastAccess.at,
                url: this.file.meta.lastAccess.url
            }
        }
    }
    getData(): SessionData {
        return {
            ...JSON.parse(JSON.stringify(this.file.data)),
            id: this.file.id
        }
    }

    save(data: Record<string, any>): void {
        this.file.data = data
    }
}

export class EmptySession implements ISession {
    constructor() { }
    getId(): string {
        return ''
    }
    getMeta(): SessionMeta {
        return { createdAt: '', lastAccess: { at: '', url: '' } }
    }
    getData(): SessionData {
        return { id: '' }
    }
    save(_data: Record<string, any>): void { }
}

// TODO log a hint, if EmptySession is actively used by user
// TODO session-id should not contain local index
export class SessionService {

    private session: ISession

    constructor(
        private config: SessionsConfig,
        private logging: Logging,
        private fileUtils: FileUtils,
        private req: ExpRequest,
        private res: ExpResponse
    ) { }

    private async prepare(id?: string): Promise<[boolean, string]> {
        const sessionsFolderExists = await this.fileUtils.exist('sessions')
        if (!sessionsFolderExists) {
            await this.fileUtils.mkdir('sessions')
        }
        const files = await this.fileUtils.listFiles({ directory: 'sessions', recursively: false })
        const fileExist = files.includes(`${id}.json`)

        const minPadding = Math.max(99, files.length * 10)
        const padded = new PaddedCounter(files.length + 1, minPadding)

        return isDefined(id)
            ? [fileExist, id]
            : [fileExist, `${padded.next()}-${uuidv4()}`]
    }

    private async writeSession(): Promise<void> {
        const file = {
            id: this.session.getId(),
            meta: this.session.getMeta(),
            data: this.session.getData()
        }
        delete file.data.id
        return this.fileUtils.writeJson(file, this.session.getId(), 'sessions')
    }
    private async readSession(url: string, id: string): Promise<ISession> {
        const sessionFile = await this.fileUtils.readJson<SessionFile>(id, 'sessions')
        sessionFile.meta.lastAccess = { at: now(), url }
        this.session = new Session(sessionFile)

        return this.session
    }

    private async initSession(url: string, existingId?: string): Promise<ISession> {
        const datetime = now()
        const [_, id] = await this.prepare(existingId)
        const meta = { createdAt: datetime, lastAccess: { at: datetime, url } }
        const data = {}
        this.session = new Session({ id, meta, data })
        return this.session
    }

    private async openSession(url: string): Promise<ISession> {
        const [fileExists, id] = await this.prepare(this.req.cookies['session-id'])

        return fileExists
            ? await this.readSession(url, id)
            : await this.initSession(url, id)
    }

    async closeSession(): Promise<void> {
        if (this.config.active) {
            await this.writeSession()
            this.res.cookie('session-id', this.session.getId())
        }
    }

    async getSession(url: string): Promise<ISession> {
        if (this.config.active) {
            this.session = await this.openSession(url)
        } else {
            this.session = new EmptySession()
        }

        return this.session
    }
}