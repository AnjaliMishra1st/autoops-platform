function generateDockerfile(tech) {
    if (tech === "Node.js / JavaScript") {
        return `
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm","start"]
`;
    }

    if (tech === "Python") {
        return `
FROM python:3.10
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["python","app.py"]
`;
    }

    return "No Dockerfile template available for detected tech.";
}

module.exports = generateDockerfile;
