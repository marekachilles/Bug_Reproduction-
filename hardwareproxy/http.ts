import { createProxyMiddleware, responseInterceptor }  from 'http-proxy-middleware';
import {devices } from "./device";
import config from "./config";
//import { loggerPlugin, errorResponsePlugin, proxyEventsPlugin} from 'http-proxy-middleware';

let http = createProxyMiddleware({
    pathFilter: config.web_path,
    changeOrigin: true,
    selfHandleResponse: true,
    router: devices.routing_table_web(),
    on:{
        proxyReq: (proxyReq, req, res) => {
            proxyReq.path = proxyReq.path.replace(new RegExp(`^${config.web_path}\/[^/]+\/?`), "/");
            proxyReq.socket!.pause();
            proxyReq.socket!.resume();
            
           
        },
        proxyRes: responseInterceptor(async (responseBuffer, _, req, res) => {      
            const type = (res.getHeader("content-type") ?? "").toString();
            const dev = devices.get(req.url?.replace(new RegExp(`${config.web_path}\/([^/]+)(\/.*)?`), "$1")!);
            return dev ? dev.replace_links(responseBuffer, req.url!, type) : responseBuffer;
        })
    },
    
});

export default defineEventHandler(async (event) => {
    await new Promise((resolve, reject) => {
        console.log("EVENTHANDLER", event.node.req.url);
        http(event.node.req, event.node.res, (err?: unknown) => {
            if (err){
                reject(err)
            }
            else {
                resolve(true)
            }
        })
      })
})