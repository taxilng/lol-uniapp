export default {
  async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/bspapp/')) {
          // 替换路径并保留原始查询参数
          const targetPath = url.pathname.replace('/bspapp/', '/http/user-center/');
          const targetUrl = `https://2955b122-0e37-42a7-a4ee-4ddd503fe6b6.bspapp.com${targetPath}${url.search}`;

          const modifiedRequest = new Request(targetUrl, {
              headers: request.headers,
              method: request.method,
              body: request.body,
              redirect: 'follow'
          });

          const response = await fetch(modifiedRequest);
          return new Response(response.body, {
              status: 200,
              headers: response.headers
          });
      }
      // 如果不是匹配的路径，返回原始响应
      return fetch(request);
  }
};    