<script setup>
import { ref } from "vue";

// Sample project data
const projects = ref([
  {
    id: 1,
    title: "Système de Gestion de Données Environnementales",
    description:
      "Une application web pour collecter, analyser et visualiser des données environnementales en temps réel.",
    image: "https://example.com/images/project1.jpg",
    students: ["Marie Dupont", "Thomas Laurent"],
    technologies: ["Vue.js", "Node.js", "MongoDB", "D3.js"],
    likes: 42,
  },
  {
    id: 2,
    title: "Plateforme IoT pour Smart Buildings",
    description:
      "Solution connectée pour optimiser la consommation énergétique des bâtiments avec des capteurs IoT.",
    image: "https://example.com/images/project2.jpg",
    students: ["Sophie Martin", "Alexandre Dubois", "Emma Moreau"],
    technologies: ["React", "AWS", "Python", "Raspberry Pi"],
    likes: 38,
  },
  {
    id: 3,
    title: "Système Automatisé de Production",
    description:
      "Conception et implémentation d'un système de contrôle automatisé pour une chaîne de production industrielle.",
    image: "https://example.com/images/project3.jpg",
    students: ["Lucas Bernard", "Camille Petit"],
    technologies: ["PLC", "SCADA", "C++", "HMI"],
    likes: 27,
  },
]);

// Function to increment likes for a project
const likeProject = (projectId) => {
  const project = projects.value.find((p) => p.id === projectId);
  if (project) {
    project.likes++;
  }
};
</script>

<template>
  <div>
    <h1>Portfolio Web Ingénierie</h1>
    <div class="portfolio-container">
      <div class="projects-grid">
        <div v-for="project in projects" :key="project.id" class="project-card">
          <img
            :src="project.image"
            :alt="project.title"
            class="project-image"
          />

          <div class="project-info">
            <h2 class="project-title">{{ project.title }}</h2>
            <p class="project-description">{{ project.description }}</p>

            <div class="project-students">
              <span>Réalisé par: </span>
              <span
                v-for="(student, index) in project.students"
                :key="index"
                class="student-name"
              >
                {{ student
                }}{{ index < project.students.length - 1 ? ", " : "" }}
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
