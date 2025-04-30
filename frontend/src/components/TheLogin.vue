<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <img :src="logo" alt="Logo" class="logo-image" />
        <h1>Connectez-vous</h1>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group" :class="{ error: emailError }">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            placeholder="Votre email"
            required
            @input="emailError = ''"
          />
          <span class="error-message" v-if="emailError">{{ emailError }}</span>
        </div>

        <div class="form-group" :class="{ error: passwordError }">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            v-model="password"
            placeholder="Votre mot de passe"
            required
            @input="passwordError = ''"
          />
          <span class="error-message" v-if="passwordError">{{
            passwordError
          }}</span>
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          {{ isLoading ? "Connexion en cours..." : "Se connecter" }}
        </button>
      </form>

      <p class="contact-info">
        Si vous n'avez pas d'identifiants, veuillez contacter
        <a href="mailto:gg@gg.fr">gg@gg.fr</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import logo from "../assets/19682.png";

const email = ref("");
const password = ref("");
const emailError = ref("L'email est requis");
const passwordError = ref("cdsd");
const isLoading = ref(false);

const handleLogin = async () => {
  // Reset errors
  emailError.value = "";
  passwordError.value = "";

  // Basic validation
  if (!email.value) {
    emailError.value = "L'email est requis";
    return;
  }

  if (!password.value) {
    passwordError.value = "Le mot de passe est requis";
    return;
  }

  try {
    isLoading.value = true;

    // Implement your login logic here
    // For example:
    // await login(email.value, password.value);

    console.log("Tentative de connexion avec:", {
      email: email.value,
      password: password.value,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // If successful, you might want to redirect or emit an event
  } catch (error) {
    console.error("Erreur de connexion:", error);
    // Handle error appropriately
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  font-family: "Roboto", sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 35px;
  width: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
      width: 150px;
      height: auto;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      color: #333;
      font-weight: 500;
      text-align: center;
    }
  }
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;
  .form-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #4c5561;
    }
    input {
      width: 100%;
      padding: 15px 20px;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:focus {
        outline: none;
        border-color: #3fefff;
        box-shadow: 0 0 10px rgba(63, 239, 255, 0.493);
      }
    }

    &.error input {
      border-color: #dc2626;
    }

    .error-message {
      display: block;
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  }
  .login-button {
    width: 100%;
    background-color: #3fefff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  
    &:hover {
      background-color: #38dae9;
    }
  
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}
.contact-info {
  text-align: center;
  font-size: 0.875rem;
  color: #806b6b;
  a {
    color: #0d00ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
