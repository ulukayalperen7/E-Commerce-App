# ADVANCED APPLICATION DEVELOPMENT COURSE PROJECT
## E-Commerce Application

**Akdeniz University**
**Department of Computer Engineering**
**2024-2025 Spring Semester**

**Submitted by:**
*   Alperen Ulukaya (20220808006)
*   Serhat Buğra Tana (20220808001)

**GitHub:**
* https://github.com/ulukayalperen7/E-Commerce-App

---

## 1. Introduction

The primary objective of this project, undertaken as part of the Advanced Application Development course, was to design and develop a functional e-commerce web application. The scope encompassed core functionalities including user registration and login, product browsing with category navigation, comprehensive shopping cart management, and an order processing system integrated with online payment capabilities.

Key technologies utilized in this project are:
*   **Frontend:** Angular (Version **[19.2.4]**)
*   **Backend:** Spring Boot (Version **[3.4.5]**) utilizing Spring Security for authentication/authorization and Spring Data JPA for data persistence.
*   **Database:** **[MySQL]**
*   **Payment Gateway:** Stripe API for secure online payment processing.

## 2. System Architecture

The application employs a two-tier architecture, consisting of a distinct Frontend (Angular) client and a Backend (Spring Boot) server.

### 2.1. Frontend Architecture (Angular)

The Angular application is architected modularly to ensure separation of concerns and maintainability.

*   **Core Module:** This module centralizes essential singleton services (e.g., `AuthService`, `CartService`, `ProductService`), route guards (`AuthGuard`), HTTP interceptors (`AuthInterceptor`), and core data models. It is imported once by the root `AppModule`.
*   **Shared Module:** Contains reusable UI components (e.g., Navbar, Footer), pipes, and directives that are utilized across various feature modules. This promotes code reusability and consistency.
*   **Feature Modules:**
    *   **Visitor Module:** Caters to unauthenticated users, providing access to public product listings, detailed product views, category-based product filtering, user login, and registration pages. This module is typically lazy-loaded for performance optimization.
    *   **Customer Module:** Offers functionalities exclusive to authenticated users. This includes managing the shopping cart, viewing and updating user profiles, accessing order history, managing favorite products, and proceeding through the secure checkout process. This module is also lazy-loaded.
    

**Diagram:**
[**https://www.mermaidchart.com/raw/d5b23e50-5818-4c2e-99be-443537bd4b58?theme=light&version=v0.1&format=svg**]
*(Caption: High-level overview of the Angular application modules and their primary responsibilities.)*

### 2.2. Backend Architecture (Spring Boot)

The Spring Boot backend application follows a layered architectural pattern to ensure a clear separation of responsibilities and facilitate scalability.

*   **Controller Layer (`com.ecommerce.backend.controller`):** Exposes RESTful API endpoints. It is responsible for receiving HTTP requests from the frontend, validating input (often via DTOs), delegating business logic processing to the Service Layer, and formatting HTTP responses (typically DTOs).
*   **Service Layer (`com.ecommerce.backend.service`):** Encapsulates the core business logic of the application. Services orchestrate operations, interact with repositories for data access and persistence, perform data transformations between DTOs and Entities, and manage transactional integrity.
*   **Repository Layer (`com.ecommerce.backend.repository`):** Manages data access and persistence using Spring Data JPA. Repositories provide an abstraction over the database, enabling CRUD operations and custom queries on entities.
*   **Entity Layer (`com.ecommerce.backend.entity`):** Defines the JPA entities that model the application's domain and correspond to database tables (e.g., User, Product, Order).
*   **DTO Layer (`com.ecommerce.backend.dto`):** Consists of Data Transfer Objects used to carry data between layers, particularly between the Controller layer and the client, for API request payloads and response bodies. This helps in decoupling the API structure from the internal entity structure.
*   **Configuration & Security (`com.ecommerce.backend.config`, `com.ecommerce.backend.filter`):** This includes `SecurityConfig` for setting up JWT-based authentication and authorization mechanisms, `JwtAuthFilter` for intercepting requests and validating JWTs, `AppConfig` for application-wide beans (like ModelMapper, Slugify), and `MvcConfig` for resource handlers.

**Diagram:**
[**https://www.mermaidchart.com/raw/d3e41f6f-b088-4f0b-8161-3194236a2654?theme=light&version=v0.1&format=svg**]
*(Caption: Layered architecture of the Spring Boot backend application.)*

## 3. Key User Flows

### 3.1. User Authentication Flow

Users can register for a new account or log in with existing credentials. Upon successful authentication, the backend generates a JSON Web Token (JWT). This JWT is sent to the Angular frontend, where it is stored securely (e.g., in localStorage). For subsequent requests requiring authentication, the Angular application's `AuthInterceptor` attaches this JWT as a Bearer token in the Authorization header, allowing the backend's `JwtAuthFilter` and Spring Security
mechanism to verify the user's identity and authorize access to protected resources.

### 3.2. Shopping Cart & Checkout Flow

This flow outlines the process from adding items to the cart to completing a payment:

1.  **Cart Management:** Authenticated users can add products to their shopping cart, update quantities, or remove items.
2.  **Proceed to Checkout:** From the cart page, the user initiates the checkout process, and cart data is passed to the checkout page.
3.  **Address Selection (Checkout Page):** The user selects an existing shipping address or adds a new one directly on the checkout page.
4.  **Order Creation (Backend):** Upon address confirmation and proceeding to payment, an API call is made to the backend to create an order with a "pending_payment" status. The backend returns the newly created `orderId`.
5.  **Payment Intent Creation (Backend & Stripe):** The backend uses the `orderId` to request a `PaymentIntent` from the Stripe API. Stripe returns a `clientSecret` associated with this PaymentIntent. This `clientSecret` is then passed back to the frontend.
6.  **Stripe Card Element (Frontend):** The Angular frontend uses the received `clientSecret` and Stripe.js library to securely render the Stripe Card Element (a PCI-compliant form for card details input).
7.  **Payment Confirmation (Frontend & Stripe):** The user enters their card details into the Stripe Card Element and submits the payment. The frontend calls `stripe.confirmCardPayment()` using the `clientSecret` and card details. This information is sent directly to Stripe's servers.
8.  **Payment Result (Frontend):** Stripe processes the payment and returns a result (success or failure) to the frontend.
9.  **Webhook Notification (Stripe to Backend):** Asynchronously, Stripe sends a webhook event (e.g., `payment_intent.succeeded` or `payment_intent.payment_failed`) to a preconfigured endpoint on the backend.
10. **Backend Processing of Webhook:** The backend webhook handler verifies the event's authenticity and processes it. For a `payment_intent.succeeded` event, the backend:
    *   Updates the corresponding order's status in the database (e.g., to "processing").
    *   Adjusts product stock levels.
    *   Clears the user's shopping cart.
11. **User Redirection:** The frontend, upon receiving a successful payment confirmation from `stripe.confirmCardPayment`, redirects the user to their order history page.

**Diagram:**
[**https://www.mermaidchart.com/raw/aa8a3cc2-571f-42be-8cf9-fbde2ea9b886?theme=light&version=v0.1&format=svg**]
*(Caption: Sequence of interactions during the payment and order completion process.)*

## 4. Conclusion

This project successfully implements a foundational e-commerce application featuring user authentication, product catalog browsing, shopping cart functionality, user profile management with address handling, and a secure online payment system leveraging Stripe. The modular architecture of both the Angular frontend and Spring Boot backend provides a solid base for future enhancements and scalability. Key aspects such as secure payment integration and state management were addressed, resulting in a functional application that demonstrates core e-commerce workflows.
