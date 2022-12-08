import config from "./hardwareproxy/config";

export default defineNuxtConfig({
    css: [
        'primevue/resources/themes/saga-blue/theme.css',       //theme
        'primevue/resources/primevue.css',                 //core css
        'primeicons/primeicons.css',                          //icons
        'primeflex/primeflex.min.css'
    ],
    build: {
    	transpile: ['primevue']
    },
    serverHandlers: [
        {route: config.web_path+"/**", handler: "~/hardwareproxy/http.ts"},
        {route: "NOREALROUTEJUSTTOSTARTEXPRESS", handler: "~/hardwareproxy/ws.ts"}
    ]
})
