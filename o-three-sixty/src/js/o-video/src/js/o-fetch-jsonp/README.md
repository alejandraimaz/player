# o-fetch-jsonp

Client side fetch wrapper that fallbacks to JSONP

### Client

Uses [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), but fallbacks to a `fetch`-like interface using JSONP under the hood

#### Install

    bower install -S o-fetch-jsonp

#### Usage

    import fetchJsonp from 'o-fetch-jsonp';
    const opts = {
        timeout: 1000
    };
    fetchJsonp('http://other.domain.com/foo', opts)
        .then(data => {
            ...
        });

Note: If using CommonJS modules,

    const fetchJsonp = require('o-fetch-jsonp').default;

Where `opts` can take

 * `{number} [timeout=2000]`
