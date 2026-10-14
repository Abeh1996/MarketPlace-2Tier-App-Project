# MarketPlace — Containerized Application Deployment and CI/CD

A hands-on DevOps project demonstrating containerization, automated image publishing, deployment with Docker Compose, HTTP traffic handling with Nginx, and troubleshooting across application and infrastructure layers.

> **Environment:** GitHub Codespaces — development and deployment lab  
> **Technologies:** Git, GitHub Actions, Docker, Docker Compose, Docker Hub, Nginx, Node.js, Express, Prisma, PostgreSQL

## 1. Project Overview

MarketPlace is a web application deployed as a multi-container environment. The project focuses on the DevOps practices required to package an application, publish container images, deploy services, configure runtime connectivity, and verify that the application works beyond a successful pipeline run.

The deployment environment runs in GitHub Codespaces. GitHub Actions builds and publishes container images, while a self-hosted runner executes the deployment commands defined in the workflow.

The project also documents real troubleshooting activities involving runner configuration, runtime environment variables, Docker network connectivity, and PostgreSQL authentication.

### Project objectives

- Containerize the frontend and backend services.
- Run the application and PostgreSQL using Docker Compose.
- Automate the configured build, image publishing, and deployment steps using GitHub Actions.
- Use Docker Hub as the container image registry.
- Configure Nginx to handle frontend HTTP requests according to the deployed configuration.
- Investigate and resolve service connectivity and database authentication problems.
- Verify application functionality and database persistence through practical tests.

## 2. Architecture

The architecture separates the CI/CD process from the application's runtime request flow.

![MarketPlace architecture diagram](docs/architecture/marketplace-architecture.png)

### Component responsibilities

| Component | Responsibility |
|---|---|
| GitHub repository | Stores application source code, Dockerfiles, Docker Compose configuration, and the CI/CD workflow. |
| GitHub Actions | Executes the configured workflow steps for building and publishing images and initiating deployment. |
| Docker Hub | Stores the published frontend and backend container images. |
| Self-hosted runner | Executes the workflow's deployment commands in the configured Codespaces environment. |
| Docker Compose | Defines and manages the frontend, backend, and database services. |
| Nginx | Handles HTTP requests according to the frontend's Nginx configuration, including static file serving and any configured proxy rules. |
| Node.js and Express | Runs the backend API and processes application requests. |
| Prisma | Provides the application's database access and schema/migration tooling. |
| PostgreSQL | Stores application data. |

### Runtime request flow

1. A user opens the MarketPlace frontend through the configured browser-accessible endpoint.
2. Nginx handles the HTTP request according to its configuration and serves the frontend content.
3. The frontend JavaScript sends an API request to the configured backend endpoint. If Nginx is configured to reverse-proxy API paths, the request follows that proxy route instead.
4. The Express backend validates and processes the request.
5. When database access is required, the backend uses Prisma and the configured database connection to communicate with PostgreSQL over the Docker network.
6. PostgreSQL returns the result to the backend.
7. The backend sends an HTTP response to the frontend, which displays the result to the user.

The actual API routing path is determined by the frontend API URL and the Nginx configuration committed to this repository.

## 3. Nginx Configuration and HTTP Traffic Handling

Nginx is part of the frontend delivery path. Its role is defined by the Nginx configuration included in the project.

The configuration should be reviewed to identify:

- The listening port used by Nginx.
- The document root and default index file, if Nginx serves static frontend assets.
- The handling of frontend routes and static resources.
- Any `location` and `proxy_pass` rules used to forward API requests to the backend.
- The relationship between the container's listening port and the published port used to reach the application.

### Nginx evidence

The screenshot below should show the actual configuration used by the running frontend container.

![Actual Nginx configuration](docs/screenshots/04-nginx-configuration.png)

The browser Network panel should also be used to verify the real request path, HTTP method, status, and response.

![Browser request verification](docs/screenshots/06-browser-api-request.png)

This evidence connects the Nginx configuration to observable application behaviour instead of treating the presence of a configuration file as proof that the routing works.

## 4. CI/CD Pipeline

GitHub Actions automates the steps configured in the repository's workflow. The self-hosted runner executes the deployment commands in the Codespaces environment.

### Pipeline flow

1. A configured GitHub event triggers the workflow.
2. The workflow builds the frontend and backend container images.
3. The images are tagged using the tags configured in the workflow, including `latest` and commit-SHA tags where defined.
4. The workflow authenticates to Docker Hub using configured credentials and publishes the images.
5. The self-hosted runner executes the configured image-pull and Docker Compose deployment commands.
6. The running containers and application endpoints are checked separately to validate the deployment.

### Workflow execution

The following screenshot should show the actual completed GitHub Actions run, including its commit and job results.

![GitHub Actions workflow execution](docs/screenshots/01-github-actions-success.png)

### Published container images

The Docker Hub screenshot should show the actual frontend and backend image repositories and their published tags.

![MarketPlace container images in Docker Hub](docs/screenshots/02-dockerhub-images.png)

### Runtime deployment

The runtime screenshot should show the relevant containers, their status, and port mappings.

![Running application containers](docs/screenshots/03-runner-and-containers.png)

A successful workflow is an important result, but it does not alone prove that browser requests succeed or that PostgreSQL stores the expected data. Those behaviours are verified independently.

## 5. Containerization and Runtime Configuration

Docker Compose defines the application's frontend, backend, and PostgreSQL services.

The backend requires runtime configuration for its listening port, database connection, and any other settings used by the application. These values must be supplied through the configured runtime environment rather than hard-coded into the Docker image.

### Key configuration considerations

- **Service discovery:** containers on the same Docker network can communicate using the appropriate Compose service names.
- **Database connectivity:** the backend must use a database hostname and port reachable from its own container. When `db` is the Compose service name, the backend connection uses that service name rather than `localhost`.
- **Port mapping:** published host ports determine how services are reached from outside the Docker network; they are distinct from internal container ports.
- **Environment variables:** credentials and connection settings must be provided securely at runtime.
- **Database storage:** the Compose configuration should define the actual storage mechanism used for PostgreSQL and whether data survives container recreation.

The repository's `docker-compose.yml` is the source of truth for the service definitions, networks, volumes, port mappings, and environment configuration.

## 6. End-to-End Application Verification

Application verification must cover the path from the browser to the backend and, for a write operation, to PostgreSQL.

### Frontend verification

Open the deployed frontend in a browser and confirm that the expected page and application functionality are available.

![MarketPlace frontend running in the browser](docs/screenshots/05-frontend-browser.png)

### Browser-to-API verification

Submit a valid test record through an implemented application form. Inspect the resulting request in the browser's Developer Tools under **Network**.

Record the actual request method, endpoint, HTTP status, and response. Remove cookies, tokens, credentials, and private data before capturing the screenshot.

![Browser API request and response](docs/screenshots/06-browser-api-request.png)

### Database persistence verification

For a complete write-path test, query the relevant PostgreSQL table and verify that the submitted test record exists with the expected value or identifier.

![Database query confirming the submitted record](docs/screenshots/08-database-write-verified.png)

The record should be matched using a unique, harmless test value. Where the application supports reading the record again, retrieve it through the application or API to strengthen the verification.

**Acceptance criterion:** mark this end-to-end test as passed only after the browser submission, successful API operation, and matching PostgreSQL record have all been verified. If the test has not yet been completed, treat it as outstanding rather than claiming success.

## 7. Troubleshooting and Root-Cause Analysis

The project includes troubleshooting across the CI/CD runner, runtime configuration, Docker networking, and database authentication layers.

Each incident is documented using the following method:

1. Symptom and error evidence.
2. Investigation and diagnostic checks.
3. Confirmed root cause.
4. Resolution.
5. Verification after the change.

The screenshots in the detailed troubleshooting report should be genuine captures from the project. Error screenshots should be paired with evidence showing the corresponding fix or successful retest.

### Issues investigated

| Issue | Investigation focus | Verification evidence |
|---|---|---|
| Self-hosted runner configuration | Workflow runner requirement, runner availability, and label matching. | A successful workflow run on the intended runner. |
| Missing runtime environment configuration | Required environment variables and how they are supplied to the services. | Successful configuration check or application startup, with secrets redacted. |
| Docker network connectivity | Container status, service-name resolution, network reachability, and host firewall rules. | A successful connectivity check or database operation after the fix. |
| PostgreSQL authentication | Whether the connection reaches PostgreSQL and whether the runtime credentials are valid. | A successful authenticated connection or query after correcting the configuration. |

The detailed incident records, including the original errors, root causes, changes, and retests, are maintained in [`docs/troubleshooting.md`](docs/troubleshooting.md).

## 8. Security Considerations

The project follows these security principles:

- Do not commit `.env` files containing credentials.
- Do not include passwords, access tokens, or full credential-bearing database URLs in screenshots or documentation.
- Supply runtime configuration through the intended environment or secret-management mechanism.
- Restrict exposed ports to the access required by the lab.
- Treat a self-hosted runner as an execution environment that requires appropriate access controls.
- Review Docker Compose networking and host firewall changes to avoid unnecessary exposure.

This is a Codespaces-based deployment and testing lab, not a claim of production-grade infrastructure security.

## 9. Reproduction and Validation

Use the configuration committed to this repository as the source of truth when reproducing the deployment.

### Prerequisites

- Access to this GitHub repository.
- Docker and Docker Compose available in the execution environment.
- Docker Hub access if the workflow publishes images to a private or authenticated registry.
- The required runtime environment variables.
- A registered and running self-hosted runner if the workflow requires one.

### Validation sequence

1. Review the workflow and Docker Compose configuration.
2. Check that required environment variables are available without printing secrets.
3. Run the configured workflow and inspect its job logs.
4. Confirm that the expected images and tags exist in Docker Hub.
5. Check the state and logs of the deployed containers.
6. Open the frontend and inspect its HTTP requests.
7. Test the backend endpoint.
8. Verify database connectivity and, when supported by the application, confirm that a browser-submitted record exists in PostgreSQL.

Use the actual commands and endpoint URLs defined by the repository and Codespaces environment when carrying out these checks.

## 10. Limitations and Future Improvements

The current project demonstrates containerization, CI/CD automation, runtime configuration, service networking, and troubleshooting within a Codespaces environment.

Potential improvements, depending on what is implemented and tested next, include:

- Automated integration and end-to-end tests.
- Explicit health checks and deployment validation in the workflow.
- More structured log collection and troubleshooting.
- Safer deployment rollback and image-version selection.
- Improved secret management and restricted runner permissions.
- Deployment to a dedicated cloud environment.

These are improvement areas, not features claimed to be implemented in the current version.

## 11. Skills Demonstrated

- Docker image building and container execution.
- Docker Compose service orchestration.
- GitHub Actions workflow configuration.
- Container image publishing to Docker Hub.
- Self-hosted runner configuration and troubleshooting.
- Nginx HTTP handling and request-path investigation.
- Backend API and PostgreSQL connectivity troubleshooting.
- Runtime environment configuration and credential handling.
- Log inspection, root-cause analysis, and post-fix verification.
- Documentation of architecture, deployment, and technical incidents.

## Project Status

This project is maintained as a practical DevOps learning and portfolio project. Its implementation and test claims should be evaluated against the committed configuration files and the evidence captured from actual workflow runs and runtime tests.
