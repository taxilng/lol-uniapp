// utils/event-bus.js
import { reactive } from 'vue';

export const EventBus = {
  state: reactive({}),
  on(event, callback) {
    if (!this.state[event]) {
      this.state[event] = [];
    }
    this.state[event].push(callback);
  },
  off(event, callback) {
    if (this.state[event]) {
      const index = this.state[event].indexOf(callback);
      if (index > -1) {
        this.state[event].splice(index, 1);
      }
    }
  },
  emit(event, ...args) {
    if (this.state[event]) {
      this.state[event].forEach(callback => {
        callback(...args);
      });
    }
  }
};