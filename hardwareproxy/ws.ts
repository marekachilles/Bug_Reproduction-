import express from "express";
import { createProxyMiddleware }  from 'http-proxy-middleware';
import {devices } from "./device";
import config from "./config";
import { ClientRequest, IncomingMessage } from "http";

import { loggerPlugin, errorResponsePlugin, proxyEventsPlugin} from 'http-proxy-middleware';

function restore_header_names(req: IncomingMessage, proxyReq: ClientRequest) 
{
    let raw_header_keymap = new Map<string, string>();
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
        let key = req.rawHeaders[i];
        raw_header_keymap.set(key.toLowerCase(), key);
    }
    proxyReq.getHeaderNames().forEach(h=>proxyReq.setHeader(raw_header_keymap.get(h) ?? h, proxyReq.getHeader(h)!));
}

const ws = createProxyMiddleware({
    changeOrigin: true,
    router: devices.routing_table_ws(),
    secure: false,
    ignorePath: true,
    ws: true,
    on:{
        proxyReqWs: async (proxyReq, req, socket) =>
        {
            restore_header_names(req, proxyReq);
            proxyReq.socket!.pause();
            proxyReq.socket!.resume();
        },
    },
    ejectPlugins: true,
    plugins: [loggerPlugin, errorResponsePlugin, proxyEventsPlugin],
});

const app = express();
app.use(config.ws_path, ws);
app.listen(config.internal_port, () => {
    console.log(`[server]: Server is running at https://localhost:${config.internal_port}`);
});

export default defineEventHandler(async (event) => {})