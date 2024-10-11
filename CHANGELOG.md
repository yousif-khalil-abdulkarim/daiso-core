# @daiso-tech/core

## 0.2.0

### Minor Changes

-   7cb54cb: ## ICollection and IAsyncCollection changes
    Removed the <i>throwOnIndexOverflow</i> setting from all ICollection and IAsyncCollection methods. This change was made because the setting <i>throwOnIndexOverflow</i> was unnecessary; it only applied to very large collections, where using JavaScript is not advisable.

    Changed the <i>slice</i> method signature to align with the JavaScript version.

    Changed the <i>shuffle</i> method to accept a custom Math.random function, making it easier for testing.

    Changed the <i>sum</i>, <i>average</i>, <i>median</i>, <i>min</i>, <i>max</i>, and <i>percentage</i> methods to throw an error when the collection is empty.

    Changed the <i>crossJoin</i> method signature and its usage to ensure proper type inference.

## 0.1.5

### Patch Changes

-   7206c93: Updated the docs

## 0.1.4

### Patch Changes

-   218a64c: Added link to docs in readme

## 0.1.3

### Patch Changes

-   60c686d: Added proper documentation, changed som method names, added 2 new methods

## 0.1.2

### Patch Changes

-   a10193f: Empty collection class instances can be created without passing in empty arrays

## 0.1.1

### Patch Changes

-   25b7503: Added npmignore

## 0.1.0

### Minor Changes

-   First release
