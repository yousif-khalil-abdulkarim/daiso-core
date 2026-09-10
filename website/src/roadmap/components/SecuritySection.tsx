import { SECURITY_ITEMS } from "../../data/data.js";
import { PlannedCardGrid } from "./PlannedCardGrid.js";
import styles from "../roadmap.module.css";

export function SecuritySection() {
  return (<section className={styles.futureSection}><PlannedCardGrid items={SECURITY_ITEMS} /></section>);
}
