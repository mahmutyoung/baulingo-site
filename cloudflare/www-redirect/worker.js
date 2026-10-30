// This Worker is routed only to www.baulingo.app; the apex stays a static site.
export default {
  fetch(request) {
    const url = new URL(request.url);
    if (url.hostname !== 'www.baulingo.app') {
      return new Response('Not found', { status: 404 });
    }
    url.protocol = 'https:';
    url.hostname = 'baulingo.app';
    url.port = '';
    return Response.redirect(url.href, 301);
  },
};
