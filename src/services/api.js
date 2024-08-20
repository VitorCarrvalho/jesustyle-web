// api.js
import axios from "axios";

const api = axios.create({
  baseURL: '', // Defina a URL base da sua API
});

export { api };
