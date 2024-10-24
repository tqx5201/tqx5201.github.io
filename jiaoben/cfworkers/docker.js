


'use strict'
const hub_host = 'registry-1.docker.io'
const auth_url = 'https://auth.docker.io'
const workers_url = 'https://docker.stncp.dns-dynamic.net'
const PREFLIGHT_INIT = {
    status: 204,
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
}
function makeRes(body, status = 200, headers = {}) {
    headers['access-control-allow-origin'] = '*'
    return new Response(body, {status, headers})
}
function newUrl(urlStr) {
    try {
        return new URL(urlStr)
    } catch (err) {
        return null
    }
}
addEventListener('fetch', e => {
    const ret = fetchHandler(e)
        .catch(err => makeRes('cfworker error:\n' + err.stack, 502))
    e.respondWith(ret)
})
async function fetchHandler(e) {
  const getReqHeader = (key) => e.request.headers.get(key);
  let url = new URL(e.request.url);
  if(url.pathname === '/' || url.pathname === 'undefind'){
	let html1='将原语句:docker pull pixman/pixman:latest\r\n<br>改写成为:docker pull docker.stncp.dns-dynamic.net/pixman/pixman:latest';
	let html = make_html2();

    return new Response(html, {
		status: 200,
		headers: {
		"content-type": "text/html"
		}
	});
  }
  if (url.pathname === '/token') {
      let token_parameter = {
        headers: {
        'Host': 'auth.docker.io',
        'User-Agent': getReqHeader("User-Agent"),
        'Accept': getReqHeader("Accept"),
        'Accept-Language': getReqHeader("Accept-Language"),
        'Accept-Encoding': getReqHeader("Accept-Encoding"),
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
        }
      };
      let token_url = auth_url + url.pathname + url.search
      return fetch(new Request(token_url, e.request), token_parameter)
  }
  url.hostname = hub_host;
  let parameter = {
    headers: {
      'Host': hub_host,
      'User-Agent': getReqHeader("User-Agent"),
      'Accept': getReqHeader("Accept"),
      'Accept-Language': getReqHeader("Accept-Language"),
      'Accept-Encoding': getReqHeader("Accept-Encoding"),
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0'
    },
    cacheTtl: 3600
  };
  if (e.request.headers.has("Authorization")) {
    parameter.headers.Authorization = getReqHeader("Authorization");
  }
  let original_response = await fetch(new Request(url, e.request), parameter)
  let original_response_clone = original_response.clone();
  let original_text = original_response_clone.body;
  let response_headers = original_response.headers;
  let new_response_headers = new Headers(response_headers);
  let status = original_response.status;
  if (new_response_headers.get("Www-Authenticate")) {
    let auth = new_response_headers.get("Www-Authenticate");
    let re = new RegExp(auth_url, 'g');
    new_response_headers.set("Www-Authenticate", response_headers.get("Www-Authenticate").replace(re, workers_url));
  }
  if (new_response_headers.get("Location")) {
    return httpHandler(e.request, new_response_headers.get("Location"))
  }
  let response = new Response(original_text, {
            status,
            headers: new_response_headers
        })
  return response;
}
function httpHandler(req, pathname) {
    const reqHdrRaw = req.headers
    // preflight
    if (req.method === 'OPTIONS' &&
        reqHdrRaw.has('access-control-request-headers')
    ) {
        return new Response(null, PREFLIGHT_INIT)
    }
    let rawLen = ''
    const reqHdrNew = new Headers(reqHdrRaw)
    const refer = reqHdrNew.get('referer')
    let urlStr = pathname
    const urlObj = newUrl(urlStr)
    /** @type {RequestInit} */
    const reqInit = {
        method: req.method,
        headers: reqHdrNew,
        redirect: 'follow',
        body: req.body
    }
    return proxy(urlObj, reqInit, rawLen)
}
async function proxy(urlObj, reqInit, rawLen) {
    const res = await fetch(urlObj.href, reqInit)
    const resHdrOld = res.headers
    const resHdrNew = new Headers(resHdrOld)
    // verify
    if (rawLen) {
        const newLen = resHdrOld.get('content-length') || ''
        const badLen = (rawLen !== newLen)
        if (badLen) {
            return makeRes(res.body, 400, {
                '--error': `bad len: ${newLen}, except: ${rawLen}`,
                'access-control-expose-headers': '--error',
            })
        }
    }
    const status = res.status
    resHdrNew.set('access-control-expose-headers', '*')
    resHdrNew.set('access-control-allow-origin', '*')
    resHdrNew.set('Cache-Control', 'max-age=1500')
    resHdrNew.delete('content-security-policy')
    resHdrNew.delete('content-security-policy-report-only')
    resHdrNew.delete('clear-site-data')
    return new Response(res.body, {
        status,
        headers: resHdrNew
    })
}


function make_html(){
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>镜像使用说明</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f0f2f5;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .header {
          background: linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%);
          color: white;
          text-align: center;
          padding: 20px 0;
        }
        .container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
          max-width: 800px; /* 调整后的宽度 */
          width: 100%;
          font-size: 16px; /* 放大字体 */
        }
        .code-block {
          background: #2d2d2d;
          color: #f8f8f2;
          padding: 10px;
          border-radius: 8px;
          margin: 10px 0;
          overflow-x: auto;
          font-family: "Courier New", Courier, monospace; /* 保持代码块的字体 */
        }
        .footer {
          background: #444;
          color: white;
          text-align: center;
          padding: 5px 0; /* 调低高度 */
        }
        .footer a {
          color: #4caf50;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .content {
            padding: 10px;
            font-size: 14px; /* 在小屏幕上稍微减小字体 */
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>镜像使用说明</h1>
      </div>
      <div class="container">
        <div class="content">
          <p>要设置加速镜像服务，你可以执行下面命令：</p>
          <div class="code-block">
            <pre>
    sudo tee /etc/docker/daemon.json &lt;&lt;EOF
    {
        "registry-mirrors": ["https://docker.stncp.dns-dynamic.net"]
    }
    EOF
            </pre>
          </div>
          <p>如果执行了上述命令，配置了镜像加速服务，可以直接 pull 镜像：</p>
          <div class="code-block">
            <pre>
    docker pull halohub/halo:latest # 拉取 halo 镜像
            </pre>
          </div>
          <p>因为Workers用量有限，在使用加速镜像服务时，你可以手动 pull 镜像然后 re-tag 之后 push 至本地镜像仓库:</p>
          <div class="code-block">
            <pre>
    docker pull docker.stncp.dns-dynamic.net/halohub/halo:latest # 拉取 halo 镜像
            </pre>
          </div>
        </div>
      </div>
      <div class="footer">
        <p>Powered by Cloudflare Workers</p>
        <p><a href="https://docker.stncp.dns-dynamic.net">stncp.dns-dynamic.net</a></p>
      </div>
    </body>
    </html>`;
}

function make_html2(){
    return `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dockerhub镜像加速说明</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
                background-image: url('https://cdn.jsdelivr.net/gh/fireinrain/picx-images-hosting@master/20240608/wp8114669-docker-wallpapers.5h6dvj56isg0.webp'); /* Replace with your image path */
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                background-attachment: fixed;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h1 {
                font-size: 2em;
                margin-bottom: 0.5em;
                color: #007aff;
            }
            p {
                margin-bottom: 1em;
            }
            pre {
                background: #2d2d2d;
                color: #f8f8f2;
                padding: 20px;
                border-radius: 8px;
                overflow-x: auto;
                position: relative;
            }
            pre::before {
                content: " ";
                display: block;
                position: absolute;
                top: 10px;
                left: 10px;
                width: 12px;
                height: 12px;
                background: #ff5f56;
                border-radius: 50%;
                box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
            }
            code {
                font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
                font-size: 0.875em;
            }
            .copy-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #007aff;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s;
            }
            pre:hover .copy-button {
                opacity: 1;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <center><h1>镜像加速说明</h1></center>
            <h3>镜像地址（NAS里直接添加，通常就正常使用了）</h3>
            <pre><code>
    https://docker.stncp.dns-dynamic.net</code><button class="copy-button" onclick="copyCode(this)">复制代码</button></pre>
            <h3>用法①：客户端 手动设置【注册表镜像】，然后【正常命令】拉取加速镜像</h3>
            <pre><code>
    sudo tee /etc/docker/daemon.json &lt;&lt;EOF
    {
        "registry-mirrors": ["https://docker.stncp.dns-dynamic.net"]
    }
    EOF</code><button class="copy-button" onclick="copyCode(this)">复制代码</button></pre>
    <pre><code>
    sudo systemctl daemon-reload #重载 systemd 管理守护进程配置文件</code><button class="copy-button" onclick="copyCode(this)">复制代码</button></pre>
            <pre><code>
    sudo systemctl restart docker #重启 Docker 服务</code><button class="copy-button" onclick="copyCode(this)">复制代码</button></pre>
            <h3>用法②：临时的拉取方法（不用修改或添加镜像源）</h3>
            <h4>原拉取镜像命令</h4>
            <pre><code>
    docker pull pixman/pixman:latest</code><button class="copy-button" onclick="copyCode(this)">复制代码</button></pre>
            <h4>加速拉取镜像命令</h4>
            <pre><code>
    docker pull docker.stncp.dns-dynamic.net/pixman/pixman:latest</code><button class="copy-button" onclick="copyCode(this)">复制代码</button></pre>
        </div>
        <script>
            function copyCode(button) {
                const code = button.previousSibling;
                const textArea = document.createElement('textarea');
                textArea.value = code.textContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                button.textContent = '已复制';
                setTimeout(() => {
                    button.textContent = '复制代码';
                }, 2000);
            }
        </script>
    </body>
    </html>`;
}
