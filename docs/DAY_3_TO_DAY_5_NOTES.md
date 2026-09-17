# AI Bureaucracy Navigator & Action Agent
## Development Notes — Day 3, Day 4 and Day 5

These notes document the major features, architecture decisions, backend functionality, frontend functionality, security controls, AI capabilities and deployment work completed during Days 3–5 of the AI Bureaucracy Navigator project.

---

# DAY 3 — Workflows, GraphQL, AI Agents and RBAC

## 1. AI Workflow Generation

Day 3 introduced AI-generated workflows based on uploaded and processed documents.

A Workflow model was created in MongoDB.

Each workflow contains:

- ownerId
- documentId
- title
- summary
- workflow status
- ordered workflow steps
- individual step status
- source chunk references

Supported workflow statuses include:

- draft
- active
- completed

Individual workflow steps support:

- pending
- in_progress
- completed

The workflow generation service uses processed document chunks as context and sends the relevant content to the local Ollama language model.

The LLM is instructed to return structured JSON.

The backend validates the generated output before storing it in MongoDB.

This means workflow generation is not simply displaying generated text. The AI output becomes structured application data that can later be queried and updated.

---

## 2. Workflow REST API

REST endpoints were added for workflow operations.

Important endpoints include:

- GET /api/workflows
- POST /api/workflows/generate

The generation endpoint accepts a processed document and generates a structured workflow from its content.

Ownership checks ensure users can generate workflows only from documents belonging to their own account.

---

## 3. GraphQL Integration

Apollo Server and GraphQL were integrated into the Express backend.

GraphQL endpoint:

- /graphql

GraphQL is primarily used for query-heavy workflow operations.

Implemented GraphQL queries include:

- myWorkflows
- workflow(id)

A GraphQL mutation was also implemented:

- updateWorkflowStepStatus

This mutation allows workflow step state to be updated without replacing the entire workflow.

GraphQL authentication uses the JWT token received from the frontend.

The GraphQL context extracts the authenticated user's identity so workflow queries remain user-specific.

---

## 4. Workflow Step Management

Workflow steps can be updated from:

- pending
- in_progress
- completed

Updates are stored directly in MongoDB.

This gives the application genuine workflow state rather than frontend-only visual status.

Workflow progress can therefore be calculated from persistent data.

---

## 5. AI Agent

An AI Agent layer was introduced.

The agent uses the local:

- qwen3:4b model

The agent is different from the RAG assistant.

RAG answers questions using document context.

The Agent can understand requests and interact with application functionality.

Implemented agent tools include:

- get_my_workflows
- update_workflow_step

This means the AI Agent can perform controlled application actions rather than only producing conversational text.

Example request:

"Show me my workflows."

The agent can call the workflow retrieval tool.

Example action request:

"Mark step 2 as completed."

The agent can call the workflow step update tool.

---

## 6. Agent Tool Calling

The Agent uses controlled tool calling.

The general flow is:

User request
→ AI Agent analyses intent
→ Agent selects an allowed tool
→ Backend executes the tool
→ Tool result returns to the Agent
→ Agent responds to the user

The agent loop supports multiple reasoning/tool rounds so it can process the result of one tool call before producing the final response.

The loop is limited to prevent unlimited tool execution.

---

## 7. Agent Security

Agent tools do not receive unrestricted database access.

Every workflow operation checks:

- authenticated user
- ownerId
- workflow ownership

This prevents one user from asking the AI Agent to access or modify another user's workflow.

---

## 8. Role-Based Access Control

RBAC was introduced.

Current roles:

- USER
- ADMIN

A requireAdmin middleware was implemented.

Normal users cannot access administrator endpoints.

Example protected endpoint:

- GET /api/admin/stats

A normal USER receives an access-denied response.

An ADMIN account can access the endpoint.

---

## 9. Admin Statistics

The Admin API provides application statistics including information such as:

- total users
- documents
- workflows

The endpoint is protected with both authentication and admin-role verification.

---

## 10. Document Ownership

Document records were updated to include ownerId.

Existing test records were backfilled where required.

Document queries and workflow generation now enforce document ownership.

This improved the security model of the application.

---

# DAY 4 — Professional Frontend and Application UX

## 1. Global Application Shell

A reusable protected application shell was created.

It includes:

- sidebar navigation
- top navigation
- user profile
- logout
- theme controls
- system status indicator
- responsive mobile navigation

The shell prevents individual pages from implementing their own separate application navigation.

---

## 2. Responsive Navigation

The navigation supports:

- desktop screens
- laptops
- tablets
- mobile devices
- smaller mobile screens

Desktop uses a persistent sidebar.

Mobile uses a collapsible navigation drawer.

---

## 3. Themes

The application supports three themes:

- Light
- Dark
- Aurora

Theme preference is persisted using localStorage.

This means the selected theme remains active after the page is refreshed.

---

## 4. Authentication Interface

Login and registration interfaces were improved.

The registration flow is compatible with the backend authentication model.

Registration creates the account and then authenticates the user to obtain a JWT.

Frontend password validation was aligned with backend password rules.

---

## 5. Admin Login

A dedicated administrator login experience was introduced.

Routes include:

- /login
- /register
- /admin/login

Normal user registration remains public.

Admin registration is intentionally not public because allowing users to self-register as administrators would bypass RBAC security.

Admin access requires an authorised account whose role is already ADMIN.

---

## 6. Dashboard

The dashboard was redesigned as a real analytics page rather than a static mock interface.

It retrieves real application data.

Dashboard information includes:

- documents
- workflows
- workflow status distribution
- workflow completion information
- recent documents
- recent workflows

Charts were implemented using Recharts.

Chart types include:

- pie chart
- bar chart

The dashboard is connected to real backend and GraphQL data.

---

## 7. Documents Page

The Documents page was redesigned into a professional document workspace.

Implemented functionality includes:

- real document retrieval
- PDF upload
- search
- status filtering
- sorting
- pagination
- card view
- table view
- workflow generation
- processed/failed status indicators

Only processed documents can generate workflows.

---

## 8. Document Details

A Document Details interface was introduced.

It displays information such as:

- document name
- status
- file size
- page count
- upload date
- document metadata

Workflow generation can also be initiated from document-related UI.

---

## 9. AI Assistant Interface

The AI Assistant supports two different operating modes:

### RAG Mode

RAG mode answers questions using uploaded document content.

It provides grounded responses based on retrieved document chunks.

Source information can be displayed to show where the answer came from.

### Agent Mode

Agent mode interacts with application functionality.

It can retrieve workflows and perform controlled workflow operations.

The UI clearly separates RAG mode from Agent mode so users understand the difference between document questions and application actions.

---

## 10. AI Assistant UX

The assistant includes:

- user messages
- assistant messages
- RAG/Agent mode selection
- suggestion prompts
- typing/loading state
- source chips
- error handling

The interface was designed to resemble a modern AI SaaS product.

---

## 11. Workflows Page

The Workflows page connects directly to GraphQL.

Functionality includes:

- fetching workflows
- search
- filtering
- workflow selection
- workflow timeline
- completion statistics
- step status updates
- source chunk references

Workflow step changes are written back to the backend through GraphQL mutations.

---

## 12. Workflow Analytics

The workflow page includes visual analytics showing workflow progress.

The UI calculates progress from actual workflow step status rather than static values.

---

## 13. Admin Page

A dedicated Admin page was implemented.

Admin navigation is visible only to users with the ADMIN role.

The page retrieves real backend statistics.

Normal users are redirected or blocked from accessing administrator functionality.

---

## 14. Toast Notifications

Global toast notifications were added using react-hot-toast.

Notifications are used for events including:

- successful uploads
- failed requests
- workflow generation
- authentication events
- workflow updates
- document deletion
- agent actions

---

## 15. Loading States

Reusable loading and skeleton states were introduced.

This improves perceived performance while API requests are running.

---

## 16. 404 Page

A dedicated Not Found page was implemented for invalid application routes.

---

## 17. Lazy Loading

Frontend routes were converted to React lazy-loaded routes.

This reduces the amount of JavaScript required during the initial page load.

---

## 18. Accessibility and Responsive Design

Frontend work included:

- keyboard-friendly controls
- accessible form labels
- responsive layouts
- mobile-friendly navigation
- reduced-motion considerations
- clear loading and disabled states

The frontend was tested across multiple responsive breakpoints.

---

# DAY 5 — History, Document Management, Agent Safety, Testing and Deployment

## 1. Activity / History Model

A MongoDB Activity model was introduced.

Activity records can represent events such as:

- document_upload
- workflow_generated
- workflow_step_updated
- rag_question
- agent_action

Each record is associated with the authenticated user through ownerId.

Activity records can also contain metadata relevant to the event.

---

## 2. History API

History endpoints were created.

The main endpoint allows an authenticated user to retrieve their own activity history.

History queries are sorted so newer activities appear first.

Ownership is enforced through req.auth.userId.

---

## 3. History Page

A History page was introduced in the frontend.

The page is designed to display user activity as a searchable timeline.

History provides visibility into actions performed across the application.

Examples include:

- uploaded documents
- generated workflows
- workflow updates
- AI questions
- agent operations

---

## 4. Activity Logging

Frontend and backend functionality was prepared to record important application events.

Examples include:

- successful document upload
- workflow generation
- workflow step update
- RAG question
- Agent interaction

This provides an audit-style view of application activity.

---

## 5. Document Delete API

A real document deletion endpoint was added.

Deletion is protected by authentication and ownership checks.

A user can delete only documents belonging to their own account.

The backend validates MongoDB ObjectIds before performing deletion.

---

## 6. Cascading Document Cleanup

Deleting a document also removes related application data.

Related information includes:

- document chunks
- workflows associated with the document
- original document database record

This prevents orphaned RAG chunks and workflows from remaining in MongoDB.

---

## 7. Document Delete UX

The Documents page was extended with delete functionality.

Features include:

- Delete button
- confirmation modal
- loading state
- error handling
- success notification

The confirmation dialog clearly explains that deletion is permanent.

---

## 8. Clear Failed Documents

A Clear Failed action was added.

It identifies documents with status:

- failed

and removes them through the secure delete endpoint.

This is useful for cleaning failed test uploads without manually opening MongoDB.

---

## 9. Agent Action Confirmation

State-changing AI Agent operations were improved with a confirmation layer.

The frontend detects workflow-changing requests such as:

- mark
- complete
- update
- change
- in progress

Instead of immediately performing the operation, the user receives a confirmation card.

The user can:

- confirm the action
- cancel the action

The backend tool executes only after confirmation.

This demonstrates controlled AI Agent behaviour.

---

## 10. Agent Action Card

A dedicated AgentActionCard component was created.

It displays:

- controlled-action indicator
- description of the requested action
- confirmation button
- cancel button
- loading state
- success/error visual states

This provides a clearer human-in-the-loop AI experience.

---

## 11. Smoke Testing

An automated shell-based smoke test was created.

The smoke test checks important application functionality.

Tests include:

- backend health
- user login
- JWT generation
- authenticated profile endpoint
- documents endpoint
- GraphQL workflow query
- History API
- USER rejection from Admin API
- unauthenticated route protection

The script prints pass/fail results for each check.

---

## 12. Production Builds

Both frontend and backend production builds are tested using:

Backend:

npm run build

Frontend:

npm run build

This verifies that TypeScript and frontend compilation complete successfully before deployment.

---

## 13. Docker Backend

A multi-stage Dockerfile was introduced for the Node/Express backend.

The builder stage:

- installs dependencies
- compiles TypeScript

The production stage:

- installs production dependencies
- copies compiled JavaScript
- launches the Express server

This keeps the runtime image smaller than a development image.

---

## 14. Docker Frontend

A multi-stage Dockerfile was created for React.

The first stage:

- installs dependencies
- builds the Vite application

The production stage uses Nginx to serve the generated static frontend.

---

## 15. Nginx

Nginx is used as the production frontend server.

It supports React client-side routing by falling back to index.html.

It also contains proxy configuration for:

- REST API
- GraphQL

---

## 16. MongoDB Container

MongoDB is included as a Docker Compose service.

Persistent storage is configured through a Docker volume.

A MongoDB health check is included so dependent services can wait for the database to become available.

---

## 17. Docker Compose

Docker Compose coordinates the application services.

Services include:

- MongoDB
- Node/Express backend
- React/Nginx frontend

The backend connects to MongoDB using the Docker service hostname.

---

## 18. Ollama Integration With Docker

The AI models remain on the host machine.

Docker backend accesses the local Ollama server through:

host.docker.internal

Models used across the project include:

- nomic-embed-text
- llama3.2:3b
- qwen3:4b

This avoids unnecessarily running large AI models inside the application containers.

---

## 19. Environment Security

Sensitive values such as JWT secrets are stored through environment variables.

The real .env file is excluded from Git.

An .env.example file documents required configuration without exposing credentials.

---

## 20. GitHub Actions CI

A GitHub Actions CI workflow was introduced.

The pipeline contains jobs for:

### Backend

- checkout
- Node setup
- npm ci
- TypeScript/backend build

### Frontend

- checkout
- Node setup
- npm ci
- Vite production build

### Docker

- Docker Compose validation
- backend Docker image build
- frontend Docker image build

The pipeline runs for pushes and pull requests targeting the main branch.

---

# Current Technology Coverage

By the end of these development stages, the project demonstrates practical use of:

- React
- TypeScript
- JavaScript
- Node.js
- Express
- MongoDB
- Mongoose
- REST APIs
- GraphQL
- Apollo Server
- JWT authentication
- RBAC
- document processing
- PDF processing
- text chunking
- embeddings
- cosine similarity
- semantic retrieval
- Retrieval-Augmented Generation
- local LLMs
- Ollama
- structured AI output
- AI Agents
- controlled tool calling
- human-in-the-loop confirmation
- workflow automation
- Recharts
- responsive UI
- accessibility considerations
- Nginx
- Docker
- Docker Compose
- GitHub Actions
- CI/CD foundation
- security and ownership checks
- automated smoke testing

---

# Key Architecture Decisions

## REST and GraphQL

REST is used for operations such as:

- authentication
- document upload
- RAG
- agent communication
- admin statistics
- history
- document deletion

GraphQL is used mainly for workflow querying and workflow state management.

---

## Local AI Instead of Paid APIs

The project originally tested an external embeddings API but moved to local Ollama because of API credit limitations.

Current local AI stack:

- nomic-embed-text for embeddings
- llama3.2:3b for grounded RAG answers
- qwen3:4b for AI Agent functionality

This allows the project to operate without depending on paid AI inference for the primary local development workflow.

---

## Human-Controlled Agent Actions

The AI Agent is not given unrestricted control.

Application tools are explicitly defined.

Ownership checks are performed server-side.

State-changing operations require confirmation in the frontend.

This demonstrates a controlled and safer agent architecture.

---

# Day 3–5 Outcome

During Days 3–5, the project evolved from a basic document and RAG system into a more complete AI-powered full-stack application.

Major improvements included:

- AI-generated structured workflows
- GraphQL
- AI Agent tool calling
- workflow state management
- RBAC
- admin functionality
- advanced responsive frontend
- analytics dashboard
- document workspace
- workflow management UI
- RAG and Agent interfaces
- activity/history tracking
- secure deletion
- human confirmation for AI actions
- automated smoke testing
- Docker deployment foundation
- GitHub Actions CI/CD foundation

These features demonstrate that the project combines traditional full-stack engineering with practical Generative AI, RAG and AI Agent capabilities.
