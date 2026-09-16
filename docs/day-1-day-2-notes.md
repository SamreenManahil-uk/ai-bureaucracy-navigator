# AI Bureaucracy Navigator & Action Agent

# Day 1 & Day 2 Development Notes

## Project Identity

This project is a professional portfolio application built around:

- MERN Stack
- TypeScript
- REST APIs
- GraphQL
- RAG
- AI Agents
- Authentication
- Document Processing
- Local Embeddings
- MongoDB
- Ollama

The goal is to convert complicated process documents into understandable information and actionable workflows.

The application is a portfolio prototype and does not pretend to be an official government, immigration, legal, financial, or university advisory service.

---

# DAY 1 — MERN FOUNDATION

## Day 1 Goal

The goal of Day 1 was to create a complete MERN foundation where:

- React communicates with Express
- Express communicates with MongoDB
- MongoDB stores real application data
- REST APIs work
- frontend displays real backend/database information

## Technologies Used

- React
- TypeScript
- Vite
- Node.js
- Express.js
- MongoDB
- Mongoose
- REST APIs
- Git
- GitHub

## Project Structure

Main repository:

`ai-bureaucracy-navigator`

Main folders:

- `frontend`
- `backend`
- `docs`

## Frontend

The frontend was created using React, TypeScript, and Vite.

React is responsible for the user interface.

TypeScript provides static typing and helps catch errors during development.

Vite provides the frontend development server and build tooling.

## Backend

The backend uses Node.js, Express.js, and TypeScript.

Node.js is the runtime.

Express.js is the backend framework used to create routes, APIs, middleware, and HTTP request handling.

## Health API

Implemented:

`GET /api/health`

Purpose:

- verify backend is running
- test frontend/backend connection
- provide a basic service health check

## MongoDB

MongoDB Community Server was installed locally.

Database:

`ai-bureaucracy-navigator`

Connection:

`mongodb://127.0.0.1:27017/ai-bureaucracy-navigator`

Mongoose is used as the ODM between Node.js and MongoDB.

## Document Model

A MongoDB Document model was created.

Initial fields included:

- filename
- status
- timestamps

Later the model was expanded for document processing.

## REST Document API

Document creation and retrieval were tested successfully.

MongoDB read/write operations were verified using:

- REST API requests
- `mongosh`

## Backend Architecture

The backend follows:

- routes
- controllers
- services
- models
- middleware

### Routes

Routes define API URLs.

### Controllers

Controllers handle HTTP requests and responses.

### Services

Services contain business logic.

### Models

Models define MongoDB schemas.

## Frontend API Service Layer

Frontend API calls were moved into reusable service functions.

This prevents API logic from being mixed directly into UI components.

## Professional Frontend

The basic frontend was upgraded to a professional SaaS-style dashboard.

Implemented:

- sidebar navigation
- dashboard
- hero section
- document cards
- backend status
- statistics
- responsive layout
- glass-style panels
- professional spacing and typography

## Themes

Three themes were implemented:

### Light
Clean professional light theme.

### Dark
Dark navy/charcoal theme.

### Aurora
Purple/blue premium theme.

Theme selection is stored in `localStorage`.

## Day 1 Interview Questions

### What is MERN?

MERN stands for MongoDB, Express.js, React, and Node.js.

### What is MongoDB?

MongoDB is a NoSQL document database.

### What is Mongoose?

Mongoose is an ODM that helps Node.js applications communicate with MongoDB using schemas and models.

### Node.js vs Express.js

Node.js is the runtime.

Express.js is the backend web framework that runs on Node.js.

### Why separate routes, controllers, and services?

It keeps code modular, maintainable, and easier to test.

## Day 1 Interview Explanation

I built the MERN foundation of the AI Bureaucracy Navigator using React and TypeScript for the frontend and Node.js with Express for the backend. I connected the backend to MongoDB using Mongoose, created REST APIs, and verified real database read and write operations. I also structured the backend using routes, controllers, services, and models, and created a professional SaaS-style frontend with Light, Dark, and Aurora themes.

---

# DAY 2 — AUTHENTICATION, DOCUMENT PROCESSING & RAG

## Day 2 Goal

Day 2 focused on:

- authentication
- JWT
- password security
- PDF uploads
- text extraction
- chunking
- embeddings
- semantic search
- RAG
- hallucination handling

## Authentication

Authentication was implemented using:

- JWT
- bcryptjs
- Zod
- MongoDB

Authentication answers:

"Who is the user?"

## User Model

User fields include:

- name
- email
- passwordHash
- role
- timestamps

Roles:

- USER
- ADMIN

Plain-text passwords are never stored.

## Password Hashing

bcryptjs is used to hash passwords.

During login, bcrypt compares the entered password with the stored password hash.

## Validation

Zod validates registration and login data.

Validation includes:

- name
- email
- password

Emails are normalized before storage.

## Authentication Endpoints

Implemented:

`POST /api/auth/register`

`POST /api/auth/login`

`GET /api/auth/me`

## JWT

JWT stands for JSON Web Token.

The JWT contains:

- userId
- role

Protected requests use:

`Authorization: Bearer <token>`

## Authentication Middleware

The `requireAuth` middleware:

- reads the Bearer token
- verifies JWT
- rejects missing tokens
- rejects invalid tokens
- rejects expired tokens
- attaches authentication information to the request

## Authentication Testing

`GET /api/auth/me` was tested:

With a valid token:
- authenticated user profile was returned

Without a token:
- `Authentication required` was returned

## PDF Upload

Real PDF uploads were implemented using Multer.

Multer handles:

`multipart/form-data`

Current upload security includes:

- PDF MIME type validation
- file-size limit
- memory storage

## PDF Text Extraction

PDF text extraction is handled using `unpdf`.

The sample PDF was successfully processed.

Successful response included:

- filename
- status
- pageCount
- fileSize
- textPreview

## Document Metadata

The Document model now stores:

- filename
- originalName
- mimeType
- fileSize
- pageCount
- extractedText
- status
- timestamps

## Processing Status

Supported statuses:

- uploaded
- processing
- processed
- failed

## Chunking

Extracted text is split into smaller chunks.

Current configuration:

- chunk size: approximately 800 characters
- overlap: approximately 150 characters

Overlap helps preserve context between neighboring chunks.

## DocumentChunk Model

Each chunk stores:

- documentId
- chunkIndex
- text
- startChar
- endChar
- embedding
- timestamps

## Why Chunking Is Needed

Chunking makes retrieval more efficient because the system can search smaller relevant pieces rather than sending an entire document to the LLM.

## Embeddings

Embeddings convert text into numerical vectors representing semantic meaning.

The original OpenAI embedding implementation could not be used because the API account had no available credits.

The project therefore moved to a local embedding solution.

## Ollama

Ollama is used to run local AI models.

This avoids external API dependency during development.

## Embedding Model

Model:

`nomic-embed-text`

Each stored embedding contains:

768 dimensions.

This was verified directly in MongoDB.

## Semantic Search

User questions are also converted into embeddings.

The question embedding is compared with stored chunk embeddings.

## Cosine Similarity

Cosine similarity is used to calculate semantic similarity between vectors.

Higher similarity scores indicate more relevant chunks.

## Retrieval Endpoint

Implemented:

`POST /api/rag/search`

Purpose:

- embed user question
- compare against document chunks
- rank chunks
- return most relevant results

## Semantic Retrieval Test

Question:

`What documents do I need before applying?`

Relevant chunks containing the following information were retrieved:

- passport or identity document
- academic transcript
- degree certificate
- CV
- English-language evidence

## Local LLM

A local Ollama model is used for answer generation.

Model:

`llama3.2:3b`

## RAG

RAG stands for Retrieval-Augmented Generation.

The system retrieves relevant document context before asking the LLM to generate an answer.

This helps reduce hallucination and keeps answers grounded in uploaded documents.

## RAG Answer Endpoint

Implemented:

`POST /api/rag/answer`

This endpoint:

- receives the question
- creates a question embedding
- retrieves relevant chunks
- builds document context
- sends the context to the local LLM
- returns a grounded answer
- returns source chunk metadata

## Source Metadata

RAG responses include:

- documentId
- chunkIndex
- similarity score

## Hallucination Handling

If information is not supported by the retrieved context, the system responds:

`I could not find enough information in the uploaded documents to answer that reliably.`

## Hallucination Test

Question:

`What is the application fee?`

The sample document did not provide an application fee.

The system correctly refused to invent an amount.

## Day 2 Interview Questions

### What is JWT?

JWT is a signed token used to identify authenticated users between requests.

### Authentication vs Authorization

Authentication asks who the user is.

Authorization asks what the user is allowed to do.

### Why hash passwords?

Passwords should never be stored as plain text. Hashing protects stored credentials.

### What is chunking?

Chunking divides large documents into smaller searchable sections.

### What are embeddings?

Embeddings are numerical vector representations of semantic meaning.

### What is semantic search?

Semantic search finds information based on meaning rather than exact keyword matching.

### What is cosine similarity?

Cosine similarity measures similarity between embedding vectors.

### What is RAG?

RAG retrieves relevant information before an LLM generates an answer.

### Why use RAG?

RAG reduces hallucination by grounding responses in retrieved source information.

### Why use Ollama?

Ollama allows local models to run without depending on a paid external AI API.

## Day 2 Interview Explanation

I implemented JWT authentication with bcrypt password hashing and Zod validation. I then created real PDF upload and text extraction using Multer and unpdf. Extracted text is divided into overlapping chunks and stored in MongoDB. Each chunk is converted into a 768-dimensional embedding locally using Ollama and nomic-embed-text. User questions are embedded using the same model, and cosine similarity retrieves the most relevant chunks. I then implemented a local RAG pipeline using llama3.2:3b to generate grounded answers from retrieved context, including fallback behavior when the source documents do not contain enough information.

---

# PROJECT STATUS AFTER DAY 2

Completed:

- MERN foundation
- React
- TypeScript
- Node.js
- Express
- MongoDB
- Mongoose
- REST APIs
- professional backend structure
- frontend API service layer
- professional dashboard
- Light theme
- Dark theme
- Aurora theme
- JWT authentication
- password hashing
- Zod validation
- protected routes
- PDF upload
- PDF validation
- PDF extraction
- document metadata
- processing states
- chunking
- document chunk storage
- Ollama
- nomic-embed-text
- 768-dimensional embeddings
- semantic search
- cosine similarity
- local LLM
- RAG answer generation
- source metadata
- hallucination fallback

Remaining:

- GraphQL
- structured workflow generation
- AI Agent
- tool/function calling
- full RBAC enforcement
- workflow management
- complete frontend pages
- automated tests
- Docker
- Docker Compose
- GitHub Actions
- RAG evaluation
- final README
- final interview documentation
