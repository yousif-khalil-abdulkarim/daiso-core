---
sidebar_position: 1
---

# Serde intro

**What is a Serde?**

A **Serde** is an abbrevation for serializer and deserializer.

**What is serialization and serializer?**

-   Serialization is the process of converting an object (or data structure) into a stream of bytes (or a string) so that it can be:

    -   Stored in a file

    -   Transmitted over a network

    -   Saved in a database

-   The serialized format can be:

    -   Binary (compact, not human-readable)

    -   Text-based (JSON, XML, YAML – human-readable)

-   Serializer is the function or method that performs serialization.

**What is deserialization and deserializer?**

-   Deserialization is the reverse process, converting the serialized data (bytes/string) back into an object (or data structure) that can be used in a program.

-   Deserializer is the function or method that performs deserialization.
