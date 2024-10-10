---
"@daiso-tech/core": minor
---
Removed the <i>throwOnIndexOverflow</i> setting from all ICollection and IAsyncCollection methods. This change was made because the setting <i>throwOnIndexOverflow</i> was unnecessary; it only applied to very large collections, where using JavaScript is not advisable.

Changed the <i>slice</i> method signature to align with the JavaScript version.

Changed the <i>shuffle</i> method to accept a custom Math.random function, making it easier for testing.

Changed the <i>sum</i>, <i>average</i>, <i>median</i>, <i>min</i>, <i>max</i>, and <i>percentage</i> methods to throw an error when the collection is empty.

Changed the <i>crossJoin</i> method signature and its usage to ensure proper type inference.