# GEN20 v0.54

#### Gen20 v0.60 built plan to production v0.90, build primarily in debian12, action driven with high modularity (cubos) -setup consisted of: 1) mariadb-centric 2) agnostic (yaml & db plans with 5 langs) 3) action-driven ecosystem (plans=series of actions in all subsystems), 4) core php8.2 with strong class sysetm (public, admin, api, ws client), 5) kronos (fastapi) for ai gen & ai bert trained, 6) ermis (express with ws server for intercommunications, webrtc-coturn-ws streaming), 6) god (golang gin api with ws client, for fast services), 7) mars (c++ heredis & mariadb native connector, ws client without api for fast tasks)


## Installation of Gen20 in linux console (existing domain) 
Already running your domain with nginx, follow the steps:
### Step 1
Download and install git 
```sudo apt install git && git clone https://github.com/NikDrosakis/gen20.git && cd gen20``` 

### Step 2
Set .env variables for database and user access 

### Step 3
Run presetup with: 
```bash install.sh``` 

### Step 4
At the Browser enter to the url  [your_domain]/admin

## Introduction
The purpose of this system is to develop smart applications that harness the power of AI and modern web technologies to enhance mental and scientific knowledge. The goal is to utilize the vast resources available online while integrating AI capabilities to create useful, scalable applications. These tools aim to improve the way people interact with information, providing smarter, faster, and more insightful solutions.
By using a combination of PHP, Node.js, React Native, and FastAPI, along with AI resources such as Gemini and Cohere, the system bridges the gap between raw data and practical, intelligent applications. The overall vision is to empower users to unlock the potential of digital resources, elevating both individual and collective understanding.

### Overview
GEN20 is an advanced, modular system designed to facilitate the development of interactive and dynamic applications. It integrates multiple technologies, including PHP, FastAPI, Node.js, and React Native, to provide a comprehensive solution for various web and mobile needs. The system comprises several key components, each serving a specific role, and leverages AI technologies to enhance capabilities and user experience.

###The main goal
To provide a modular smart system, creating useful applications upgrading values, freedom in educational resources, upgrading mental and scientific concepts through programming, using the great sources of knowledge that exist on the internet, but also the contribution of AI

how to create and IPFS subsystem for getting and sharing knowledge 2) how Blockchain could utilize share apps like uber of airbnb
##Top until now
- The php api & to core in php8.3 (with 5 different utilizing core class methods accessing all type of data and buffers)
- JS and decoupling from main libraries)
- Layout & cubos
- Use flexibility with drag & drop in admin
- Generative AIs
- Ta kronos, ermis rising service modularity
- Go 
- The admin as it progresses
- The admin > grid with the channels is small and disfunctional
- the 270k vivalibrocom book titles saved in db in one night

## Systems
PUBLIC:vivalibro, poetabook, nikdrosakis, all integrated domains
PUBLIC_MOB:REACT NATIVE > vivalibro, all android applications
CUBO:PHP & REACT > REUSABLE modules FOR PUBLIC
CORE:PHP classes + COMPOSER
ADMIN:PHP COMMON DASHBOARD  
KRONOS:COMMON python INTEGRATOR
ERMIS:COMMON nodejs INTEGRATOR
CLI:low level, crons, backups, action_task using also maria.gpm
RUS:INTEGRATOR rust
GO:INTEGRATOR golang
VENUS:GLOBAL chat nodejs/ws app


### Key Technologies

- **PHP**: Core backend API system.
- **FastAPI**: Manages Gemini & Cohere services.
- **Node.js**: Handles notifications with WebSocket and Redis PubSub.
- **React**: Web Development
- **React Native**: Mobile app development.
- **Cubos**: UI widgets and layout components.
- **Databases: MariaDB, Redis, MongoDB, Solr, Neo4j, ElasticSearch for Data indexing and graph database.
- **PHP composer
- **Primitive: GO
- **Primitive: Rust

## Glossary
One-file: Fast way of writing code, on top <style>, <php/html code> <script> needs bundling from the very beginning. Fails all the time. Bundler sketched but still no time to create.
vlweb: Vivalibro is the first project of GEN20. Creating library through mobile app and custom classifications, uses internet open recourses.
vlmob: The vivalibro app written in Expo Go React Native. Uses also FETCH() api for connection with PHP API and connected with ermis WS notifications.
Cubos: UI Public widgets creating the Layout.
Layout: drag and drop cubos in the public website mockup  in the first page of Admin.cms
Combos: reusable components, in PUBLIC & ADMIN
API: main API, is PHP through the Core PHP system. Has a lot of different
GPY: FastAPI currently handles Gemini & Cohere as sudo services.
ermis: Nodejs subsystem that handles notifications with WebSocket (both public and ADMIN) currently through Redis PubSub. wannabe event-driven, currently all the subsystms are empowered with services & a lot of MVP detailed work.
ADMIN: The common dashboard of the system, grid styled/divided in 7 channels. Manager of all systems with and extra CMS page for all the publc needs. Utilizes in many cases Sortable for drag&drop.
GPM: Admin main subsystem for packaging and management, uses the Maria.gpm relational db to store data. Task process, task management with ermis.table, Github workflows, logging, cron jobs mostly with bash shell files and with the Core.GPM php class.
CORE: core.Gaia is the mother abstracted class. core.Maria is the more useful class, translated to GPY for APY uses, and to Golang for the baby GO, but not still implemented. Updated to PHP8.3 & to vanilla js.
Gaia.js is the only js library, else CDNs.


## Timetable/Timeschedule
Month 1: Foundations and Data Acquisition:
Great Progress: Laying the groundwork for VLMOB, VLWEB, installing databases (Solr, Neo4j), and acquiring a significant dataset are huge wins.
Month 2: Admin Panel & Modularity:
Solid Direction: Refactoring ADMIN with the GaiaCMS dashboard, introducing CUBO and async buffers, centralizing core logic, and exploring APIs and AI are excellent steps toward a more maintainable and scalable system.
Month 3: CI/CD, Docker, and Refinement:
Focus on Automation and Tooling: GPM development, dockerization, workflows, and initial kronos/ermis work are crucial for efficiency and deployment.
Experimentation (AI): Trying out 5 AI setups shows your commitment to exploring new technologies.
Rewrites and Relationship Refactoring: These efforts indicate you're actively improving and simplifying your codebase.
Key Bottleneck:
"One file style": This approach makes development faster, but the need for a bundler and a staging server introduces complexity and slows down testing and deployment.
10 Key Focus Areas for Month 4:
Stabilize API Gateway ( Address the API issues to create a reliable backend. Investigate:
Logging: Increase logging on the kronos service to get detailed insights into the requests, errors, and the state of the system.
Error Handling: Improve error handling in kronos to catch exceptions, log errors, and provide more informative error messages to clients.
Performance Monitoring: Use tools or services to monitor the performance of your API. Look for bottlenecks and optimize as needed.
Streamline Bundler:
Complete  Finalize your bundler script, focusing on:
Robust handling of PHP, CSS, JavaScript, and CDN links.
Secure HTML generation (sanitizing user input and dynamic output).
Minification or optimization for production (optional but beneficial).
Create Build Process: Set up an automated build process using a simple shell script or task runner to execute build.php efficiently.
Set Up Staging Server:
Clone of Dev: Create a staging server that mirrors your development environment as closely as possible.
Deployment: Streamline the deployment process to the staging server (manual for now, then potentially automate it with GitHub Actions).
Focus on Core Cubos:
Prioritize: Identify the most important cubos for your initial launch and focus on perfecting them.
Robustness and Testability: Ensure these core cubos have good error handling, are thoroughly tested, and are optimized for performance.
Simplify JavaScript (:
Reusability: Review and refactor your JavaScript code to improve modularity and reusability across different parts of your frontend.
Reduce Dependencies: If possible, reduce reliance on external libraries (like jQuery) to decrease your application's size and loading times.
Re-evaluate Unsuccessful AI resources:
Identify Roadblocks: Determine the reasons for the unsuccessful AI setups.
Alternative Approaches: Explore alternative APIs or solutions to achieve the AI capabilities you need.
Localization (ADMIN):
Complete Refactoring: Finish the localization rebuilding in your ADMIN system.
User Authentication and Authorization:
Secure Access: Implement authentication and authorization mechanisms for your website and API.
Choose the Right Approach: Research different authentication strategies (e.g., sessions, JWTs, OAuth) and select the best one for your needs.
Basic User Testing:
Get Feedback Early: Get feedback from potential users (friends, family, beta testers) to identify usability issues or areas for improvement.
Documentation:
Start with Systems & API Documentation: Prioritize documenting your API endpoints, as this will be essential for any third-party resources.
Timeline for Launch:
It's impossible to give an accurate timeline without more information about the remaining work and your desired feature set for the launch.
Aim for an MVP (Minimum Viable Product): Prioritize the essential features that provide core value to users, and launch with a smaller feature set rather than trying to build everything at once.


## Cubos
1. Elegant search (neo4j, solr)
2. Personalized Recommendations Cubo:
   Purpose: Suggest books to users based on their reading history, preferences, and ratings. Features: Collaborative filtering: Recommend books liked by similar users.
   Content-based filtering: Recommend books based on the genre, authors, or topics of books the user has enjoyed. Display personalized recommendations on the user's dashboard or library page.
   Αυτό μπορεί να λειτουργεί ως εξής… δείχνεις 10 διαφορετικα βιβλία και ζητάς τα Preferences για να φτιάξεις το προφιλ , Πολύ καλό και εύκολο δημιουργεί ένα user_preferences με μία λίστα writer + classification που είναι πιο κοντά
3. Reading Challenge Cubo:
   Purpose: Motivate users to read more by setting reading goals and participating in challenges. Features: Allow users to create custom challenges (e.g., read 10 books in a month).
   Provide pre-set challenges (e.g., genre-specific, classic literature).
   Track reading progress.
   Display badges or achievements for completing challenges.
4. Book Discussion Cubo:  Discussion Cubo
   Purpose: Foster a community around reading by enabling discussions about books.
   Features: Forums or comment sections for individual books.
   Book clubs or group discussions. Allow users to rate and review books.
5. Quote of the Day Cubo Book Promote
   Purpose: Inspire users with daily book quotes. Features:
   Display a random quote from a book in the user's library or a curated selection.
   Allow users to share quotes on social media.
6. Author Spotlight Cubo:
   Purpose: Highlight authors and their works. Features: Feature a different author each day or week. Display biography, bibliography, and links to the author's books in your database.
   Suggest related authors.
7. Genre Explorer Cubo:
   Purpose: Help users discover new genres and books they might enjoy. Features:
   Visually display different genres (e.g., using a word cloud or interactive map).
   Provide curated lists or recommendations for each genre. Allow users to explore subgenres.
8. Virtual Bookshelf Cubo:
   Purpose: Provide a visually appealing way for users to organize and display their library.
   Features: Drag-and-drop interface to arrange books on virtual shelves. Allow users to categorize books by genre, author, or custom tags.
9. Reading Progress Tracker Cubo:
   Purpose: Help users track their reading progress across multiple books Features:
   Allow users to mark books as "currently reading", "read", "want to read".
   Set reading goals and deadlines. Visualize reading progress (e.g., using a progress bar).
10. Book Stats and Insights Cubo:
    Purpose: Provide users with interesting statistics and insights about their reading habits.
    Features: Total books read. Average books per month. Favorite genres. Most read authors.
    Visualize data with charts or graphs.


## Gaisystem Ethics
Login is already cubos, rating is cubo ? the comment? normally yes. They have ui stand-alone function, their difference is the position and the versatility, that's why they entered the components. They are dependent entities, and there are dozens of such mechanisms. How does the system recognize them in order to develop them. Now he doesn't recognize them. smaller satellite pieces that exist through the others and give a value to the cubos. So the components cubo > compo are added to the cubos setup. So a slideshow or cubo search1 can have a rating ?.
Login/signup page + login cubo are different, signup can have different parts in main + embed cubo.
The main on the pages is their name. Add the mbefore, mafter positions to the layout.
The project admin > main with its non cms admins in main as book_admin,
What must be removed from the projects, the cubos pieces, for example the search in books, is cubo,
vl is a cube in 7 tables + 7 pages and subpages
By the way apages goes into the ui menu
Also, now that everything is entered into databases, don't forget the resources. tree -J gives all resources in json, to search the resources
Multipurpose search on all pages in a format compatible with solr & neo4j
Some cubos don't have a certain shape, they might be buttons.
Public main is written as pages to distinguish the topic. eg book_read is written as book/read book/edit publicer/edit, book_admin is written in admin in Vivalibro > book, Vivalibro > publisher if they exist.
External resources are included in cubos if they have a separate schematic UI entity that must be used in the areas of the pages, or in components if they provide an element such as google login which is a component and not a page formation cube. This is also the relationship cubos compo, i.e. the cubo is structural of a page, not main.
So the hierarchy is projects > pages (main) > cubos > compos . the project same level as the systems. The systems have their own basic db, domain (or nginx) or app with the aim of serving the projects.
The body, headers leave the class, metadata, links etc. are created
Since relationally the cubo is something from pages how the vivalibro piece is a cubo. cubo is agnostic while vivalibro public is php. The cubo doesn't care about the pages, the two-way logic from the cubos to the pages and from the pages to the cubos will confuse the schema too much and waste more time. The solution is the project which is an autonomous mechanism with main pages/domain, it is a level below GEN20 which is an upper level.
How are the cubos that come from apis organized in admin, I have them in sub pages, but in public. To avoid separating the components.
How components become global if they are public. If the admin also uses them, eg google login, how do they become public

###summary
Component Integration: Components like login/signup are distinct but can be integrated into Cubos. Maintain separation for clarity and capabilities.
Public vs. Admin: Cubos used publicly and in admin systems need clear distinction and organization.
Component Globalization: Public components used in admin should be designed for broad applicability.
Project and System Hierarchy: Projects include main pages and cubos. Systems serve projects with their own databases and domains.
API Integration: Components from APIs should be integrated into admin and public areas with clear distinctions.
Resource Management: Ensure proper organization and search capabilities for resources within the system.

# System Configuration Overview

## 1. General Setup

- **Operating System**: Debian 12
- **Programming Languages**:
    - PHP 8.3 with JIT enabled
    - Python 3.11.2 (running in a virtual environment)
    - Node.js (ermis)
    - React (Poetabook)
    - FastAPI (GPY)
    - SQL with MySQL databases
- **Web Server**: Nginx (used with FastCGI for PHP)
- **Containers**: Docker with `code-server` configured for SSL via certificates located at `/etc/letsencrypt/live/vivalibro.com`.

## 2. Projects and Workflows

- **CI/CD**: Implementing workflows for PHP (core & admin), Node.js (ermis), React (Poetabook), and FastAPI (GPY).
- **Version Control**: Git for local and remote synchronization, with custom versioning details tracked in MySQL.
- **Versioning**: Focus on tracking the number of changed/new files in the system's versioning table.
- **Cron Jobs**: Used for executing shell scripts, such as `logging.sh`, to manage automated action_task like logging.
- **Database**: Using MySQL via PHP's PDO, with dynamic database allocation for resources based on method calls.
- **API Development**: PHP API Gateway providing endpoints for HTML responses (either serialized or buffered).

## 3. Frontend/Backend Technologies

### Frontend
- **React (Poetabook)**: The front-end is React-based, with plans for a common modal solution across projects.
- **PHP Frontend**: The second project uses PHP with jQuery for form handling and modal support.
- **React Native**: You are interested in implementing a common modal solution for all platforms including React Native, PHP/jQuery, and React.

### Backend
- **FastAPI (GPY)**: Running with Uvicorn (`uvicorn main:app --host 0.0.0.0 --port 3006`).
- **PHP**: Extensive use of classes, database interaction through methods like `f()`, `select()`, `fa()`, `q()`.

## 4. Tools and Libraries

- **Swagger/OpenAPI**: Integration of Swagger annotations into PHP classes for automatic API documentation.
- **Event-Driven Architecture**: Looking towards an event-driven system to reduce future upgrades, possibly for a chat app.
- **Cubos (HTML modules)**: Used for constructing non-blocking, performant UI elements. Investigating the use of web workers.
- **Dynamic Modals**: Seeking a fast, dynamic JS content toolset that supports full-page modals with videos or dynamic content. Preferably not using Bootstrap or jQuery.

## 5. Custom Scripts and Configurations

- **PHP Scripting**:
    - Form generation script that handles different input types such as text, radio, checkbox, dropdowns, and textareas.
    - Use of PDO for database queries, with methods like `newsubmit()` for form submission and `input()` for handling input fields dynamically.

- **JavaScript**:
    - API methods dynamically assigned via closures to lock in the correct database reference for asynchronous calls.
    - The form handling script includes elements like `get()`, `newsubmit()`, `input()`, and callbacks for form submissions.

- **Logging and Cron Jobs**:
    - Cron job scripts fetch the enabled status from the database based on the script name using the basename (`SELECT enabled FROM cron_jobs WHERE script_name='$0'`).

## 6. Environment Setup

- **Docker**: Used for development with `code-server` and SSL configured for the domain `vivalibro.com`.
- **Path Configuration**: Python environment paths are managed to ensure compatibility with scripts and web servers.

## 7. Future Plans

- **Event-driven System**: Plans to make the system more event-driven, possibly for a chat application or other real-time interactions.
- **Optimization**: Minimize backend overhead by using SQL routines and functions effectively, with a focus on PHP as the primary backend for now (shelving Go implementation for later).
- **Cross-platform Compatibility**: Looking for a common modal solution that can be shared across projects, including PHP/jQuery, React, and React Native.
- **Web Workers**: Interest in incorporating web workers for non-blocking operations in the frontend (Cubos) for better performance.

## 8. Additional Notes

- **Dynamic Properties Deprecation**: Handling of PHP 8.3 warnings and fatal errors related to dynamic properties and null object references.
- **SSL Configuration**: Certificates are stored in `/etc/letsencrypt/live/vivalibro.com` for SSL setup with Docker.


## Components

### 1. **PHP Backend**
- **Versioning & Database Management**
    - Utilizes PHP 8.3 with JIT (Just-In-Time) compilation.
- **API Gateway**
    - Provides endpoints for HTML responses and handles serialization/buffering of data.
    - Integrates Swagger/OpenAPI for API documentation with annotations such as `@OA\PathItem()` and `@OA\Info()`.
- **Form Management**
    - Handles form creation with php & js library.
- **Logging & Cron Jobs**
    - Executes shell scripts using cron jobs, fetching status from databases dynamically.

### 2. **JavaScript & Node.js**
- **Dynamic API Management**
    - Employs dynamic method assignments and closures for API operations.
    - Handles caching with a low-level solution (Node.js API and FastAPI).
- **UI Components**
    - Implements a chat system with customizable HTML input and attachments.
    - Utilizes vanilla JavaScript for progress bar manipulation and dynamic UI elements.
- **Modal Solutions**
    - Focuses on dynamic JS modals for full-page content with videos or interactive elements.
    - Avoids Bootstrap or jQuery-based solutions for modals.
### 3. **FastAPI Integration**
- **API Management**
    - Runs on Uvicorn within a virtual environment.
    - Configured to manage endpoints and caching with minimal overhead.
### 4. **React & Frontend**
- **UI Development**
    - Creates professional tab headers and hierarchical tree structures for taxonomies.
    - Implements a unified frontend logic for PHP, React, and React Native projects.

- **Markdown Editing**
    - Prefers Ace Editor for Markdown and code editing due to its flexibility and features.
      Components
      The system consists of several key components:


## Implementation Details

### **Dynamic Database Management**

- Uses methods like `method_exists()` to handle dynamic database operations.
- Handles API method assignments with dynamic keys and closures.

### **Event-Driven Architecture**

- Considers using Kafka for event-driven architecture to manage API messages and system events.

### **Form Handling**
- Utilizes dynamic templates and string manipulation for form generation.
- Abstracts form handling into functions like `form.template(loopi)` to manage new and existing records.

## Development & Deployment
### **Environment Setup**
- **PHP**: Runs PHP 8.3 with JIT enabled.
- **Node.js & FastAPI**: Uses virtual environments and Uvicorn for FastAPI.
- **Debian**: Operates on Debian Bookworm.

### **CI/CD Workflows**
- **Git & Versioning**: Tracks changes and updates across different systems.
- **Docker**: Configures SSL settings and container management.

## Troubleshooting
- **Dynamic Properties Warning**: Resolve deprecation warnings related to dynamic properties in PHP.
- **Method on Null Object**: Address fatal errors related to null object method calls.

## Future Considerations

- Evaluate potential upgrades for system components to ensure compatibility with evolving technologies.
- Explore additional modular solutions and performance optimizations.

## TODOs
0. Launch Vivalibro at beta web & mobile version at v0.50.
1. **Enhance Event-Driven Architecture**
    - Explore Kafka or other event brokers to fully integrate event-driven architecture.
    - Implement additional event-driven features to improve system responsiveness and scalability.

2. **Optimize API Documentation**
    - Ensure all endpoints are properly documented with Swagger/OpenAPI annotations.
    - Address any missing annotations or inconsistencies in API documentation.

3. **Improve Modal Solutions**
    - Evaluate and implement a dynamic JS modal solution that supports full-page content and interactions.
    - Consider user feedback and performance metrics to refine the modal implementation.

4. **Expand Form Handling Abstractions**
    - Develop additional functions for handling various form scenarios and edge cases.
    - Ensure that `form.template(loopi)` can handle complex cases and large datasets.

5. **Refine Caching Mechanisms**
    - Optimize caching solutions in Node.js and FastAPI to reduce latency and improve performance.
    - Monitor and adjust caching strategies based on real-world usage and performance metrics.

6. **Update and Maintain Documentation**
    - Regularly update the documentation to reflect any changes or new features in the system.
    - Include usage examples and detailed explanations for complex features.

7. **Improve Compatibility and Testing**
    - Conduct thorough testing to ensure compatibility across different environments and setups.
    - Address any cross-platform or version-specific issues.

## Weaknesses

1. **Event-Driven Integration**
    - Current implementation might lack full integration of event-driven architecture.
    - Potential difficulty in scaling and managing events effectively without a robust system in place.

2. **Dynamic Property Warnings**
    - Encountering deprecation warnings related to dynamic properties in PHP.
    - Need to update code to align with PHP's latest standards and practices.

3. **Complex Form Handling**
    - Dynamic form generation and management can be complex and error-prone.
    - Potential challenges in maintaining and updating form templates.

4. **Modal Performance**
    - The current modal implementation might not meet performance or capabilities expectations.
    - Possible limitations in handling full-page content or interactive elements.

5. **Documentation Gaps**
    - Some aspects of the API and system may lack comprehensive documentation.
    - Missing details or examples could lead to confusion or misimplementation.

## Abilities
Abilities
The system has a broad range of capabilities:
AI Integration: Combines FastAPI with Gemini and Cohere to enable advanced data processing and AI-driven features.
Custom Layouts: Through drag-and-drop Cubos, users can customize page layouts on both public and admin interfaces.
Multi-Language API: Core API in PHP, with subsystems in Node.js and Python (FastAPI), enabling cross-platform development.
Modular UI Widgets: Combos and Cubos are modular UI components that can be reused across different parts of the system.
WebSocket Notifications: Real-time notifications through Redis PubSub for both public and admin users.
Versioning & Workflow Automation: Uses GitHub workflows and cron jobs for automated task management and deployment.

1. **Dynamic Content Management**
    - Efficiently manages dynamic databases and API methods.
    - Handles API operations with flexibility and adaptability.

2. **Modular Design**
    - Supports modular design with dynamic components and interactions.
    - Provides a unified approach for managing different frontend and backend components.

3. **Advanced Form Handling**
    - Utilizes dynamic templates and string manipulation for flexible form management.
    - Abstracts complex form operations into manageable functions.

4. **Real-Time Communication**
    - Implements real-time chat systems with customizable features.
    - Provides a user-friendly interface for message input and interactions.

5. **Comprehensive API Integration**
    - Integrates various APIs (PHP, Node.js, FastAPI) for a cohesive system.
    - Utilizes caching and optimized API endpoints for improved performance.

6. **Customizable UI Components**
    - Develops professional and interactive UI components such as tab headers and tree structures.
    - Offers a range of customization options for user interfaces.

7. **Flexible Markdown Editing**
    - Supports Markdown and code editing with Ace Editor, offering flexibility and advanced features.

## Filesystem
admin

Contains core files for the admin panel, including PHP scripts, configuration files, CSS, JavaScript, and various libraries.
Includes subdirectories for components (compos), cron jobs (cron), logs (log), and shell scripts (shell).
apiv1

Handles API version 1 with endpoints organized by HTTP methods (bin), and includes Swagger documentation for API specifications.
core

Contains core PHP classes for various functionalities like administration, API, form handling, etc.
cubos

Contains various modules related to the Cubos system, such as capture, ebook, findimage, and slideshow, among others.
docker-compose.yml

Docker Compose configuration file, typically used to define and run multi-container Docker applications.
go

Contains Go source files and modules, likely related to a Go-based subsystem or utility.


## Components

### Core Components

1. **Vivalibro (vlweb & vlmob)**: The foundational project for GEN20, focusing on mobile app and web integration. It utilizes custom classifications and internet resources.

2. **Cubos**: A system for creating reusable UI components and layouts. Cubos provides modular widgets that can be dragged and dropped to build public website mockups.

3. **GPM**: Manages packaging, task processing, and logging. Utilizes Maria.gpm for relational database management.

4. **ermis**: Node.js subsystem responsible for handling notifications and attempting an event-driven architecture.

5. **GPY**: FastAPI component handling AI services like Gemini and Cohere.

### Additional Components

- **ADMIN**: The dashboard for system management, divided into 7 channels and utilizing sortable components for drag-and-drop capabilities.
- **CORE**: The abstract class system of GEN20, updated to PHP 8.3 and vanilla JavaScript.

## Abilities

- **Modular UI Design**: Create and manage UI components using Cubos for both public and admin interfaces.
- **AI Integration**: Leverage FastAPI for AI services, including recommendation systems and natural language processing.
- **Real-time Notifications**: Use Node.js and Redis PubSub for real-time updates and notifications across the system.
- **Scalable Backend**: PHP and FastAPI provide a robust backend with scalable API services.
- **Data Management**: Utilize Solr for search indexing and Neo4j for graph database management.

## Todos

1. **API Gateway Stabilization**: Improve error handling, logging, and performance monitoring for the API gateway.
2. **Bundler Completion**: Finalize the bundler script for robust handling of PHP, CSS, and JavaScript.
3. **Staging Server Setup**: Create and automate a staging server to mirror the development environment.
4. **Cubos Focus**: Prioritize and perfect core Cubos for initial launch.
5. **JavaScript Refactoring**: Improve modularity and reduce dependencies in JavaScript code.
6. **AI Integration Reevaluation**: Explore alternative AI solutions if current setups are unsuccessful.
7. **Localization**: Complete the localization rebuilding in the ADMIN system.
8. **User Authentication**: Implement secure user authentication and authorization mechanisms.
9. **Basic User Testing**: Gather feedback from early users to identify usability improvements.
10. **Documentation**: Enhance API and system documentation for better integration and usage.

## Weaknesses

- **Bundler Complexity**: The "one file" approach creates complexity in testing and deployment due to the lack of a robust bundler and staging server.
- **AI Integration Challenges**: Difficulty in integrating and refining AI setups may affect the effectiveness of AI-driven features.
- **JavaScript Modularity**: Current JavaScript code may lack modularity and reusability, leading to maintenance challenges.
- **Localization Incomplete**: Incomplete localization may affect the user experience for non-English speakers.
- **Component Reusability**: Some components, like Cubos, may not be fully integrated or recognized in all parts of the system, impacting their effectiveness.

## Generative AI Text

**Title: Enhancing AI Capabilities with Generative AI in GEN20**

GEN20 is at the forefront of integrating advanced AI technologies to enhance its capabilities and offer a richer user experience. Our system employs Generative AI to drive various features, including personalized recommendations, content generation, and user interaction. By leveraging FastAPI to manage AI services like Gemini and Cohere, we ensure that our applications benefit from cutting-edge natural language processing and recommendation algorithms.

Generative AI in GEN20 allows for the creation of sophisticated recommendation engines that analyze user preferences and behavior to provide tailored suggestions. This capability is integral to our Vivalibro project, where personalized book recommendations and reading challenges enhance user engagement. Additionally, our AI-driven content generation tools can automatically create and adapt content based on user interactions, improving the relevance and quality of user experiences.

We are committed to exploring and refining AI technologies to continually improve the capabilities and performance of our system. Our approach involves continuous experimentation with AI setups, optimization of existing resources, and evaluation of new AI solutions. By integrating Generative AI, GEN20 aims to provide a dynamic, responsive, and personalized environment for all users.

#Deep Plans
- Install and configure IPFS nodes on your servers or devices. IPFS (InterPlanetary File System) is a peer-to-peer network for storing and sharing data in a distributed file system.
  UI Design: Design a user-friendly interface for users to upload and access content. This could be a web application where users can drag and drop files or search for content.
  Integration: Integrate the frontend with the IPFS backend using the APIs you created. Ensure that users can easily share content by generating IPFS links.
  Metadata: Store metadata related to files on a decentralized database (like a blockchain) or use IPFS itself to store metadata.
  Search: Implement a search capabilities using decentralized search engines or integrate with existing ones like Solr or Elasticsearch.
  Encryption: Encryption of sensitive data before uploading it to IPFS to ensure privacy.
  Access Control: access control mechanisms to manage who can view or upload content.
  Open Source: making system open-source to allow others to contribute and improve it.


#An other Glossary
VLMOB (Vivalibro Mobile): A React Native mobile app for cataloging and managing books using custom classifications and open resources.
VLCUBO: Public UI widgets that form the core layout elements in both public and admin pages.
ermis (WebSocket Interface): A Node.js subsystem for handling notifications and interactions across public and admin systems.
GPY: A FastAPI service integrating with external AI systems like Gemini and Cohere to handle advanced data processing and notifications.
Core API: PHP-based API that serves as the backbone, integrating with various frontend and backend systems.
GPM (Gaia Package Manager): A central subsystem for managing packages, workflows, logging, and automation.
Cubos & Components: Modular UI components for both public and admin use, forming a customizable, reusable interface.

Text for Generative AI
The system is designed to bridge the gap between human intelligence and AI, providing a platform where users can leverage the power of artificial intelligence to enhance their personal and professional knowledge. By integrating AI into the system’s core components, it opens new avenues for learning and research, dynamically updating and interacting with real-time data. Generative AI plays a crucial role in customizing content, suggesting improvements, and automating repetitive action_task, allowing users to focus on higher-level thinking and creativity.
###JAVASCRIPT LIBRARY

/*
JS library of gaia systems gs.js
vanilla javascript
from gaia.js
embedded to the start of the body before PHP encode G OBJECT
in any gaia system
adapted from gaia.js $.ajax,$.post.$.get replaced with FETCH()
no jquery, no bootstrap

* * PROPERTIES
-  basic added coo, ses,loc
- workers
- soc
- api
- apy
- api
- loadCumbo
- loadfile
- ui
- form
- activity

* DEPENDENCIES from cdns
- Sweetalert2 > gs.success, gs.fail
- Sortable

API Standards v0.60 for Kronos, Ermis, Mars, God
1) Action.go, Actionplan.go 
2) AI Training
3) AI Gen
4) WS Client connected (Ermis Server)
5) Manifest (yaml) --> Messenger 
6) Core Maria 
7) REST API standards
8) Microservices 
9) ci/cd
10) Gaia 