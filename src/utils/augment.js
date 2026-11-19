import { reactive } from "vue";
import AUGMENTS from "./augments.json";

export const augmentDict = reactive({ ...AUGMENTS });

export function getAugment(id) {
  const meta = augmentDict[id];
  return {
    id,
    name: meta?.name || `强化 ${id}`,
    icon: meta?.icon || "",
    rarityText: meta?.rarityText || "",
    desc: meta?.desc || "",
  };
}
