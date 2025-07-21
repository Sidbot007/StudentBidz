# StudentBidz - Online Bidding Platform

StudentBidz is a full-stack web application designed for students to buy and sell used goods through an exciting real-time bidding system.

## Features

- **User Authentication:** Secure user registration and login using JWT.
- **Product Management:** Users can list products for sale with images, descriptions, and starting prices.
- **Real-time Bidding:** Place bids on products in real-time with live updates via WebSockets.
- **Automatic Winner Declaration:** The system automatically declares the highest bidder as the winner when an auction ends.
- **Real-time Notifications:** Get instant notifications for being outbid, winning an auction, or when an auction you're interested in is ending.
- **Seller Dashboard:** Sellers can view their listed products, see bids, and manage their items.
- **User Dashboard:** Buyers can track the auctions they are bidding on and view the items they have won.

## Tech Stack

### Backend (`site/`)
- **Java 17**
- **Spring Boot 3** (Data JPA, Security, Web, WebSocket)
- **PostgreSQL**
- **Maven**
- **Lombok**
- **JWT** for authentication

### Frontend (`client/`)
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **TanStack React Query** for state management and data fetching
- **Axios** for HTTP requests
- **Socket.IO Client** & **StompJS** for WebSocket communication
- **Zod** for schema validation

## Prerequisites

- **Java 17** or higher
- **Node.js v18** or higher
- **PostgreSQL** database running

## Setup and Installation

### 1. Backend Server

1.  **Navigate to the server directory:**
    ```bash
    cd site
    ```

2.  **Configure the database:**
    - Open `src/main/resources/application.properties`.
    - Update the `spring.datasource.url`, `spring.datasource.username`, and `spring.datasource.password` properties to match your PostgreSQL setup.

3.  **Build and run the application:**
    ```bash
    ./mvnw spring-boot:run
    ```
    The server will start on `http://localhost:8080`.

### 2. Frontend Client

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## How to Use

- Open your browser and navigate to `http://localhost:5173`.
- Register for a new account or log in.
- Browse the marketplace, list items for sale, and start bidding! 