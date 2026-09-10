import { DEV_TOOLING_ITEMS } from "../../data/data.js";
import { PlannedCardGrid } from "./PlannedCardGrid.js";
import styles from "../roadmap.module.css";

export function DevToolingSection() {
  return (<section className={styles.futureSection}><PlannedCardGrid items={DEV_TOOLING_ITEMS} /></section>);
}
