// stores/user.js
import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  // state
  const user = ref(null);

  // actions
  async function signup(payload) {
    try {
      const res = await axios.post("/api/auth/signup", payload);
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  async function signin(payload) {
    try {
      const res = await axios.post("/api/auth/signin", payload);
      user.value = res.data.user;
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  function signout() {
    user.value = null;
  }

  return {
    user,
    signup,
    signin,
    signout,
  };
});
