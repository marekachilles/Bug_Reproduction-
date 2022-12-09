import config from "./config";

export class Device
{
    id: string;
    ip: string;
    readonly orig_web_url: string;
    readonly orig_ws_url: string;
    readonly web_path: string;
    readonly ws_path: string;

    constructor(id:string, ip:string, ws_port:number) {
        this.id=id;
        this.ip=ip;
        this.orig_web_url = `http://${this.ip}`;
        this.orig_ws_url= `ws://${this.ip}:${ws_port}`;
        this.web_path= `${config.web_path}/${this.id}`;
        this.ws_path= `${config.ws_path}/${this.id}`;
    }

    public replace_links(content_buffer:Buffer, url: string, type: string)
    {
        if(type.startsWith("text/"))
        {
            let content = content_buffer.toString('utf8');
            let lastSegment = url.split("/").at(-1);
            let isDirectoryWithoutSlash = lastSegment !== "" && !lastSegment!.includes(".")
            let paste = isDirectoryWithoutSlash ? (lastSegment + "/") : "";

            return content
                .replaceAll(/(href|src|action)=\"\//g, "$1=\""+this.web_path+"/")
                .replaceAll(/(href|src|action)=\"([^/])/g, `$1=\"${paste}$2`);
        }
        else if(type==="application/javascript")
        {
            let port = config.production_build ? config.public_port : config.internal_port;
            let content = content_buffer 
                .toString('utf8')
                .replace('rfb.connect(location.hostname,5850,"","")', `rfb.connect(location.hostname,${port}, "", "${this.ws_path.slice(1)}")`);
            
            if(config.production_build){
               content = content.replace('WebUtil.getQueryVar("encrypt",false)', 'true')
            }

            return content;
        }
        else
        {
            return content_buffer;
        }
    }
}

export class Devices
{
    private all: Map<string, Device> = new Map();

    public add(device: Device)
    {
        if(this.all.has(device.id))
        {
            throw "Duplicate Device Name";
        }
        this.all.set(device.id, device);
    }

    public get(id: string)
    {
        return this.all.get(id);
    }

    public routing_table_web()
    {
        return Object.fromEntries(Array.from(this.all).map(([_, d])=>[d.web_path, d.orig_web_url]))
    }
    public routing_table_ws()
    {
        return Object.fromEntries(Array.from(this.all).map(([_, d])=>[d.ws_path, d.orig_ws_url]))
    }
}

export let devices: Devices=new Devices();

devices.add(new Device("23", '141.21.233.208', 5850));
devices.add(new Device("zwei", '141.33.555.222', 5850));
























































































































































































































































