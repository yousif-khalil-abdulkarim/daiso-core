import { SiTypescript, SiVitest } from "@icons-pack/react-simple-icons";
import {
    CheckSquare2,
    Lock,
    CalendarCheck,
    Server,
    Library,
    Webhook,
    Binary,
    CircuitBoard
} from "lucide-react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

type FeatureItemProps = {
    icon?: ReactNode;
    title: ReactNode;
    description: ReactNode;
};
function FeatureItem(props: FeatureItemProps) {
    return (
        <div className="padding--md col col--4">
            <div
                className="row row--2 text--primary margin--none margin-bottom--md"
                style={{
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                {props.icon}
                <h3 className="margin--none">{props.title}</h3>
            </div>

            <p>{props.description}</p>
        </div>
    );
}

type FeatureItemsProps = {
    items: FeatureItemProps[];
};
function FeatureItems(props: FeatureItemsProps) {
    return (
        <section>
            <div className="container padding-horiz--xl">
                <div className="row">
                    {props.items.map((props, idx) => (
                        <FeatureItem key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}

type ComponentItemProps = {
    icon?: ReactNode;
    title: ReactNode;
    description: ReactNode;
};
function ComponentItem(props: ComponentItemProps) {
    return (
        <div className="col col--4 margin-bottom--lg">
            <div
                className="card shadow--md padding--md"
                style={{
                    height: "100%",
                }}
            >
                <div
                    className="card__header row text--primary"
                    style={{
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    {props.icon}
                    <h3 className="margin--none">{props.title}</h3>
                </div>
                <div className="card__body">
                    <p>{props.description}</p>
                </div>
            </div>
        </div>
    );
}

type ComponentItemsProps = {
    items: ComponentItemProps[];
};
function ComponentItems(props: ComponentItemsProps) {
    return (
        <section>
            <div className="container padding-horiz--xl">
                <h3 className="hero__title text--primary margin-bottom--xl col col--8">
                    A growing collection of officially maintained components
                </h3>
                <div className="row">
                    {props.items.map((props, idx) => (
                        <ComponentItem key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}

const featureItems = (projectName: ReactNode): FeatureItemProps[] => [
    {
        icon: <SiTypescript size="2.5rem" />,
        title: "Type safe",
        description: (
            <>
                We pay a closer look at type-safety, seamless intellisense, and
                support for auto imports when designing library APIs.
            </>
        ),
    },
    {
        icon: <CheckSquare2 size="2.5rem" strokeWidth="1.5px" />,
        title: "ESM ready",
        description: (
            <>
                {projectName} leverages modern JavaScript primitives, including
                ES modules
            </>
        ),
    },
    {
        icon: <SiVitest size="2.5rem" />,
        title: "Easily testable",
        description: (
            <>
                {projectName} includes built-in{" "}
                <a href="https://vitest.dev/">vitest</a> helpers for testing
                custom adapters and in-memory adapters for all components,
                enabling testing without Docker.
            </>
        ),
    },
    {
        icon: <CheckSquare2 size="2.5rem" strokeWidth="1.5px" />,
        title: "Supports standard schema",
        description: (
            <>
                Integrated seamlessly with{" "}
                <a href="https://standardschema.dev/">standard schema</a>{" "}
                allowing you to use libraries like{" "}
                <a href="https://zod.dev/">zod</a> to ensure both compile time
                and runtimte typesafety.
            </>
        ),
    },
];
const componentItems = (projectName: ReactNode): ComponentItemProps[] => [
    {
        icon: <Server size="2.5rem" />,
        title: "Cache",
        description: (
            <>
                Speed up your applications by storing slowly changing data in a
                cache store.
            </>
        ),
    },
    {
        icon: <CalendarCheck size="2.5rem" />,
        title: "EventBus",
        description: (
            <>Easily send events accross different server applications or in-memory.</>
        ),
    },
    {
        icon: <CircuitBoard size="2.5rem" />,
        title: "Circuit-breaker",
        description: (
            <>
               A circuit-breaker is a resilience primitive preventing cascading failures from external services by stopping calls to a failing service.
            </>
        ),
    },
    {
        icon: <Lock size="2.5rem" />,
        title: "Lock",
        description: (
            <>
               A lock ensures mutual exclusion for a shared resource across multiple process, allowing only one process to access it at a time to prevent race conditions.
            </>
        ),
    },
    {
        icon: <Lock size="2.5rem" />,
        title: "Semaphore",
        description: (
            <>
                A semaphore is a concurrency control primitive used to limit the number of processes or 
                systems that can access a shared resource of code concurrently.
            </>
        ),
    },
    {
        icon: <Lock size="2.5rem" />,
        title: "Shared lock",
        description: (
            <>
               A shared-lock (a.k.a reader writer lock) is a concurrency primitive offering better concurrency than a lock by coordinating a reader semaphore for concurrent access and an writer lock for mutual exclusion, strictly preventing conflicting simultaneous access and maintaining data consistency.
            </>
        ),
    },
    {
        icon: <Binary size="2.5rem" />,
        title: "Serde",
        description: (
            <>
                Add custom serialization and deserialization logic that
                seamlessly integrates with all other components.
            </>
        ),
    },
    {
        icon: <Library size="2.5rem" />,
        title: "Collection",
        description: (
            <>
                Effortlessly work with Arrays, Iterables, and AsyncIterables.
                Filter and transform with precision.
            </>
        ),
    },
    {
        icon: <Webhook size="2.5rem" />,
        title: "Hooks",
        description: (
            <>
                Extend any sync and async function with agnostic hooks.
                {projectName} includes predefined retry, fallback, timeout and
                hedging hooks to easily allow handling transient failures.
            </>
        ),
    },
];

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();

    return (
        <Layout
            title={siteConfig.title}
            description="Description will go into a meta tag in <head />"
        >
            <header className="hero hero--primary">
                <div className="container">
                    <h1 className="hero__title">{siteConfig.title}</h1>
                    <p className="hero__subtitle col col--8">
                        is a TypeScript-first backend library for building web
                        apps and API servers. It includes an ecosystem of
                        official packages designed to work seamlessly together.
                    </p>
                    <div>
                        <Link
                            className="button button--secondary button--lg"
                            to="/docs/Installation"
                        >
                            Get started ⏱️
                        </Link>
                    </div>
                </div>
            </header>
            <main className="padding-vert--xl">
                <FeatureItems items={featureItems(siteConfig.title)} />
                <div className="margin-bottom--xl" />
                <ComponentItems items={componentItems(siteConfig.title)} />
            </main>
        </Layout>
    );
}
