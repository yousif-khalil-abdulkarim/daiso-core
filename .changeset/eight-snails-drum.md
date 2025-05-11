---
"@daiso-tech/core": patch
---

Fixed a serialization issue in the Lock class where using multiple adapters caused improper serialization and deserialization. The Lock now correctly serializes and deserializes across all supported adapters.
