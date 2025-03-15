---
"@daiso-tech/core": minor
---

Removed <i>onError</i>, <i>onSuccess</i>, and <i>onFinally</i> from <i>LazyPromise</i>. Added <i>addListener</i> and <i>removeListener</i> instead, making it easier to track and handle all states of a <i>LazyPromise</i> which is useful for observability.
