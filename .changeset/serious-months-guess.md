---
"@daiso-tech/core": minor
---

- Changes
  - IAsyncCollection: You can now pass in LazyPromise as default value in the following methods.
    - firstOr
    - lastOr
    - beforeOr
    - afterOr
  - Cache: You can now pass in LazyPromise as default value in the following methods.
    - getOr
    - getOrAdd