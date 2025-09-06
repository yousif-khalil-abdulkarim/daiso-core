---
"@daiso-tech/core": patch
---

Fixed: SuperJsonSerdeAdapter no longer replaces an existing ISerdeTransformerAdapter when registerCustom is called with a duplicate name.