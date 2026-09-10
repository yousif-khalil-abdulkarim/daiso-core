import { INTEGRATIONS_ITEMS } from "../../data/data.js";
import { PlannedCardGrid } from "./PlannedCardGrid.js";
import styles from "../roadmap.module.css";

export function IntegrationsSection() {
  return (<section className={styles.futureSection}><PlannedCardGrid items={INTEGRATIONS_ITEMS} /></section>);
}
