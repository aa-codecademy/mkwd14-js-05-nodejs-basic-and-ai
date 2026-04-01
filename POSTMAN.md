# 🧪 Postman — API Testing Tool

We use **Postman** to test and explore APIs during classes.

## Installation

1. Go to [postman.com/downloads](https://www.postman.com/downloads/)
2. Download the version for your OS (Windows / macOS / Linux)
3. Install and open the app
4. Create a free account or skip sign-in (sign-in is optional for basic use)

## Basic concepts

| Term              | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| **Request**       | An HTTP call you send to an API (GET, POST, PUT, DELETE, etc.)    |
| **Collection**    | A group of saved requests organized together                      |
| **Environment**   | A set of variables (e.g. `baseUrl`) you can reuse across requests |
| **Params / Body** | Data you send with a request — query params, JSON body, form data |
| **Response**      | What the server sends back — status code, headers, body           |

## Quick start

1. Open Postman
2. Click **New → HTTP Request**
3. Choose a method (e.g. `GET`) and enter a URL (e.g. `https://jsonplaceholder.typicode.com/posts`)
4. Click **Send**
5. Inspect the response in the panel below

## Class collection

The class Postman collection is available in the project root as a JSON file:

- `mkwd14_nodejs_api_collection.postman_collection.json`

### How to import it in Postman

1. Open Postman.
2. Click **Import** (top-left).
3. Choose **Upload Files**.
4. Select `mkwd14_nodejs_api_collection.postman_collection.json` from the root folder of this repository.
5. Click **Import**.
6. Open the imported collection from the left sidebar and start sending requests.
