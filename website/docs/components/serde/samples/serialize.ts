import { serde } from "./serde_initial_config.js";

const serializedValue = serde.serialize({
    name: "abra",
    age: 20,
});

const deserializedValue = serde.deserialize(serializedValue);
