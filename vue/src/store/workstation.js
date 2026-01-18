import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";

export const useWorkStationStore = defineStore("workstation", () => {
  const initialized = ref(false);
  const name = ref(null);
  const framework = ref(null);

  async function init() {
    if (initialized.value) return; // ✅ Prevent double initialization

    try {
      const { data } = await axios.get("/api/workstation");

      name.value = data.name;
      framework.value = data.framework;

      initialized.value = true; // ✅ Mark as initialized
      console.info("Workstation Initialized");
    } catch (err) {
      console.error("Workstation init failed:", err);
      initialized.value = false; // ✅ Ensure we don't falsely mark initialized
      throw err; // important for router guard
    }
  }

  return { initialized, name, framework, init };
});
