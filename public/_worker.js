export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/bspapp')) {
      // 精确替换路径开头
      const targetPath = url.pathname.replace(/^\/bspapp/, '/http/user-center');
      const targetUrl = `https://2955b122-0e37-42a7-a4ee-4ddd503fe6b6.bspapp.com${targetPath}${url.search}`;

      // 复制并修正请求头
      const headers = new Headers(request.headers);
      headers.delete('Host'); // 或设置目标 Host

      // 构建新请求
      const modifiedRequest = new Request(targetUrl, {
        headers: headers,
        method: request.method,
        body: request.body,
        redirect: 'follow'
      });

      try {
        const response = await fetch(modifiedRequest);
        
        // 复制响应头并添加 CORS
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        
        return new Response(response.body, {
          status: response.status,
          headers: newHeaders
        });
      } catch (error) {
        // 错误处理
        return new Response('Internal Server Error', { status: 500 });
      }
    }
    const ORIGIN_URL = 'https://lol-uniapp-gitlab.pages.dev'; 
    // 非匹配路径直接转发
    return fetch(ORIGIN_URL + url.pathname + url.search, request);
  }
};