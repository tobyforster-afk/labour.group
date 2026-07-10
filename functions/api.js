const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxf5Mh_199xyDIt3LWAYBufjX84L8uumPkdb7A697MuvfMwWQd7v7DFe8odeBq79UwL/exec';

export async function onRequestPost(context) {
  try {
    const requestBody = await context.request.text();

    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: requestBody
    });

    const responseText = await upstream.text();

    return new Response(responseText, {
      status: upstream.ok ? 200 : upstream.status,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error && error.message
          ? error.message
          : 'Cloudflare could not reach the Labour.Group backend.'
      },
      {
        status: 502,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}

export function onRequestGet() {
  return Response.json({
    ok: true,
    service: 'Labour.Group API proxy'
  });
}
