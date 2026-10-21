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

### 2. Architecture

The architecture separates the CI/CD process from the application's runtime request flow.

#### MarketPlace architecture diagram<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/ae35e58e-b390-4c4d-9ca7-9a11acde85cc" />



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

Nginx is part of the frontend delivery path. It serves the frontend files (index.html, styles.css  and front app.js ) to the browser and acts as a reverse proxy for backend requests.
- The frontend docker image copies all frontend files to /usr/share/nginx/html.
- Nginx listens on port 80 inside the frontend container. Port 80 is mapped to port 5500(published port for reaching the application) of the frontend container.
- When users request the frontend page on port 5500 using the frontend URL(That is, the browser requests /), nginx returns index.html.
  <img width="848" height="289" alt="image" src="https://github.com/user-attachments/assets/eff1d9d4-c099-4707-9e97-cdfb383451bb" />
- The browser reads the index.html file and discovers references to /styles.css and /app.js. The browser then makes additional requests for these files. Nginx serves the CSS and JavaScript files from the same document root

Important:
1. Nginx does not execute your frontend JavaScript. It serves the files to the browser, and the browser executes the JavaScript.
2. The try_files fallback is particularly useful for frontend routes. If a user opens a path such as /restaurants, Nginx can return index.html when no corresponding file exists.
- As a reverse proxy, if the user then clicks on restaurants tab or health check tab the request "GET /api/restaurants" or "GET /health" is forwarded to nginx. Nginx then uses its' location parameter to know exactly how to route the request to the corresponding backend API.
  <img width="706" height="206" alt="image" src="https://github.com/user-attachments/assets/b2a0e38a-e3b2-4481-abc0-421ac1b0313b" />

Note: The browser does not directly call the backend, insteads it directly  calls the backend API, /api/restaurants or /health. Therefore, there is no need to use the backend CORS in this case

The browser Network panel shows  the real request path, HTTP method, status, and response.
<img width="1883" height="647" alt="image" src="https://github.com/user-attachments/assets/2c9733a1-60b4-487e-b482-a2cddf845355" />

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

The following screenshot shows the actual completed GitHub Actions run, including its commit and job results.

GitHub Actions workflow execution result
<img width="1514" height="355" alt="image" src="https://github.com/user-attachments/assets/da8eceb2-ddbb-4fcf-9cdc-1a92911569ba" />


### Published container images

The Docker Hub screenshot shows the actual frontend and backend image repositories and their published tags.
<img width="1104" height="259" alt="image" src="https://github.com/user-attachments/assets/2b9255c8-1e19-4c09-944a-ce3047a3280f" />

### Runtime deployment

The runtime screenshots show the relevant containers, their status, and port mappings.

Running application containers:
<img width="1781" height="268" alt="image" src="https://github.com/user-attachments/assets/1e368d25-4d5d-4e48-8bf5-cb9e57bf8e4c" />
Container listening ports:
<img width="1097" height="158" alt="image" src="https://github.com/user-attachments/assets/bed868dd-def9-467c-927f-a03a3fafc6a4" />

A successful workflow is an important result, but it does not alone prove that browser requests succeed or that PostgreSQL stores the expected data. Those behaviours are verified independently.

## 5. Containerization, Networking and Runtime Configuration
Docker Compose defines the application's frontend, backend, and PostgreSQL services.

The backend requires runtime configuration for its listening port, database connection, and any other settings used by the application. These values must be supplied through the configured runtime environment rather than hard-coded into the Docker image.

### Key configuration considerations

- **Service discovery:** containers on the same Docker network can communicate using the appropriate Compose service names.
- **Database connectivity:** the backend must use a database hostname and port reachable from its own container. When `db` is the Compose service name, the backend connection uses that service name rather than `localhost`.
- **Port mapping:** published host ports determine how services are reached from outside the Docker network; they are distinct from internal container ports.
- **Environment variables:** credentials and connection settings must be provided securely at runtime.
- **Database storage:** the Compose configuration should define the actual storage mechanism used for PostgreSQL and whether data survives container recreation.

The repository's `docker-compose.yml` is the source of truth for the service definitions, networks, volumes, port mappings, and environment configuration.

MarketPlace runs as a multi-container application managed by Docker Compose. Nginx serves the frontend and reverse-proxies `/api/` and `/health` requests to the Node.js/Express backend. The backend uses Prisma to access PostgreSQL.

### 5.1 Container Architecture

The application separates the frontend web server, backend API, and database into individual containers.

| Service | Responsibility | Port |
|---|---|---|
| Frontend / Nginx | Serves HTML, CSS and JavaScript and forwards configured API requests | `5500:80` |
| Backend API | Processes requests using Node.js and Express | `4000:4000`, if published in Compose |
| PostgreSQL | Stores application data | Internal port `5432`; no published host port if configured that way |

**Configuration file:** <img width="826" height="652" alt="image" src="https://github.com/user-attachments/assets/706186f2-67b0-453e-bf86-b89fd5043f39" />

### 5.2 HTTP Routing and Docker Networking

The browser accesses the frontend through the Codespaces-forwarded port `5500`, which maps to port `80` inside the Nginx container.

Nginx serves the frontend files from `/usr/share/nginx/html`. Requests matching `/api/` and `/health` are forwarded to the backend at `mapp-BE-container:4000`, according to the configured proxy rules.

The frontend and backend must be connected to a Docker network that permits the required communication. The backend must also be able to reach PostgreSQL through the internal Docker network.

### 5.3 Runtime Environment Variables

The backend uses runtime settings such as its listening port, database connection URL, and any other variables required by the application.

Configuration values should be injected at runtime rather than hard-coded into the Docker image. The local `.env` file must remain excluded from version control, and actual credentials must never be published in the README or screenshots.

The database URL must use a hostname reachable from the backend container. When the database is a separate container, `localhost` refers to the backend container itself, not the database container.

### 5.4 Database Storage and Persistence

PostgreSQL stores the application's data. The Compose configuration determines how database data is stored and whether it survives container recreation.

**Configuration file:** <img width="720" height="45" alt="image" src="https://github.com/user-attachments/assets/b588b517-8568-46e9-8be0-0668719e419a" />

## 6. End-to-End Application Verification

The end-to-end test verifies that a request submitted through the browser reaches the backend and, where supported, stores the expected data in PostgreSQL.

### 6.1 Frontend Verification

Open the deployed frontend through the configured Codespaces-forwarded endpoint and confirm that the page and its static assets load.

![MarketPlace frontend running in the browser]<img width="905" height="808" alt="image" src="https://github.com/user-attachments/assets/b427c224-2374-4266-b306-67ba860c1008" />

### 6.2 Browser-to-API Verification

Submit a valid test record using the application's interface. Inspect the resulting request in the browser Developer Tools under **Network**.

**📸 INSERT SCREENSHOT 7 HERE — Browser API request**

![Browser API request and response](docs/screenshots/06-browser-api-request.png)

*Screenshot requirements:* Show the actual request URL or path, HTTP method, response status, and relevant response data. Remove cookies, tokens, and sensitive values before capturing the screenshot.

### 6.3 Database Write Verification

Query PostgreSQL and confirm that the record submitted through the browser exists with the expected value or identifier.

**📸 INSERT SCREENSHOT 8 HERE — Database record verification**

![Database write verification](docs/screenshots/08-database-write-verified.png)

*Screenshot requirements:* Show the query and its result, using a harmless test record. Where possible, use a unique test value that can be matched to the browser submission.

Only mark the end-to-end test as passed after you have verified the browser submission, successful API operation, and matching PostgreSQL record. If the test is not complete, leave the screenshot out until you have genuine evidence.

## 7. Troubleshooting and Root-Cause Analysis

The project includes troubleshooting involving the self-hosted runner, runtime environment configuration, Docker networking, and PostgreSQL authentication.

Each case should document the original symptom, diagnostic steps, confirmed root cause, corrective action, and successful retest.

The full incident records are maintained in [`docs/troubleshooting.md`](docs/troubleshooting.md).

**📸 INSERT TROUBLESHOOTING SCREENSHOTS IN `docs/troubleshooting.md`, NOT ALL HERE.**

For each real issue, place the original error screenshot immediately after the **Observed error** subsection, and place the successful retest screenshot immediately after the **Verification after fix** subsection. Use the following naming scheme:

- `07-runner-configuration-error.png`
- `09-runtime-environment-error.png`
- `10-docker-network-error.png`
- `11-docker-network-success.png`
- `12-database-authentication-error.png`
- `13-database-authentication-success.png`

Only include files for errors you actually encountered and fixes you actually verified.

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

### Problem 1: 
After the implementing the CI/CD pipeline, the frontend code could be successfully loadeded to the browser. But when a user clicked tries to query restaurants a server side error was generated as shown below.
<img width="1909" height="508" alt="image" src="https://github.com/user-attachments/assets/cca52c67-3434-4b7e-84ce-efd3b1f8cb2d" />

#### Root cause Analysis:
- Verified the communication between the database,frontend and backend containers.
  <img width="1220" height="141" alt="image" src="https://github.com/user-attachments/assets/8b6a3a3d-8998-45f8-9eca-738bf66f41ea" />
- Verified whether all containers are connected to the same bridge.
  <img width="1079" height="398" alt="image" src="https://github.com/user-attachments/assets/29988b19-35d8-4ada-a526-8e02c0cad999" />
- Checked whether the docker DNS can successfully resolve container names.
  <img width="1040" height="110" alt="image" src="https://github.com/user-attachments/assets/faed505b-29bc-40b3-8df0-9c0acc293253" />
- Checked whether containers are still connected to the default bridge.
  <img width="1648" height="299" alt="image" src="https://github.com/user-attachments/assets/4cbfeda5-c63f-410f-91c7-a2c7253b6e38" />
- Checked the codespaces host's firewall forwarding rules and found that there was no rule that allows traffic to move in and out of docker bridge.
  <img width="974" height="251" alt="image" src="https://github.com/user-attachments/assets/f002156e-5534-42d5-8f03-b2974604359c" />

#### Root cause: 
The docker bridge is created and managed by docker on the container host. Therefore host firewall rules must allow traffic to enter or leave the bridge.
Firewall forwarding rule was not configured for the containers' bridge. As a results all packages to or from the container bridge were dropped.
#### Solution: 
Configured the forwarding rule on the container's host firewall to allow traffic to traffic to enter or leave the container bridge.
<img width="1385" height="286" alt="image" src="https://github.com/user-attachments/assets/0ed6fc82-ba77-4ebf-9096-29a007ae392b" />
Containers could communicate after the firewall rule was added.
<img width="1063" height="254" alt="image" src="https://github.com/user-attachments/assets/f1e1270b-e7db-416c-8e0e-c72de88eafb7" />

### Problem 2: 
After starting the ORM(Prisma) client in the backend comntainer and DB Schema migration performed the following error were observed.
<img width="1379" height="423" alt="image" src="https://github.com/user-attachments/assets/3bbceabe-9a46-48bf-9bf2-91518ac44e34" />
For migration to be performed the backend must have the correct db credentials.

#### Root Cause Analysis:
Checked the enviroment file and found that no password was supplied.
<img width="1640" height="166" alt="image" src="https://github.com/user-attachments/assets/a8d999d0-ff19-4e5c-aecb-71172d113586" />

#### Solution:
Added the Postgres correct password to the enviroment variable file and restarted the container. The migration was then performed successfully.
<img width="1046" height="218" alt="image" src="https://github.com/user-attachments/assets/69952279-5853-4396-b535-3a725a060536" />

### Problem 3: PostgreSQL Startup Failure Due to Disk Exhaustion
PostgreSQL failed to start because the Codespace's /workspaces filesystem had no available space. The database logs reported that PostgreSQL could not write postmaster.pid, preventing the database process from starting.
<img width="926" height="271" alt="image" src="https://github.com/user-attachments/assets/2149c51a-a855-493f-86e1-9a61feb3d195" />

#### Root cause analysis
- Checked the logs and found the following message below.
  <img width="918" height="185" alt="image" src="https://github.com/user-attachments/assets/cb373a24-9ee4-4825-a794-4e5de37b4d0e" />
- Verify the disk space usage by docker's resources.
  <img width="800" height="125" alt="image" src="https://github.com/user-attachments/assets/924fe51a-7a01-4267-a5f4-a3bdc816a856" />
  Note:However, the Docker figures alone do not explain the full 31 GB of workspace usage
- Verify the codespaces host availlable disk space and found that all disk space has been used up. 
  <img width="913" height="167" alt="image" src="https://github.com/user-attachments/assets/5652aecd-a2d4-4a34-b8ed-368450a71250" />
  Disk inspection using df -h showed the workspace filesystem at 100% usage, with approximately 31 GB used out of 32 GB.
- Investigated the disk space consumption
  <img width="543" height="58" alt="image" src="https://github.com/user-attachments/assets/05a8b618-eb7c-4127-b13f-49f5a5202b65" />
  <img width="1203" height="279" alt="image" src="https://github.com/user-attachments/assets/18d12b99-cb0b-4875-99d5-ff712b7bcd39" />
  Compared filesystem utilization and workspace directory sizes to identify where storage was being consumed.
#### Root cause
- The failure was due to insufficient disk space.The Codespace workspace filesystem ran out of available disk space, preventing PostgreSQL from creating its required lock file.
#### Solution
1. Performed disk-space cleanup

- Removed stopped Docker containers using docker container prune -f.

- Removed dangling Docker images using docker image prune -f.

- Cleared the relevant cache to reclaim additional disk space:
  a. npm cache clean --force to clear the npm cache and
  b. docker builder prune -a -f to clear unused docker build cache.
  c. system prune -af to forcefully removed unused docker resources to free space
2. The container was then successfully restarted. 

### Issues investigated

| Issue | Investigation focus | Verification evidence |
|---|---|---|
| Docker network connectivity | Container status, service-name resolution, network reachability, and host firewall rules. | A successful connectivity check or database operation after the fix. |
| PostgreSQL authentication | Whether the connection reaches PostgreSQL and whether the runtime credentials are valid. | A successful authenticated connection or query after correcting the configuration. |

## 8. Security Considerations

The project follows these security principles:

- Do not commit `.env` files containing credentials.
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
