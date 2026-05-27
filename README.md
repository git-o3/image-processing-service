# Image Processing Service
A Cloudinary-like backend API for uploading and transforming images asynchronously.
Built as a Modular Monolith with a decoupled background worker.


## Features
- JWT authentication
- Image upload with strict file type validation
- Async image transformation pipeline via RabbitMQ
- Sharp-powered processing (resize, crop, rotate, format, filters)
- Derivative storage with MongoDB status tracking
- Modular architecture with strict public API boundaries
- Broker abstraction layer — message queue is swappable
- Docker Compose orchestration with shared volumes

## Architecture

Client
↓
api-server        (Express, MongoDB, RabbitMQ producer)
↓ publishes job
RabbitMQ
↓ consumes job
background-worker (Sharp processing, RabbitMQ consumer)
↓ publishes status
api-server        (status consumer → MongoDB update)

## Tech Stack
- Node.js / Express
- MongoDB (Replica Set for transactions)
- RabbitMQ
- Sharp
- Docker / Docker Compose

## Getting Started

Clone the repository:
```bash
git clone https://github.com/git-o3/image-processing-service
cd image-processing-service
```

Create `.env` from example:
```bash
cp .env.example .env
```

Start all services:
```bash
docker-compose up --build
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register user |
| POST | /api/v1/auth/login | Login and get JWT |

### Images
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/images/upload | Upload image |
| GET | /api/v1/images/:id/status | Get processing status |
| POST | /api/v1/images/:id/transform | Transform image |
| DELETE | /api/v1/images/:id | Delete image |

## Transform Payload
```json
{
  "transformations": {
    "resize": { "width": 600, "height": 400 },
    "rotate": 90,
    "format": "webp",
    "filters": {
      "grayscale": true,
      "blur": false
    }
  }
}
```

## Environment Variables
See `.env.example` for required variables.

[Project Reference](https://roadmap.sh/projects/image-processing-service)