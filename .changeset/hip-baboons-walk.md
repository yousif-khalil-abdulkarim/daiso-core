---
"@daiso-tech/core": minor
---

##  Changes
- Renamed all instances of the <i>ISerializer</i> contract to <i>ISerde</i>.
- Added two new contracts:
  - <i>IDeserializer</i>: Handles only deserialization.
  - <i>ISerializer</i>: Handles olny serialization.

## New Features
- Introduced the <i>ISerializable</i> contract, enabling classes to be marked as serializable.
- Added the <i>IFlexibleSerde</i> contract, allowing registration of custom classes for serialization and deserialization.
- Implemented the <i>ISerializable</i> contract the <i>TimeSpan</i> class.