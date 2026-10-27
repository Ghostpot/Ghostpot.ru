import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Ghostpot — эфиры, Люси и книга" },
      {
        name: "description",
        content:
          "Ghostpot: игровые эфиры Николая Чичкань. Люси, 25 лет, путешествует по мирам. Книга, песни и записи.",
      },
      { name: "theme-color", content: "#100e0c" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preload", as: "image", href: "/brand/slides/hall.webp", fetchPriority: "high" },
      { rel: "preload", as: "font", href: "/fonts/f4.woff2", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preload", as: "font", href: "/fonts/f2.woff2", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://ghostpot.ru", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault()});if(navigator.serviceWorker){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})})}",
          }}
        />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=113811582', 'ym');
    ym(113811582, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true, trackHash:true});`,
          }}
        />
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/113811582" style={{ position: "absolute", left: "-9999px" }} alt="" />
          </div>
        </noscript>
        <Scripts />
      </body>
    </html>
  ),
});
