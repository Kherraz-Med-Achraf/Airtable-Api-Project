<template>
  <div class="admin">
    <span
      class="material-symbols-outlined back-button"
      @click="$router.push('/')"
    >
      arrow_circle_left
    </span>
    <h1>Dashboard Admin</h1>
    <!-- Liste des projets -->
    <table>
      <thead>
        <tr>
          <th>Titre</th>
          <th>Likes</th>
          <th>Publié</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in projects" :key="p.id">
          <td>{{ p.title }}</td>
          <td>❤️ {{ p.likes }}</td>
          <td>
            <input
              type="checkbox"
              :checked="p.published"
              @change="togglePublish(p)"
            />
          </td>
          <td>
            <button @click="deleteProject(p.id)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <h2>Créer un nouveau projet</h2>

    <!-- Formulaire de création -->
    <form @submit.prevent="createProject" class="create-form">
      <input v-model="newProj.title" placeholder="Titre" required />
      <textarea
        v-model="newProj.description"
        placeholder="Description"
        required
      ></textarea>

      <input
        v-model="newProj.students"
        placeholder="Étudiants (séparés par ,)"
      />
      <input
        v-model="newProj.technologies"
        placeholder="Technos (séparées par ,)"
      />

      <input
        v-model="newProj.imageUrl"
        placeholder="URL de l’image (optionnel)"
      />

      <button type="submit" :disabled="isCreating">
        {{ isCreating ? "Création…" : "Créer" }}
      </button>

      <p v-if="createError" class="error">{{ createError }}</p>
      <p v-if="createSuccess" class="success">{{ createSuccess }}</p>
    </form>

    <hr />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const projects = ref([]);
const newProj = ref({
  title: "",
  description: "",
  students: "",
  technologies: "",
  imageUrl: "",
});

const isCreating = ref(false);
const createError = ref("");
const createSuccess = ref("");

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

const fetchProjects = async () => {
  try {
    const { data } = await api.get("/admin/projects");
    projects.value = data;
  } catch (e) {
    console.error("Impossible de charger les projets admin", e);
  }
};

const createProject = async () => {
  createError.value = "";
  createSuccess.value = "";
  isCreating.value = true;
  try {
    const images = newProj.value.imageUrl
      ? [newProj.value.imageUrl.trim()]
      : [];

    const payload = {
      title: newProj.value.title,
      description: newProj.value.description,
      students: newProj.value.students.split(",").map((s) => s.trim()),
      technologies: newProj.value.technologies.split(",").map((t) => t.trim()),
      images,
    };

    await api.post("/admin/projects", payload);
    createSuccess.value = "Projet créé avec succès !";
    newProj.value = {
      title: "",
      description: "",
      students: "",
      technologies: "",
      imageUrl: "",
    };
    fetchProjects();
  } catch (err) {
    console.error(err);
    createError.value =
      err.response?.data?.error || "Erreur lors de la création";
  } finally {
    isCreating.value = false;
  }
};

const deleteProject = async (id) => {
  await api.delete(`/admin/projects/${id}`);
  fetchProjects();
};

const togglePublish = async (p) => {
  await api.patch(`/admin/projects/${p.id}/publish`, {
    publish: !p.published,
  });

  fetchProjects();
};

onMounted(fetchProjects);
</script>

<style lang="scss" scoped>
.admin {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;

  h1 {
    font-size: 2.2rem;
    margin-bottom: 2rem;
    color: #2a3750;
    font-weight: 600;
  }

  h2 {
    margin-top: 2rem;
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #2a3750;
    font-weight: 600;
  }

  hr {
    border: none;
    height: 1px;
    background: #e9ecef;
    margin: 2rem 0;
  }
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  input,
  textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3fefff;
      box-shadow: 0 0 10px rgba(63, 239, 255, 0.493);
    }
  }

  button {
    width: fit-content;
    background: #3fefff;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #38dae9;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(67, 97, 238, 0.2);
    }
  }
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;

  thead {
    background: #f1f3f5;

    th {
      padding: 1rem;
      font-weight: 600;
      color: #495057;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }
  }

  tbody {
    tr {
      transition: all 0.2s ease;

      &:hover {
        background-color: #f8f9fa;
      }

      &:not(:last-child) td {
        border-bottom: 1px solid #e9ecef;
      }
    }

    td {
      padding: 1rem;
      color: #495057;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #4361ee;
        cursor: pointer;
      }

      button {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 0.5rem 0.8rem;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #c0392b;
          transform: translateY(-1px);
        }
      }
    }
  }
}

.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 32px;
  color: #3fefff;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: #38dae9;
    transform: scale(1.2);
  }
}

.error {
  color: #c0392b;
  margin-top: 0.5rem;
}
.success {
  color: #27ae60;
  margin-top: 0.5rem;
}
</style>
