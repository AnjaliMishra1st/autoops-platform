require("dotenv").config();
const express = require("express");
const axios = require("axios");
const generateDockerfile = require("./services/dockerGenerator");
const generatePipeline = require("./services/pipelineGenerator");

const app = express();
const PORT = 5000;

/* ---------------- HEALTH CHECK ---------------- */
app.get("/health", (req, res) => {
    res.send("AutoOps backend running");
});

/* ---------------- REPO ANALYZER ---------------- */
app.get("/analyze", async (req, res) => {
    const repoUrl = req.query.repo;

    if (!repoUrl) {
        return res.status(400).json({ error: "Repo URL required" });
    }

    try {
        const parts = repoUrl.replace("https://github.com/", "").split("/");
        const owner = parts[0];
        const repo = parts[1];

        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents`
        );

        const files = response.data.map(f => f.name.toLowerCase());

        let tech = "Unknown";

        if (files.includes("package.json")) tech = "Node.js / JavaScript";
        else if (files.includes("requirements.txt")) tech = "Python";
        else if (files.includes("pom.xml")) tech = "Java (Maven)";
        else if (files.includes("dockerfile")) tech = "Dockerized App";

        res.json({ detected: tech, files });
    } catch (err) {
        res.status(500).json({ error: "Could not analyze repository" });
    }
});

/* ---------------- DOCKERFILE GENERATOR ---------------- */
app.get("/dockerfile", (req, res) => {
    const tech = req.query.tech;

    if (!tech) {
        return res.status(400).send("Tech required");
    }

    const dockerfile = generateDockerfile(tech);
    res.setHeader("Content-Disposition", "attachment; filename=Dockerfile");
    res.setHeader("Content-Type", "text/plain");
    res.send(dockerfile);

});

/* ---------------- PREPARE PROJECT ---------------- */
app.get("/prepare", async (req, res) => {
    const repoUrl = req.query.repo;

    if (!repoUrl) {
        return res.status(400).send("Repo URL required");
    }

    try {
        const parts = repoUrl.replace("https://github.com/", "").split("/");
        const owner = parts[0];
        const repo = parts[1];

        const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/contents`,
    {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`
        }
    }
);

        const files = response.data.map(f => f.name.toLowerCase());

        let tech = "Unknown";
        if (files.includes("package.json")) tech = "Node.js / JavaScript";
        else if (files.includes("requirements.txt")) tech = "Python";
        else if (files.includes("pom.xml")) tech = "Java (Maven)";
        else if (files.includes("dockerfile")) tech = "Dockerized App";

        const dockerfile = generateDockerfile(tech);
        const pipeline = generatePipeline(tech);

        res.json({
            detected: tech,
            dockerfile: dockerfile,
            pipeline: pipeline
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});


/* ---------------- SERVER START ---------------- */
app.listen(PORT, () => {
    console.log(`AutoOps server started on port ${PORT}`);
});

/* ---------------- PIPELINE GENERATOR ---------------- */
app.get("/pipeline", (req, res) => {
    const tech = req.query.tech;
    const pipeline = generatePipeline(tech);
    res.setHeader("Content-Disposition", "attachment; filename=deploy.yml");
    res.setHeader("Content-Type", "text/yaml");
    res.send(pipeline);

});
