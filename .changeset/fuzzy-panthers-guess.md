---
"@daiso-tech/core": minor
---

## Changes
- Added <i>get</i>, <i>getOrFail</i> and <i>set</i> methods for the <i>ICollection</i> and <i>IAsyncCollection</i> contracts
  - <i>get</i> method makes it easy to retrieve an item based on index. If item is not found null will be returned.
  - <i>getOr</i> method makes it easy to retrieve an item based on index. If item is not found an error will be thrown.
  - <i>set</i> method makes it easy to set item by index.
