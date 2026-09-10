import { RELIABILITY_MESSAGING_ITEMS } from "../../data/data.js";
import { PlannedCardGrid } from "./PlannedCardGrid.js";
import styles from "../roadmap.module.css";

export function ReliabilityMessagingSection() {
  return (<section className={styles.futureSection}><PlannedCardGrid items={RELIABILITY_MESSAGING_ITEMS} /></section>);
}
