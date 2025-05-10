import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
    title: string;
    description: ReactNode;
};

const FeatureList: FeatureItem[] = [
    {
        title: "Immutable Collections",
        description: (
            <>
                Immutable data can't be changed after creation, simplifying app
            </>
        ),
    },
    {
        title: "Adaptable EventBus",
        description: <>WRITE TEXTS</>,
    },
    {
        title: "Adaptable Cache",
        description: <>WRITE TEXTS</>,
    },
    {
        title: "Adaptable Atomic Lock",
        description: <>WRITE TEXTS</>,
    },
    {
        title: "Adaptable Serde (serialization and deserialization)",
        description: <>WRITE TEXTS</>,
    },
    {
        title: "Agnostic middleware system",
        description: <>WRITE TEXTS</>,
    },
    {
        title: "Resielence middlewares",
        description: <>WRITE TEXTS</>,
    },
];

function Feature({ title, description }: FeatureItem) {
    return (
        <div className={clsx("col col--4")}>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}

