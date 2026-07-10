/* Labour.Group external frontend API client.
 * Set window.LG_API_URL before loading this file, or replace the placeholder.
 */
const LG_API = (() => {
  const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxf5Mh_199xyDIt3LWAYBufjX84L8uumPkdb7A697MuvfMwWQd7v7DFe8odeBq79UwL/exec';

  function getBaseUrl() {
    const configured = String(
      window.LG_API_URL ||
      localStorage.getItem('labourGroupApiUrl') ||
      DEFAULT_API_URL ||
      ''
    ).trim();

    if (!configured || configured.includes('PASTE_YOUR_')) {
      throw new Error('Labour.Group API URL has not been configured.');
    }

    return configured;
  }

  async function request(action, args) {
    const response = await fetch(getBaseUrl(), {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: String(action || ''),
        args: Array.isArray(args) ? args : []
      })
    });

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {
      throw new Error('The Labour.Group API returned an invalid response.');
    }

    if (!response.ok || !result || result.ok !== true) {
      const message = result && result.error
        ? result.error
        : 'Labour.Group API request failed.';
      throw new Error(message);
    }

    return result.data;
  }

  function createRunner() {
    let successHandler = function() {};
    let failureHandler = function(error) { console.error(error); };

    const runner = {
      withSuccessHandler(handler) {
        successHandler = typeof handler === 'function' ? handler : successHandler;
        return proxy;
      },

      withFailureHandler(handler) {
        failureHandler = typeof handler === 'function' ? handler : failureHandler;
        return proxy;
      }
    };

    const proxy = new Proxy(runner, {
      get(target, property) {
        if (property in target) {
          const value = target[property];
          return typeof value === 'function' ? value.bind(target) : value;
        }

        return function(...args) {
          request(String(property), args)
            .then(successHandler)
            .catch(failureHandler);
        };
      }
    });

    return proxy;
  }

  return {
    request,
    setUrl(url) {
      localStorage.setItem('labourGroupApiUrl', String(url || '').trim());
    },
    get run() {
      return createRunner();
    }
  };
})();
