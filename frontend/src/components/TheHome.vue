<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const projects = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Récupère l’URL de l’API depuis l’env
const apiUrl = import.meta.env.VITE_API_URL;

// Charger la liste des projets publiés
const fetchProjects = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await axios.get(`${apiUrl}/projects`);
    // votre backend renvoie [{ id, fields:{…} }, …]
    projects.value = res.data.map((p) => ({
      id: p.id,
      title: p.fields.Titre,
      description: p.fields.Description,
      image: p.fields.Images?.[0]?.url || "",
      students: p.fields.Étudiants || [],
      technologies: p.fields.Technologies || [],
      likes: p.fields.Likes || 0,
    }));
  } catch (e) {
    console.error(e);
    error.value = "Impossible de charger les projets";
  } finally {
    isLoading.value = false;
  }
};

// Incrémente le like en appelant votre API
const likeProject = async (projectId) => {
  try {
    const res = await axios.post(`${apiUrl}/projects/${projectId}/like`);
    // mettre à jour le compteur local
    const p = projects.value.find((p) => p.id === projectId);
    if (p) p.likes = res.data.likes;
  } catch (e) {
    console.error(e);
  }
};

// Au montage du composant
onMounted(fetchProjects);
</script>

<template>
  <div>
    <span
      class="material-symbols-outlined login"
      @click="router.push('/login')"
    >
      account_circle
    </span>

    <h1>Portfolio Web Ingénierie</h1>

    <div v-if="isLoading">Chargement…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="portfolio-container">
      <div class="projects-grid">
        <div v-for="project in projects" :key="project.id" class="project-card">
          <img
            v-if="project.image"
            :src="project.image"
            :alt="project.title"
            class="project-image"
          />
          <div class="project-info">
            <h2 class="project-title">{{ project.title }}</h2>
            <p class="project-description">{{ project.description }}</p>
            <div class="project-students">
              <span>Réalisé par: </span>
              <span v-for="(s, i) in project.students" :key="i">
                {{ s }}<span v-if="i < project.students.length - 1">, </span>
              </span>
            </div>
            <div class="project-technologies">
              <span
                v-for="tech in project.technologies"
                :key="tech"
                class="tech-badge"
              >
                {{ tech }}
              </span>
            </div>
            <div class="project-likes">
              <button @click="likeProject(project.id)" class="like-button">
                ❤️ {{ project.likes }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 42px;
  color: #3fefff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #35cddb;
    transform: scale(1.2);
  }
}

// Variables
$primary-color: #3498db;
$secondary-color: #2c3e50;
$accent-color: #e74c3c;
$bg-color: #f9f9f9;
$card-bg: #ffffff;
$text-color: #333333;
$border-radius: 8px;
$box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

// Global styles
h1 {
  text-align: center;
  color: $secondary-color;
  font-size: 2.5rem;
  margin: 2rem 0;
  font-weight: 700;
}

.portfolio-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

// Project card styles
.project-card {
  display: flex;
  flex-direction: column;
  background-color: $card-bg;
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: $box-shadow;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }
}

.project-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.project-info {
  padding: 1.5rem;
}

.project-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: $secondary-color;
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.project-description {
  color: $text-color;
  line-height: 1.5;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
}

.project-students {
  margin-bottom: 1rem;
  font-size: 0.9rem;

  span:first-child {
    font-weight: 600;
    color: $secondary-color;
  }

  .student-name {
    color: $text-color;
  }
}

.project-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;

  .tech-badge {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
    padding: 0.3rem 0.6rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }
}

.project-likes {
  display: flex;
  justify-content: flex-end;

  .like-button {
    background-color: transparent;
    border: 1px solid rgba($accent-color, 0.3);
    color: $accent-color;
    border-radius: 20px;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;

    &:hover {
      background-color: rgba($accent-color, 0.1);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>
