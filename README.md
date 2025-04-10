# Student CRUD REST API

A simple REST API for managing student records built with Node.js, Express, and TypeScript.

## Features

- Create, read, update, and delete student records
- API versioning
- Health check endpoint
- Proper error handling
- Logging
- Unit tests
- Database migrations
- Environment variable configuration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone https://github.com/alibaba0010/sre-bootcamp.git
cd student-crud-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/student_db
LOG_LEVEL=info
```

4. Create the database:

```bash
createdb student_db
```

5. Run database migrations:

```bash
npm run migrate
```

## Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

## Running Tests

```bash
npm test
```

## API Endpoints

### Health Check

- `GET /api/v1/health`
  - Returns the health status of the API

### Students

- `POST /api/v1/students`

  - Create a new student
  - Request body:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25
    }
    ```

- `GET /api/v1/students`

  - Get all students

- `GET /api/v1/students/:id`

  - Get a specific student by ID

- `PUT /api/v1/students/:id`

  - Update a student
  - Request body:
    ```json
    {
      "name": "Updated Name",
      "email": "updated@example.com",
      "age": 26
    }
    ```

- `DELETE /api/v1/students/:id`
  - Delete a student

## Error Responses

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

Error responses include a JSON object with an error message:

```json
{
  "error": "Error message"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
