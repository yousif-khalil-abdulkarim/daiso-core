---
"@daiso-tech/core": minor
---

## Changes
- Moved cache group logic from the <i>Cache</i> class into the adapters classes.  
  - **Key Impact**: Each adapter is now required to implement the <i>getGroup</i> and <i>withGroup</i> methods.  
  - This change enhances flexibility for adapter-specific logic.