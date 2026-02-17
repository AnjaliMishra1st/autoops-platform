function generatePipeline(tech) {
    return `
name: AutoOps Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Build Docker Image
      run: docker build -t autoops-app .

    - name: Run Container
      run: docker run -d -p 3000:3000 autoops-app
`;
}

module.exports = generatePipeline;
