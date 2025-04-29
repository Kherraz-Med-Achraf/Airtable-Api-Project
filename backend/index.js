require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Airtable = require("airtable");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// Configure Airtable
Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// PUBLIC ROUTES

// 1) Lister les projets (option ?published=true)
app.get("/projects", async (req, res) => {
  const { published } = req.query;
  const opts = {};
  if (published !== undefined) {
    // Airtable checkbox field 'Publier' => TRUE/FALSE
    opts.filterByFormula = `{Publier} = ${published === "true"}`;
  }
  try {
    const records = await base("Projects").select(opts).firstPage();
    res.json(records.map((r) => ({ id: r.id, fields: r.fields })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2) Détail d’un projet
app.get("/projects/:id", async (req, res) => {
  try {
    const rec = await base("Projects").find(req.params.id);
    res.json({ id: rec.id, fields: rec.fields });
  } catch {
    res.status(404).json({ error: "Projet non trouvé" });
  }
});

// 3) Like
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

// Login admin (stockés dans table "Users")
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

// Publier / dépublier un projet
app.patch("/admin/projects/:id/publish", authGuard, async (req, res) => {
  const { publish } = req.body; // boolean true/false
  try {
    const [updated] = await base("Projects").update([
      { id: req.params.id, fields: { Publier: publish } },
    ]);
    res.json({ id: updated.id, published: updated.fields.Publier });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API démarrée sur :${port}`));
