const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxf5Mh_199xyDIt3LWAYBufjX84L8uumPkdb7A697MuvfMwWQd7v7DFe8odeBq79UwL/exec';

export async function onRequestPost(context) {
  try {
    const body = await context.request.text();

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Apps Script returned HTML instead of JSON.',
        upstreamStatus: response.status,
        upstreamUrl: response.url,
        upstreamContentType: contentType,
        preview: text.slice(0, 500)
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'Cache-Control': 'no-store'
        }
      });
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: String(error && error.message ? error.message : error)
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }
}

export async function onRequestGet() {
  return new Response(JSON.stringify({
    ok: true,
    service: 'Labour.Group API proxy'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
