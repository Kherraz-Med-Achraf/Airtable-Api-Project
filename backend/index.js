require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Airtable = require("airtable");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);


//helper
async function fetchLinkedNames(tableName, ids, nameField = "Name") {
  if (!ids || !ids.length) return {};
  const formula =
    "OR(" +
    ids.map((id) => `RECORD_ID()="${id}"`).join(",") +
    ")";
  const records = await base(tableName).select({
    filterByFormula: formula,
    pageSize: 100,
  }).firstPage();
  return records.reduce((map, r) => {
    map[r.id] = r.fields[nameField];
    return map;
  }, {});
}

async function ensureLinkedRecords(tableName, names, nameField = "Name") {
  if (!names?.length) return [];

  const formula = "OR(" +
    names.map((n) => `{${nameField}}="${n.replace(/"/g, '\\"')}"`).join(",") +
    ")";
  const existing = await base(tableName)
    .select({ filterByFormula: formula, pageSize: 100 })
    .firstPage();

  const map = new Map(existing.map(r => [r.fields[nameField], r.id]));

  const missing = names.filter(n => !map.has(n));

  if (missing.length) {
    const toCreate = missing.map(n => ({ fields: { [nameField]: n } }));
    const created = await base(tableName).create(toCreate);
    created.forEach(r => map.set(r.fields[nameField], r.id));
  }

  return names.map(n => map.get(n));
}


// PUBLIC ROUTES

// Lister les projets
app.get("/projects", async (req, res) => {
  try {
    const projectRecs = await base("Projects")
      .select({ filterByFormula: "{Publier} = TRUE()" })
      .firstPage();

    const allStudentIds = new Set();
    const allTechIds    = new Set();
    projectRecs.forEach((r) => {
      (r.fields.Étudiants || []).forEach((id) => allStudentIds.add(id));
      (r.fields.Technologies || []).forEach((id) => allTechIds.add(id));
    });

    const [studentMap, techMap] = await Promise.all([
      fetchLinkedNames("Étudiants",    [...allStudentIds], "Name"),
      fetchLinkedNames("Technologies", [...allTechIds],    "Name"),
    ]);

    const projects = projectRecs.map((r) => {
      const f = r.fields;
      return {
        id:           r.id,
        title:        f.Titre,
        description:  f.Description,
        image:        f.Images?.[0]?.url || "",
        students:     (f.Étudiants || []).map((id) => studentMap[id] || id),
        technologies: (f.Technologies || []).map((id) => techMap[id]    || id),
        likes:        f.Likes || 0,
      };
    });

    return res.json(projects);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// Détail d’un projet
app.get("/projects/:id", async (req, res) => {
  try {
    const rec = await base("Projects").find(req.params.id);
    res.json({ id: rec.id, fields: rec.fields });
  } catch {
    res.status(404).json({ error: "Projet non trouvé" });
  }
});

// Like
app.post("/projects/:id/like", async (req, res) => {
  try {
    const rec = await base("Projects").find(req.params.id);
    const current = rec.fields.Likes || 0;
    const [updated] = await base("Projects").update([
      { id: rec.id, fields: { Likes: current + 1 } },
    ]);
    res.json({ id: updated.id, likes: updated.fields.Likes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// AUTH ROUTES

// Login admin
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [user] = await base("Users")
      .select({
        filterByFormula: `LOWER({Email}) = "${email.toLowerCase()}"`,
        maxRecords: 1,
      })
      .firstPage();

    if (!user) return res.status(401).json({ error: "Utilisateur non trouvé" });
    const hash = user.fields["Mot de passe Hash"];
    const match = await bcrypt.compare(password, hash);
    if (!match) return res.status(401).json({ error: "Mot de passe invalide" });

    const token = jwt.sign(
      { sub: user.id, email, role: user.fields.Rôle },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ access_token: token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// MIDDLEWARE de vérification JWT
function authGuard(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) return res.status(401).end();
  const token = auth.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).end();
  }
}

// ADMIN ROUTES (protégées)

// Lister les projets (admin)
app.get("/admin/projects", authGuard, async (req, res) => {
  try {
    const projectRecs = await base("Projects").select().firstPage();

    const allStudentIds = new Set();
    const allTechIds    = new Set();
    projectRecs.forEach((r) => {
      (r.fields.Étudiants || []).forEach((id) => allStudentIds.add(id));
      (r.fields.Technologies || []).forEach((id) => allTechIds.add(id));
    });

    const [studentMap, techMap] = await Promise.all([
      fetchLinkedNames("Étudiants",    [...allStudentIds], "Name"),
      fetchLinkedNames("Technologies", [...allTechIds],    "Name"),
    ]);

    const projects = projectRecs.map((r) => {
      const f = r.fields;
      return {
        id:           r.id,
        title:        f.Titre,
        description:  f.Description,
        image:        f.Images?.[0]?.url || "",
        students:     (f.Étudiants || []).map((id) => studentMap[id] || id),
        technologies: (f.Technologies || []).map((id) => techMap[id]    || id),
        likes:        f.Likes || 0,
        published:    f.Publier || false,
      };
    });

    return res.json(projects);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// Publier / dépublier un projet
app.patch("/admin/projects/:id/publish", authGuard, async (req, res) => {
  const { publish } = req.body; 
  try {
    const [updated] = await base("Projects").update([
      { id: req.params.id, fields: { Publier: publish } },
    ]);
    res.json({ id: updated.id, published: updated.fields.Publier });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// créer un projet
app.post("/admin/projects", authGuard, async (req, res) => {
  try {
    const { title, description, students, technologies, images } = req.body;

    const studentIds = await ensureLinkedRecords("Étudiants", students);
    const techIds = await ensureLinkedRecords("Technologies", technologies);

    const fields = {
      Titre: title,
      Description: description,
      Étudiants: studentIds,
      Technologies: techIds,
      Publier: false,
      Likes: 0,
    };

    if (Array.isArray(images) && images.length) {
      fields.Images = images.map((url) => ({ url }));
    }

    const [created] = await base("Projects").create([{ fields }]);
    return res.status(201).json({ id: created.id, fields: created.fields });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Supprimer un projet
app.delete("/admin/projects/:id", authGuard, async (req, res) => {
  try {
    await base("Projects").destroy([req.params.id]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API démarrée sur :${port}`));
