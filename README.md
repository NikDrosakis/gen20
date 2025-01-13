# GEN20 v0.48

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
- solr 
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
- callapi
- loadCumbo
- loadfile
- ui
- form
- activity

* DEPENDENCIES from cdns
- Sweetalert2 > gs.success, gs.fail
- Sortable

* * */
    var gs= {
    /*
    * BASIC
    * */
      greeklish : function (str) {
      var str = str.replace(/[\#\[\]\/\{\}\(\)\*\<\>\%\@\:\>\<\~\"\'\=\*\+\!\;\-\,\?\.\\\^\$\|]/g, "_");
      var greekLetters = [' ', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'A', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω', 'ά', 'έ', 'ή', 'ί', 'ό', 'ύ', 'ώ', 'ς'];
      var enLetters = ['_', 'a', 'v', 'g', 'd', 'e', 'z', 'i', 'th', 'i', 'k', 'l', 'm', 'n', 'x', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'ps', 'o', 'A', 'B', 'G', 'D', 'E', 'Z', 'I', 'Th', 'I', 'K', 'L', 'M', 'N', 'X', 'O', 'P', 'R', 'S', 'T', 'Y', 'F', 'Ch', 'Ps', 'O', 'a', 'e', 'i', 'i', 'o', 'u', 'o', 's'];
      return this.str_replace(greekLetters, enLetters, str);
      },
      date : function (format, timestamp) {
      var that = this;
      var jsdate, f;
      // Keep this here (works, but for code commented-out below for file size reasons)
      // var tal= [];
      var txt_words = [
      'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
      ];
      // trailing backslash -> (dropped)
      // a backslash followed by any character (including backslash) -> the character
      // empty string -> empty string
      var formatChr = /\\?(.?)/gi;
      var formatChrCb = function (t, s) {
      return f[t] ? f[t]() : s;
      };
      var _pad = function (n, c) {
      n = String(n);
      while (n.length < c) {
      n = '0' + n;
      }
      return n;
      };
      f = {
      // Day
      d: function () { // Day of month w/leading 0; 01..31
      return _pad(f.j(), 2);
      },
      D: function () { // Shorthand day name; Mon...Sun
      return f.l()
      .slice(0, 3);
      },
      j: function () { // Day of month; 1..31
      return jsdate.getDate();
      },
      l: function () { // Full day name; Monday...Sunday
      return txt_words[f.w()] + 'day';
      },
      N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
      return f.w() || 7;
      },
      S: function () { // Ordinal suffix for day of month; st, nd, rd, th
      var j = f.j();
      var i = j % 10;
      if (i <= 3 && parseInt((j % 100) / 10, 10) == 1) {
      i = 0;
      }
      return ['st', 'nd', 'rd'][i - 1] || 'th';
      },
      w: function () { // Day of week; 0[Sun]..6[Sat]
      return jsdate.getDay();
      },
      z: function () { // Day of year; 0..365
      var a = new Date(f.Y(), f.n() - 1, f.j());
      var b = new Date(f.Y(), 0, 1);
      return Math.round((a - b) / 864e5);
      },

            // Week
            W: function () { // ISO-8601 week number
                var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3);
                var b = new Date(a.getFullYear(), 0, 4);
                return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
            },

            // Month
            F: function () { // Full month name; January...December
                return txt_words[6 + f.n()];
            },
            m: function () { // Month w/leading 0; 01...12
                return _pad(f.n(), 2);
            },
            M: function () { // Shorthand month name; Jan...Dec
                return f.F()
                    .slice(0, 3);
            },
            n: function () { // Month; 1...12
                return jsdate.getMonth() + 1;
            },
            t: function () { // Days in month; 28...31
                return (new Date(f.Y(), f.n(), 0))
                    .getDate();
            },

            // Year
            L: function () { // Is leap year?; 0 or 1
                var j = f.Y();
                return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
            },
            o: function () { // ISO-8601 year
                var n = f.n();
                var W = f.W();
                var Y = f.Y();
                return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
            },
            Y: function () { // Full year; e.g. 1980...2010
                return jsdate.getFullYear();
            },
            y: function () { // Last two digits of year; 00...99
                return f.Y()
                    .toString()
                    .slice(-2);
            },

            // Time
            a: function () { // am or pm
                return jsdate.getHours() > 11 ? 'pm' : 'am';
            },
            A: function () { // AM or PM
                return f.a()
                    .toUpperCase();
            },
            B: function () { // Swatch Internet time; 000..999
                var H = jsdate.getUTCHours() * 36e2;
                // Hours
                var i = jsdate.getUTCMinutes() * 60;
                // Minutes
                var s = jsdate.getUTCSeconds(); // Seconds
                return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
            },
            g: function () { // 12-Hours; 1..12
                return f.G() % 12 || 12;
            },
            G: function () { // 24-Hours; 0..23
                return jsdate.getHours();
            },
            h: function () { // 12-Hours w/leading 0; 01..12
                return _pad(f.g(), 2);
            },
            H: function () { // 24-Hours w/leading 0; 00..23
                return _pad(f.G(), 2);
            },
            i: function () { // Minutes w/leading 0; 00..59
                return _pad(jsdate.getMinutes(), 2);
            },
            s: function () { // Seconds w/leading 0; 00..59
                return _pad(jsdate.getSeconds(), 2);
            },
            u: function () { // Microseconds; 000000-999000
                return _pad(jsdate.getMilliseconds() * 1000, 6);
            },
            // Timezone
            e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
                // The following works, but requires inclusion of the very large
                // timezone_abbreviations_list() function.
                /*              return that.date_default_timezone_get();
                 */
                throw 'Not supported (see source code of date() for timezone on how to add support)';
            },
            I: function () { // DST observed?; 0 or 1
                // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
                // If they are not equal, then DST is observed.
                var a = new Date(f.Y(), 0);
                // Jan 1
                var c = Date.UTC(f.Y(), 0);
                // Jan 1 UTC
                var b = new Date(f.Y(), 6);
                // Jul 1
                var d = Date.UTC(f.Y(), 6); // Jul 1 UTC
                return ((a - c) !== (b - d)) ? 1 : 0;
            },
            O: function () { // Difference to GMT in hour format; e.g. +0200
                var tzo = jsdate.getTimezoneOffset();
                var a = Math.abs(tzo);
                return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
            },
            P: function () { // Difference to GMT w/colon; e.g. +02:00
                var O = f.O();
                return (O.substr(0, 3) + ':' + O.substr(3, 2));
            },
            T: function () {
                return 'UTC';
            },
            Z: function () { // Timezone offset in seconds (-43200...50400)
                return -jsdate.getTimezoneOffset() * 60;
            },

            // Full Date/Time
            c: function () { // ISO-8601 date.
                return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
            },
            r: function () { // RFC 2822
                return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
            },
            U: function () { // Seconds since UNIX epoch
                return jsdate / 1000 | 0;
            }
      };
      this.date = function (format, timestamp) {
      that = this;
      jsdate = (timestamp === undefined ? new Date() : // Not provided
      (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
      new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
      );
      return format.replace(formatChr, formatChrCb);
      };
      return this.date(format, timestamp);
      },
      time : function () {
      return Math.floor(Date.now() / 1e3)
      },
      ucfirst: function (string) {
      return typeof string != 'undefined' ? string.charAt(0).toUpperCase() + string.slice(1) : '';
      },
      explode : function (delimiter, string, limit) {
      if (arguments.length < 2 || typeof delimiter === 'undefined' || typeof string === 'undefined') return null;
      if (delimiter === '' || delimiter === false || delimiter === null) return false;
      if (typeof delimiter === 'function' || typeof delimiter === 'object' || typeof string === 'function' || typeof string === 'object') {
      return {
      0: ''
      };
      }
      if (delimiter === true) delimiter = '1';
      delimiter += '';
      string += '';
      var s = string.split(delimiter);
      if (typeof limit === 'undefined') return s;
      // Support for limit
      if (limit === 0) limit = 1;
      // Positive limit
      if (limit > 0) {
      if (limit >= s.length) return s;
      return s.slice(0, limit - 1)
      .concat([s.slice(limit - 1)
      .join(delimiter)
      ]);
      }
      // Negative limit
      if (-limit >= s.length) return [];
      s.splice(s.length + limit);
      return s;
      },
      implode : function (glue, pieces) {
      var i = '',
      retVal = '',
      tGlue = '';
      if (arguments.length === 1) {
      pieces = glue;
      glue = '';
      }
      if (typeof pieces === 'object') {
      if (Object.prototype.toString.call(pieces) === '[object Array]') {
      return pieces.join(glue);
      }
      for (i in pieces) {
      retVal += tGlue + pieces[i];
      tGlue = glue;
      }
      return retVal;
      }
      return pieces;
      },
      success : function (mes) {
      Swal.fire({
      title: "Success!",
      text: mes,
      icon: "success"
      });
      },
      fail : function (mes) {
      Swal.fire({
      title: "Fail!",
      text: mes,
      icon: "error"
      });
      },
      confirm : async function (mes) {
      const result = await Swal.fire({
      title: `Cormimation`,
      text:mes,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No'
      });
      return result;
      },
      serializeArray: function (form) {
      return Array.from(new FormData(form)).map(([name, value]) => ({name, value}));
      },
      scrollToBottom : function (id) {
      const element = document.getElementById(id);
      window.scrollTo({top: element.scrollHeight, behavior: 'smooth'});
      },


//web storage
ses: function (key, value) {
var s = sessionStorage;
if (!key) {
return Object(s);
} else if (!value) {
return s.getItem(key) || false;
} else {
s.setItem(key, value);
}
},

    // Delete session storage item(s)
    sesDel: function (key) {
        if (Array.isArray(key)) {
            for (var i in key) {
                sessionStorage.removeItem(key[i]);
            }
        } else {
            sessionStorage.removeItem(key);
        }
    },

    // Clear all session storage items
    sesClear: function () {
        sessionStorage.clear();
    },
    // Get, set, or return local storage item
    local: function (key, value) {
        var s = localStorage;
        if (!key) {
            return Object(s);
        } else if (!value) {
            return s.getItem(key) || false;
        } else {
            s.setItem(key, value);
        }
    },

    // Delete local storage item(s)
    localDel: function (key) {
        if (Array.isArray(key)) {
            for (var i in key) {
                localStorage.removeItem(key[i]);
            }
        } else {
            localStorage.removeItem(key);
        }
    },

    // Clear all local storage items
    localClear: function () {
        localStorage.clear();
    },
    // Set, get, or return cookies
    coo: function (name, value, time, domain) {
    var d = document.cookie;
    var h = window.location.host.split('.');
    var base = h.length == 3 ? (h[1] + "." + h[2]) : window.location.host;

    if (!name) {
        // Return all cookies
        var cookies = d.split(';');
        var result = {};
        for (var i in cookies) {
            var pair = cookies[i].split("=");
            result[pair[0].trim()] = pair[1];
        }
        return result;
    } else if (!value) {
        // Get a specific cookie
        var result = RegExp('(^|; )' + encodeURIComponent(name) + '=([^;]*)').exec(d);
        return result ? result[2] : false;
    } else {
        // Set a cookie
        var domainPart = !domain ? (base ? ";domain=" + base : "") : ";domain=" + domain;
        if (d.indexOf(name) >= 0) {
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC" + domainPart + ";path=/;SameSite=None;Secure";
        }
        var now = new Date();
        var expireTime = !time ? now.getTime() + 1000 * 36000 * 1000 : now.getTime() + (time * 1000);
        now.setTime(expireTime);
        document.cookie = name + "=" + value + ";expires=" + now.toUTCString() + domainPart + ";path=/;SameSite=None;Secure";
    }
},

// Delete cookie(s)
cooDel: function (name, domain) {
var h = window.location.host.split('.');
var base = h.length == 3 ? (h[1] + "." + h[2]) : window.location.host;
var domainPart = !domain ? (base ? ";domain=" + '.' + base : "") : ";domain=" + domain;

    if (Array.isArray(name)) {
        for (var i in name) {
            document.cookie = name[i] + "=;" + domainPart + ";path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;max-age=0";
        }
    } else {
        document.cookie = name + "=;" + domainPart + ";path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;max-age=0";
    }
},

// Delete all cookies except the specified ones
cooDelAll: function (except) {
var cookies = document.cookie.split(";");
for (var i = 0; i < cookies.length; i++) {
var cookie = cookies[i];
var eqPos = cookie.indexOf("=");
var name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
if (!except.includes(name)) {
this.cookieDel(name);
}
}
},
/**
WEB WORKERS
USAGE:
async function useWorker(params, method = 'GET', responseFormat = 'html') {
try {
const url =  your URL construction ...
const result = await gs.worker(params, method, responseFormat, url);
console.log("Worker Result:", result);
// ... (process the result) ...
} catch (error) {
console.error("Worker Error:", error);
// ... (handle the error) ...
}
}
*/

    worker : function(params, method = 'GET', responseFormat = 'html') {
        return new Promise((resolve, reject) => {
            if (window.Worker) {
                const wid = "w" + hash();
                window[wid] = new Worker("/admin/js/worker4.js");
                // Handle errors
                window[wid].onerror = (e) => {
                    reject(new Error(e.message + " (" + e.filename + ":" + e.lineno + ")"));
                };
                params.method = method;
                params.responseFormat = responseFormat;
                params.wid = wid;
                params.isWorkerRequest = true;

                window[wid].postMessage(params);

                window[wid].onmessage = (event) => {
                    resolve(event.data); // Resolve the Promise with the worker's response
                }
            } else {
                reject(new Error("Web Workers are not supported in this browser."));
            }
        });
    },
/*
* ${G.TEMPLATE}.com:${port}/${user}
* */
  soc : {
  ws: null,  // WebSocket instance
  pingInterval: null, // Ping interval handler

        start: function(uri, callback) {
            this.ws = new WebSocket(`wss://${uri}`);

            this.ws.onopen = (event) => {
                this.open(event);
                if (typeof callback === 'function') {
                    callback(); // Execute the callback if provided
                }
            };

            this.ws.onclose = (event) => this.close(event);
            this.ws.onmessage = (event) => this.get(event);
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            // Start periodic PING messages
            this.pingInterval = setInterval(() => {
                this.ping();
            }, 30000); // Send a ping every 30 seconds
        },

        ping: function () {
            const mes = { type: "PING", cast: "one" };
            this.send(mes);
        },

        open: function (e) {
            const user = G.my?.id || 0;
            const mes = { type: "open", text: "PING", uid: user, cast: "all" };
            this.send(mes);
        },

        close: function (e) {
            if (e.wasClean) {
                console.log("Connection closed cleanly, code=", e.code, "reason=", e.reason);
            } else {
                console.log("Connection died unexpectedly");
            }
            clearInterval(this.pingInterval); // Clear ping interval

            // Attempt to reconnect after 15 seconds
            setTimeout(() => {
                this.start().catch(err => console.error('Reconnection failed:', err));
            }, 15000);
        },

        send: function (mes) {
            // Ensure WebSocket connection is open before sending
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(mes));
            } else {
                console.error("WebSocket is not open. Unable to send message:", mes);
            }
        },

        get: function (ev) {
            const data = JSON.parse(ev.data) || ev.data;
            console.log(data);

            switch (data.type) {
                case "html":
                  const divid=document.getElementById(data.id);
                    if(divid){divid.innerHTML=data.html;}
                    break;
                case 'N':
                    for (const key in data.text) {
                        if (data.text.hasOwnProperty(key)) { // Important check for object properties
                            const elements = document.querySelectorAll(`.${key}`);
                            elements.forEach(element => {
                                const em = document.createElement('em');
                                em.textContent = data.text[key];
                                if (data.class) {
                                    em.className = data.class; // Set the class if provided
                                }
                                element.innerHTML = ''; // Clear existing content
                                element.appendChild(em);
                            });
                        }
                    }
                    break;
                case "status":
                    console.log(data);
                    break;
                case "console":
                    console.log(data);
                    break;
                case "activity":
                    gs.activity.add(data.text);
                    break;
                default:
                    console.log("Unknown message type:", data.type);
                    break;
            }
        }
  },

  /**
  APY
  executes GPY system (python fast api)
  USAGE:
  */
  apy : async function cohere(userInput) {
  try {
  const response = await fetch(`${G.SITE_URL}apy/v1/cohere/chat`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ user_input: userInput })
  });
  if (!response.ok) {
  throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const textData = await response.text();
  return textData;  // Access the 'text' property of the response
  } catch (error) {
  console.error('Error fetching chat response:', error);
  }
  },
  /**
  callapi
  executes and gets data any core method
  USAGE:

  callapi: async function (classmethod, params) {
  try {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${G.SITE_URL}api/v1/local/${classmethod}?${queryParams}`;
  console.log(url);
  const response = await fetch(url, {
  method: 'GET',
  headers: {'Content-Type': 'application/json',}
  });
  if (!response.ok) {
  throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const result = await response.json();
  console.log(result)
  return result;
  } catch (error) {
  console.error("Error updating content:", error);
  }
  },    */
  callapi : {
  get: async function(classmethod, params) {
  try {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${G.SITE_URL}api/v1/local/${classmethod}?${queryParams}`;
  console.log(url);
  const response = await fetch(url, {
  method: 'GET',
  headers: {'Content-Type': 'application/json',}
  });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                console.log(result);
                return result;
            } catch (error) {
                console.error("Error updating content:", error);
            }
        },

        post: async function(classmethod, params) {
            try {
                const url = `${G.SITE_URL}api/v1/local/${classmethod}`;
                console.log(url);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify(params)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                console.log(result);
                return result;
            } catch (error) {
                console.error("Error updating content:", error);
            }
        }
  },
  /***
  loadCubo
  CUBO FUNCTIONALITY
  USAGE:
  */
  loadCubo: async function (wrap, url) {
  try {
  const response = await fetch(url);
  if (!response.ok) {
  //        console.log(`HTTP error: ${response.status}`);
  }
  const html = await response.text();
  //    console.log(html)
  if (html && document.querySelector(wrap)) {
  document.querySelector(wrap).innerHTML = html;
  }
  } catch (error) {
  console.warn('Error loading widget:', error);
  }
  },
  /***
  loadfile
  get BUFFERS from core API api/bin
  USAGE:
  */
  loadfile : async function (path, id) {
  try {
  const response = await fetch(`${G.SITE_URL}api/v1/bin/getfile?file=${path}`, {
  method: 'GET',
  headers: {
  'Content-Type': 'application/json',
  }
  });
  if (!response.ok) {
  throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const html = await response.json();
  console.log(html)
  document.getElementById(id).innerHTML = html.data;
  } catch (error) {
  console.error("Error updating content:", error);
  }
  },

  /*
  const newpage = form.generate(params,callback).attach(id);
    * */
      form :{
      generate: async function (params) {
      // Bind the submit event to the form and handle async properly
      const html = await gs.form.get(params); // Assuming get() returns a Promise now
      document.querySelector(params.append).innerHTML = html;
      // Bind the submit event to the form and handle async properly
      await new Promise((resolve, reject) => {
      document.getElementById(params.adata).addEventListener('submit', async function(event) {
      event.preventDefault(); // Prevent default form submission
      try {
      const response = await gs.form.newsubmit(event);
      resolve(response);
      } catch (error) {
      reject(error);
      }
      });
      });
      },
      get: async function (params) {
      var ob = params;
      var inp = '', className, droplist, droptext = '';
      var board = '<form method="POST" class="gform" id="' + ob.adata + '">' +
      '<input type="hidden" name="a" value="new">' +
      '<input type="hidden" name="table" value="' + ob.adata + '">';
      var data = [];
      // Loop over the list of fields and build the form
      Object.keys(ob.list).forEach((key) => {
      var item = ob.list[key];
      ob.type = 'type' in item ? item.type : 'text';
      ob.global = item.global;
      ob.globalkey = 'globalkey' in item ? true : false; // Set the key of globals
      ob.row = 'row' in item ? item.row : '';
      data[ob.row] = typeof data[ob.row] !== 'undefined' ? data[ob.row] : '';
      ob.alias = 'alias' in item ? item.alias : ob.row;
      ob.placeholder = 'placeholder' in item ? item.placeholder : gs.ucfirst(ob.row);
      ob.value = 'value' in item ? item.value : '';
      ob.inputid = ob.row;
      ob.divid = ob.row;
      board += gs.form.input(ob, data);
      });
      board += '<button class="button2" id="' + ob.adata + '_insert" ' +
      'data-database="' + (ob.database || 'maria') + '" ' + // Default to 'maria'
      'data-formid="' + ob.adata + '" ' +
      '>DO</button></form>';
      return board;
      },

            newsubmit: async function (event) {
                event.preventDefault();
                const form = gs.serializeArray(event.target); // Get form data
                console.log(form);
                const formData = {};
                form.forEach(({name, value}) => {
                    formData[name] = value;
                });
                const database = event.target.dataset.database || 'maria'; // Get from data attribute (if needed)
                try {
                    // Make the API call
                    const response = await gs.api[database].form(formData);
                    console.log('Response:', response);
                    // Handle response (assuming success is a part of the response)
                    if (response && response.success) {
                        console.log('Form submitted successfully!');
                    } else {
                        alert('Error: ' + (response.message || 'An issue occurred.'));
                    }
                    return response; // Return the response for handling outside
                } catch (error) {
                    console.error('Submission Error:', error); // Log detailed error
                    alert('An error occurred during form submission.');
                    throw error; // Re-throw error to be caught
                }
            },

            input: function (f, data) {
                var part = '', result;
                // Handle different input types
                if (f.type === 'drop') {
                    var key;
                    var ievent = f.nature !== 'new' ? 'onchange="g.ui.form.drop(this)"' : '';
                    part = Object.keys(f.global)[0]!=0 ? `<option value=0>Select ${f.inputid}</option>` : '';
                    for (var i in f.global) {
                        key = f.globalkey ? f.global[i] : parseInt(i) + 1;
                        part += '<option value="' + i + '" ' + (i == data[f.row] ? 'selected="selected"' : '') + '>' + f.global[i] + '</option>';
                    }
                    result = `<div class="gs-span" id="${f.divid}"><label for="${f.alias}">${f.alias}</label>` +
                        (f.format === 'read'
                            ? data[f.row]
                            : `<select name="${f.row}" ${ievent} ${f.attributes} class="form-control" id="${f.inputid}">${part}</select>`) +
                        `</div>`;
                } else if (f.type === 'text' || f.type === 'number' || f.type === 'date') {
                    var string = f.type === 'date' ? date('Y-m-d', data[f.row]) : data[f.row];
                    result = `<div class="gs-span" id="${f.divid}"><label for="${f.alias}">${f.alias}</label>` +
                        (f.format === 'read'
                            ? string
                            : `<input class="form-control" name="${f.row}" placeholder="${f.placeholder}" id="${f.inputid}" type="${f.type}" value="${string}">`) +
                        `</div>`;
                } else if (f.type === 'textarea') {
                    result = `<div class="gs-span" id="${f.divid}"><label for="${f.alias}">${f.alias}</label>` +
                        (f.format === 'read'
                            ? data[f.row]
                            : `<div class="wysiwyg${f.inputid}" name="${f.row}" placeholder="${f.placeholder}" id="${f.inputid}">${g.htmlentities.decode(data[f.row])}</div>` +
                            (f.nature !== 'new' ? `<button onclick="gs.ui..form.textarea(this,this.previousSibling)" class="btn btn-default" id="submit_${f.inputid}">Save</button>` : '')) +
                        `</div>`;
                }
                // Add more input types as needed
                return result;
            },

            reset_inputs: function (array) {
                for (let i = 0; i < array.length; i++) {
                    document.querySelector(array[i]).value = '';
                }
            },

            template: async function (loopi, table, type, database) {
                let html = '';
                // Append the form submit button only for new entries
                if (type === 'new') {
                    html += `<form method="POST" data-database="${database}" id="new_${table}form">
              <input type="hidden" name="table" value="${table}">`;
                    var templated = loopi;
                } else {
                    var templated = loopi;
                }
                // If loopi is 'new', replace placeholders with default values for a new form
                const templateLines = templated.split('\n');
                templateLines.forEach(line => {
                    if (type === 'new') {
                        // Remove placeholders for new entries
                        html += line.replace(/\${loopi\..*?}/g, '')
                                .replace('undefined', '0')
                            + '\n';
                    } else {
                        // Replace placeholders with data from 'loopi' for existing entries
                        for (const key in loopi) { // Iterate through the loopi object
                            const placeholder = `\${loopi.${key}}`;
                            const value = loopi[key];
                            line = line.replace(new RegExp(placeholder, 'g'), value);
                        }
                        html += line + '\n';
                    }
                });
                if (type == 'new') {
                    html += `<button class="button" id="new_${table}_submit">Submit</button>
             </form>`;
                }
                //return inside the container
                return `<div id="new${table}box" class="${table}-box">${html}</div>`;
            }
  },

  ui: {
  opener:function(n, t) {
  var e = document.getElementById(n);
  if (typeof t !== 'undefined' && t === 'close') {
  e.style.display = 'none';
  } else {
  e.style.display = e.style.display === 'none' || e.style.display === '' ? 'block' : 'none';
  }
  },
  editor:function(textareaId) {
  const textarea = document.getElementById(textareaId);
  const editorId = `gseditor-${textareaId}`;

            // Create the contenteditable div
            const editor = document.createElement('div');
            editor.id = editorId;
            editor.contentEditable = true;
            editor.style.minHeight = '150px';
            textarea.parentNode.insertBefore(editor, textarea);

            // Create the toolbar
            const toolbar = document.createElement('div');
            toolbar.classList.add('toolbar');
            toolbar.id = `gseditor-${textareaId}`;
            editor.appendChild(toolbar);
            // Create and append buttons to the toolbar
            const buttons = [
                { tag: 'strong', html: '<b>B</b>' },
                { tag: 'em',     html: '<em>I</em>' },
                { tag: 'h2',     html: '<h2>H2</h2>', id: 'h2Button' },
                { tag: 'h3',     html: '<h3>H3</h3>', id: 'h3Button' },
                { tag: 'p',      html: '<p>P</p>', id: 'pButton' },
            ];
            buttons.forEach(buttonData => {
                const button = document.createElement('button');
                button.innerHTML = buttonData.html;
                if (buttonData.id) {
                    button.id = buttonData.id;
                }
                button.addEventListener('click', () => wrapSelection(textarea, `<${buttonData.tag}>`, `</${buttonData.tag}>`));
                toolbar.appendChild(button);
            });
            // Initialize the editor's content
            editor.textContent = textarea.value;
            // Update the textarea on input
            editor.addEventListener('input', () => {
                textarea.value = editor.innerHTML;
            });
            // Wrap selected text with tags
            function wrapSelection(textarea, startTag, endTag) {
                const selectionStart = textarea.selectionStart;
                const selectionEnd = textarea.selectionEnd;
                const selectedText = textarea.value.substring(selectionStart, selectionEnd);

                textarea.value =
                    textarea.value.substring(0, selectionStart) +
                    startTag + selectedText + endTag +
                    textarea.value.substring(selectionEnd);

                // Restore the cursor position (optional)
                textarea.selectionStart = selectionStart + startTag.length;
                textarea.selectionEnd = selectionEnd + startTag.length;
                textarea.focus();
            }
        },
table: {
execute: function (divid, query, data, row, node) {
if (row == "delete") {
var id = divid.replace('delete', '');
var q = gs.vareplace(query, data);
gs.db().func('query', q, function (res) {
if (res == 'yes') {
const element = document.getElementById(node + id);
if (element) {
element.remove();
}
}
});
}
},
get: function (f) {
var topbar = '';
/*
TOP BAR
1) from date to date selection all tables have creation and modified date
2) search table
3) counter
4) order by label
5) pagination
*/
topbar += '<div class="board_id_container">' +
'<button style="float:left;margin: 0.5%;display:flex;justify-content: center;" onclick="gs.ui.table.reset()" class="btn btn-default btn-sm">Reset</button>' +
'<input type="text" id="search" style="width: 78%; margin: 0.5% 0 10px 0;display:flex;justify-content: center;float: left;" onkeyup=" gs.ui.table.search(this)" placeholder="search" value="' + (!coo('search') ? '' : gs.coo('search')) + '" class="form-control input-sm">' +
'<div class="toFromTitle">' +
'<span>Registered from:</span><input style="display:inline-block;width:62%" style="margin: 6px;" type="date" onchange="gs.ui.table.dateselection(this)" value="' + (!coo('date' + f.adata + 'from') ? '' : gs.coo('date' + f.adata + 'from')) + '" id="date' + f.adata + 'from" class="form-control input-sm"></div>' +
'<div class="toFromTitle">' +
'<span>Until:</span><input style="display:inline-block;width:74%" type="date" style="margin: 6px;"  class="form-control input-sm" onchange="gs.ui.table.dateselection(this)" value="' + (!coo('date' + f.adata + 'to') ? '' : gs.coo('date' + f.adata + 'to')) + '" id="date' + f.adata + 'to"></div>' +
'<div class="label1"><span id="counter"></span> ' + G.sub + ' <span id="order_label"></span></div>' +
'<div id="pagination" class="paginikCon"></div>' +
'</div>';

                //HEAD OF TABLE
                var board = '';
                var append = 'append' in f ? f.append : (G.dsh ? '.gs-sidepanel' : '#main_window');

                for (var h in f.list) {
                    if (f.list[h].type != "img") {
                        board += '<th><button onclick="gs.ui.table.orderby(this);" data-orderby="' + f.list[h].row + '" class="orderby" id="order_' + f.list[h].row + '">' + f.list[h].row + '</button></th>';
                    } else {
                        board += '<th>' + f.list[h].row + '</th>';
                    }
                }
                // Create the HTML string
                const htmlString = topbar +
                    '<table class="TFtable">' +
                    '<tr class="board_titles">' + board + '</tr>' +
                    '<tbody id="' + f.adata + '"></tbody>' +
                    '</table>';

// Create a temporary container to hold the HTML string
const tempContainer = document.createElement('div');
tempContainer.innerHTML = htmlString;

// Append the created elements to the target container
const targetContainer = document.querySelector(append);
if (targetContainer) {
while (tempContainer.firstChild) {
targetContainer.appendChild(tempContainer.firstChild);
}
}
//read the loop
this.loop(f);
},
//reset button table
reset: function () {
//delete inputs
gs.coo.del('date' + gs.f.adata + 'from');
gs.coo.del('date' + gs.f.adata + 'to');
gs.coo.del('search');

                //clean inputs
                document.getElementById('search').value = '';
                document.getElementById('date' + gs.f.adata + 'from').value = '';
                document.getElementById('date' + gs.f.adata + 'to').value = '';
                //reset
                gs.ui.reset('#' + gs.f.adata);
                this.loop(s.f);
            },
            updateProgressBar(percentage) {
                // Update the progress bar width and aria-valuenow attribute
                const progressBar = document.getElementById('progressBar');
                if (progressBar) {
                    progressBar.style.width = percentage + '%';
                    progressBar.setAttribute('aria-valuenow', percentage);
                }
// Update the progress text
const progressText = document.getElementById('progressText');
if (progressText) {
progressText.textContent = percentage + '%';
}
// Log progress
console.log('Progress: ' + percentage + '%');
// Check if progress is 100%
if (percentage === 100) {
// Set a timeout to reset the progress bar after 2 seconds (2000 milliseconds)
setTimeout(function () {
// Reset the progress bar width and aria-valuenow attribute
const progressBar = document.getElementById('progressBar');
if (progressBar) {
progressBar.style.width = '0%';
progressBar.setAttribute('aria-valuenow', '0');
}

// Reset the progress text
const progressText = document.getElementById('progressText');
if (progressText) {
progressText.textContent = '0%';
}
}, 2000);
}
},//ORDER BY
orderby: function (obj) {
var name = obj.id.replace('order_', '')
var cookiename = gs.explode('_', obj.id)[0];
gs.ui.reset('#' + gs.f.adata);
gs.f.order[1] = gs.f.order[0] == name ? (s.f.order[1] == "DESC" ? "ASC" : "DESC") : "ASC";
gs.f.order[0] = name;
gs.coo(G.mode + '_' + cookiename, gs.f.order[0] + " " + gs.f.order[1]);
this.loop(s.f);
},
//DATE SELECTION
dateselection: function (obj) {
gs.coo(obj.id, obj.value)
gs.f.datauserfrom = obj.value;
gs.ui.reset('#' + gs.f.adata);
this.loop(s.f);
},
//list search
search: function (obj) {
gs.coo('search', obj.value);
// cookieSet('userlist_page',1)
gs.ui.reset('#' + gs.f.adata);
this.loop(s.f)
},
//set photos
get_imgs: function (obj) {
$.ajax({
type: 'GET',
url: gs.ajaxfile,
data: {a: 'get_imgs', b: obj.ids, c: obj.mediagrpid},
dataType: 'json',
success: function (imgs) {
// console.log(imgs)
for (var i in imgs) {
// console.log(i + ':' + imgs[i])
const imageElement = document.getElementById('fimage' + i);
if (imageElement) {
imageElement.src = gG.UPLOADS + imgs[i];
}
}
}
});
},
//TABLE LOOP
loop: function (f) {
var row, nature, divid, event, label, type, query, h, href, datarow, images = 0, board = '', ids = [],
mediagrpid;
var order = "ORDER BY " + (coo(G.mode + '_order') != false ? gs.coo(G.mode + '_order') : f.order.join(" "));
f.page = 'page' in f ? f.page : 1;
f.dateuserfrom = 'datefrom' in f ? f.page : "";
// console.log(f.dateuserfrom)
f.dateuserto = 'dateto' in f ? f.page : "";
$.ajax({
type: 'GET',
url: gs.ajaxfile,
data: {a: f.fetch[0], b: f.fetch[1], order: order, page: f.page, table: f.adata},
dataType: 'json',
success: function (data) {
// console.log(data[0].query)
// console.log(data)
if (data != 'No') {

                            for (var i in data) {
                                board += '<tr id="line' + data[i].id + '">';
                                for (var j in f.list) {
                                    row = 'row' in f.list[j] ? f.list[j].row : '';
                                    datarow = 'global' in f.list[j] ? f.list[j].global[data[i][row]] : data[i][row];
                                    type = 'type' in f.list[j] ? f.list[j].type : '';
                                    nature = 'nature' in f.list[j] ? f.list[j].nature : '';
                                    label = 'label' in f.list[j] ? f.list[j].label : row;
                                    query = 'query' in f.list[j] ? f.list[j].query : '';
                                    href = 'href' in f.list[j] ? (f.list[j].href) : '';
                                    event = 'event' in f.list[j] ? (f.list[j].event) : '';
                                    divid = row + data[i].id;
                                    //TYPES
                                    if (type == 'a') {
                                        if (nature != 'edit') {
                                            board += '<td><a href="' + gs.vareplace(href, data[i]) + '">' + data[i][row] + '</a></td>';
                                        } else {
                                            board += '<td><a href="' + gs.vareplace(href, data[i]) + '"><input id="' + divid + '" type="text" value="' + data[i][row] + '"></a></td>';
                                        }
                                    } else if (type == 'img') {
                                        // ids.push(data[i].id);
                                        // images=1;
                                        // mediagrpid = f.list[j].mediagrpid;
                                        board += '<td><img id="' + divid + '" src="' + (typeof data[i][row] != 'undefined' && data[i][row] != null ? gG.UPLOADS + data[i][row] : gs.siteurl + 'gaia/img/post.jpg') + '" width="30" height="30"></td>';
                                    } else if (type == 'button') {
                                        board += '<td><button id="' + divid + '" value="' + data[i].id + '" name="' + query + '" title="' + row + '" class="btn btn-default btn-xs" onclick="s.ui.table.execute(this.id,this.name,this.value,this.title)">' + label + '</button></td>';
                                    } else if (type == 'date') {
                                        board += '<td id="' + divid + '">' + gs.date('Y-m-d, H:i', datarow) + '</td>';
                                    } else {
                                        if (nature != 'edit') {
                                            board += '<td id="' + divid + '"><span id="' + divid + '">' + datarow + '</span></td>';
                                        } else {
                                            board += '<td><input ' + divid + '" type="text" value="' + datarow + '"></td>';
                                        }
                                    }
                                }
                                board += '</tr>';
                            }
                            const boardElement = document.querySelector(board);
                            const container = document.getElementById(f.adata);

                            if (boardElement && container) {
                                container.appendChild(boardElement);
                            }
                        } else {
                            gs.ui.reset('#pagination');
                            // Create a new <tr> element
                            const newRow = document.createElement('tr');
                            newRow.textContent = 'No results!';
// Select the target container
const container = document.getElementById(f.adata);

                            if (container) {
                                container.appendChild(newRow);
                            }
                        }

                        //APPEND SORT, COUNTER, PAGINATION
                        // Update the counter text
                        const counter = document.getElementById('counter');
                        if (counter) {
                            counter.textContent = data[0].count;
                        }

// Update the order label text
const orderLabel = document.getElementById('order_label');
if (orderLabel) {
orderLabel.textContent = order + " - page: " + f.page;
}

                        if (typeof (data[0].count) != 'undefined') {
                            gs.ui.pagination.get(f.pagenum, data[0].count, gG.is.pagin);
                        }

                        //if img exist
                        // if(images==1) {
                        //     gs.ui.table.get_imgs({ids: ids.join(","), mediagrpid: mediagrpid});
                        // }

                    },
                    error: function (xhr, status, error) {
                        console.log(error);
                        console.log(xhr.textStatus)
                        console.log('error ' + status);
                    }
                });

            },
            editable: function (id) {
                // console.log(id)
                // Find the <td> element with the specified ID
                const cell = document.querySelector('td[id="' + id + '"]');
                if (cell) {
                    // Create the new input element
                    const input = document.createElement('input');
                    input.id = id;
                    input.value = 'drosakis111';

                    // Clear the existing content and append the new input element
                    cell.innerHTML = '';
                    cell.appendChild(input);
                }

            }
        },
        checkedAll: function (form) {
            var checked = false;
            var aa = document.getElementById('form');
            if (checked == false) {
                checked = true
            } else {
                checked = false
            }
            for (var i = 0; i < aa.elements.length; i++) {
                aa.elements[i].checked = checked;
            }
        },
        /*
         data[0] : direction : previous || next
         data[1] : db table to check for direction
         data[2] : get parameter
         data[3] : current get value
         data[4] : redirect body
         */
        goto: function (data) {
            var index, direct, value = parseInt(data[3]);

            gs.db().func('fetchList1', data[2] + ',' + data[1] + ',' + 'ORDER BY id', function (list) {
                //  console.log(list)
                if (typeof (data[0]) != 'number') {
                    for (var i = 0; i < list.length; i++) list[i] = parseInt(list[i], 10);
                }
                index = list.indexOf(value);
                if (index >= 0 && index < list.length) {
                    if (data[0] == 'previous') {
                        direct = typeof list[index - 1] != 'undefined' ? list[index - 1] : list[list.length - 1];
                    } else if (data[0] == 'next') {
                        direct = typeof list[index + 1] != 'undefined' ? list[index + 1] : list[0];
                    }
                }
                location.href = data[4] + direct;
            });
        },

        //insert a div with id in a div to make it draggable with the #main_window
        modal : function(options) {
            const defaults = { title: "", message: "Message!", closeButton: true, scrollable: false };
            const settings = Object.assign({}, defaults, options);

            const modal = document.createElement('div');
            modal.id = 'printModal';
            modal.classList.add('modal'); // Assuming you have CSS for a '.modal' class

            // Use template literals for more readable HTML
            modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              ${settings.title ? `<h4 class="modal-title">${settings.title}</h4>` : ''}
              <button type="button" class="close" data-dismiss="modal">×</button>
            </div>
            <div class="modal-body" ${settings.scrollable ? 'style="max-height: 420px; overflow-y: auto;"' : ''}> 
              ${settings.message} 
            </div>
            ${settings.closeButton ? `
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
            </div>` : ''}
          </div>
        </div>
        `;

            document.body.prepend(modal);
            // Modal Show/Hide Functionality (without Bootstrap.js)
            modal.style.display = 'block'; // Show modal

            const closeButton = modal.querySelector('.close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    modal.style.display = 'none';  // Hide modal
                });
            }
            // Close modal when clicking outside the content area
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });

            // Add Print Functionality (if needed)
            const printButton = modal.querySelector('.print-button');
            if (printButton && settings.printButton) {
                printButton.addEventListener('click', () => {
                    // ... implement print logic for the modal content ...
                });
            }
        },
        //type :  info |  danger | success | warning
        notify: function (type, title, message, url) {
            $.notify({
                // options
                icon: 'glyphicon glyphicon-' + type + '-sign',
                title: title,
                message: message,
                url: url,
                target: '_blank'
            }, {
                // settings
                element: 'body',
                position: null,
                type: type,
                allow_dismiss: true,
                newest_on_top: false,
                showProgressbar: false,
                placement: {
                    from: "bottom",
                    align: "left"
                },
                offset: 20,
                spacing: 10,
                z_index: 1031,
                delay: 5000,
                timer: 1000,
                url_target: '_blank',
                mouse_over: null,
                animate: {
                    enter: 'animated fadeInDown',
                    exit: 'animated fadeOutUp'
                },
                onShow: null,
                onShown: null,
                onClose: null,
                onClosed: null,
                icon_type: 'class',
                template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                    '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
                    '<span data-notify="icon"></span> ' +
                    '<span data-notify="title">{1}</span> ' +
                    // '<span data-notify="message">{2}</span>' +
                    '<div class="progress" data-notify="progressbar">' +
                    '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                    '</div>' +
                    (!url ? '' : '<a href="{3}" target="{4}" data-notify="url"></a>') +
                    '</div>'
            });
        },
        notification: {
            permission: function () {
                // Let's check if the browser supports notifications
                if (!("Notification" in window)) {
                    console.log("This browser does not support desktop notification");
                }

                // Let's check whether notification permissions have already been granted
                else if (Notification.permission === "granted") {
                    // If it's okay let's create a notification
                    console.log('notication granted');
                }

                // Otherwise, we need to ask the user for permission
                else if (Notification.permission !== "denied") {
                    Notification.requestPermission(function (permission) {
                        // If the user accepts, let's create a notification
                        if (permission === "granted") {
                            console.log('notication granted');
                            // var notification = new Notification("Hi there!");
                        }
                    });
                }

                // At last, if the user has denied notifications, and you
                // want to be respectful there is no need to bother them any more.
                Notification.requestPermission().then(function (result) {
                    console.log(result);
                });
            },
            set: function (activity, body, icon, title, link) {
                var n;
                var link = link;
                if (activity == 1) {
                    var options = {
                        body: body,
                        icon: icon
                    };
                    n = new Notification(title, options);
                    n.onclick = function () {
                        window.open(link);
                    };
                } else if (activity == 0) {
                    if (typeof (n) != 'undefined') n.close();
                }
            },
            unset: function () {

            }
        },
        pagination2: function (current, total_results, results_per_page) {
            var current = parseInt(current);
            var last = Math.ceil(total_results / results_per_page);
            var previous = current != 1 ? '<button id="page_' + (parseInt(current) - 1) + '" class="glyphicon glyphicon-chevron-left"></button>' : '';
            var firstb = '<button id="page_1">1</button>';
            var list = '';
            var starting = current <= 5 ? 2 : current - 4;
            var ending = last < 10 ? last : (current <= 5 ? 10
                    : (
                        current == last
                            ? last :
                            (
                                last - current >= 4
                                    ? current + 4
                                    : current + (last - current)
                            )
                    )
            );
            for (var i = starting; i <= ending; i++) {
                list += '<button id="page_' + i + '">' + i + '</button>';
            }
            // var lastb = last >= 10 && current!=last ? '<button id="page_'+last+'">Last</button>':'';
            var lastb = '';
            var next = current != last ? '<button id="page_' + (parseInt(current) + 1) + '" class="glyphicon glyphicon-chevron-right"></button>' : '';
            var pagination = '<div class="pagin">' + previous + firstb + list + lastb + next + '</div>';

            const paginationElement = document.getElementById('pagination');
            if (paginationElement) {
                paginationElement.innerHTML = pagination; // Update the inner HTML
            }
            //set selected page
            $('#page_' + current).addClass('pageSelected'); //selected
        },
        pagination: {
            get: function (current, total_results, results_per_page, loopname) {
                var loopname = !loopname ? '' : loopname;
                gs.ui.reset('#pagination');
                var last = Math.ceil(total_results / results_per_page);
                var previous = current != 1 ? '<button value="' + loopname + '" onclick="s.ui.pagination.page(this)" id="page_' + (parseInt(current) - 1) + '" class="glyphicon glyphicon-chevron-left"></button>' : '';
                var firstb = '<button value="' + loopname + '" onclick="s.ui.pagination.page(this)" id="page_1">1</button>';
                var list = '';
                var starting = current <= 5 ? 2 : current - 4;
                var ending = last < 10 ? last : (current <= 5 ? 10 : (current == last ? last : (last - current >= 4 ? current + 4 : current + (last - current))));

                for (var i = starting; i <= ending; i++) {
                    list += '<button value="' + loopname + '" onclick="s.ui.pagination.page(this)" id="page_' + i + '">' + i + '</button>';
                }

                var lastb = last >= 10 && current != last ? '<button value="' + loopname + '" onclick="s.ui.pagination.page(this)" id="page_' + last + '">Last</button>' : '';
                var next = current != last ? '<button value="' + loopname + '" onclick="s.ui.pagination.page(this)" id="page_' + (parseInt(current) + 1) + '" class="glyphicon glyphicon-chevron-right"></button>' : '';

                $('#pagination').html('<div class="pagin">' + previous + firstb + list + lastb + next + '</div>');
                //set selected page
                $('#page_' + current).addClass('pageSelected'); //selected
            },
            page: function (obj) {
                var exp = gs.explode('_', obj.id);
                // gs.f.page = exp[1];
                // console.log(exp)
                gs.coo(obj.value + '_page', exp[1]);
                // gs.ui.reset('#' + gs.f.adata);
                gs.ui.reset('#' + obj.value);
                var name = obj.value + 'list';
                //	console.log(name);
                window[name]();
                //s.ui.list.get(obj.value);
                //s.ui.table.loop(s.f);
            }
        },
        reset: function (div) {
            $(div).html('');
        },
        set_attr: function (name, value, div) {
            var tag = _(div);
            var att = document.createAttribute(name);
            att.value = value;
            tag.setAttributeNode(att);
        },
        /*
         * Switcher hides/shows one/more divs
         * @div Array OR String ie toggles visibility of one/more divs with another
         * @display block, inline-block etc
         * @effect no effect just open-close, fade, slide
         * */
        switcher: function (div, effect, display = 'block') {
            if (Array.isArray(div)) {
                const [readid, editid] = div;
                const editElement = document.querySelector(editid);
                const readElement = document.querySelector(readid);

                if (getComputedStyle(readElement).display === 'none') {
                    if (effect) {
                        if (effect === 'fade') {
                            // Fade effect
                            editElement.style.transition = 'opacity 0.5s';
                            readElement.style.transition = 'opacity 0.5s';
                            editElement.style.opacity = '0';
                            readElement.style.opacity = '1';
                            setTimeout(() => {
                                editElement.style.display = 'none';
                                readElement.style.display = display;
                                readElement.style.opacity = ''; // Reset opacity for future transitions
                            }, 500); // Match the transition duration
                        } else {
                            // Other effects, assume not predefined
                            editElement.style.display = 'none';
                            readElement.style.display = display;
                        }
                    } else {
                        editElement.style.display = 'none';
                        readElement.style.display = display;
                    }
                } else {
                    if (effect) {
                        if (effect === 'fade') {
                            // Fade out/in effect
                            readElement.style.transition = 'opacity 0.5s';
                            editElement.style.transition = 'opacity 0.5s';
                            readElement.style.opacity = '0';
                            editElement.style.opacity = '1';
                            setTimeout(() => {
                                readElement.style.display = 'none';
                                editElement.style.display = display;
                                editElement.style.opacity = ''; // Reset opacity for future transitions
                            }, 500); // Match the transition duration
                        } else {
                            // Other effects, assume not predefined
                            readElement.style.display = 'none';
                            editElement.style.display = display;
                        }
                    } else {
                        readElement.style.display = 'none';
                        editElement.style.display = display;
                    }
                }
            } else {
                const editElement = document.querySelector(div);
                if (getComputedStyle(editElement).display === 'none') {
                    if (!effect) {
                        editElement.style.display = display;
                    } else if (effect === 'fade') {
                        // Fade in effect
                        editElement.style.transition = 'opacity 0.5s';
                        editElement.style.opacity = '1';
                        editElement.style.display = display;
                        setTimeout(() => {
                            editElement.style.opacity = ''; // Reset opacity for future transitions
                        }, 500); // Match the transition duration
                    } else if (effect === 'slide') {
                        // Slide effect (simplified example)
                        editElement.style.transition = 'max-height 0.5s ease-out';
                        editElement.style.maxHeight = editElement.scrollHeight + 'px';
                        editElement.style.overflow = 'hidden';
                        setTimeout(() => {
                            editElement.style.display = display;
                            editElement.style.maxHeight = '';
                        }, 500); // Match the transition duration
                    }
                } else {
                    if (!effect) {
                        editElement.style.display = 'none';
                    } else if (effect === 'fade') {
                        // Fade out effect
                        editElement.style.transition = 'opacity 0.5s';
                        editElement.style.opacity = '0';
                        setTimeout(() => {
                            editElement.style.display = 'none';
                            editElement.style.opacity = ''; // Reset opacity for future transitions
                        }, 500); // Match the transition duration
                    } else if (effect === 'slide') {
                        // Slide effect (simplified example)
                        editElement.style.transition = 'max-height 0.5s ease-in';
                        editElement.style.maxHeight = editElement.scrollHeight + 'px';
                        setTimeout(() => {
                            editElement.style.display = 'none';
                            editElement.style.maxHeight = '';
                        }, 500); // Match the transition duration
                    }
                }
            }
        },
//table produces TABLES- * type:  a | img | button | date * update if img gs.db().func, add hidden mediagrp
tree: function () {
// Hide all subfolders at startup
document.querySelectorAll(".filedir UL").forEach(ul => ul.style.display = 'none');
// Expand/collapse on click
document.querySelectorAll(".tree-dir A").forEach(anchor => {
anchor.addEventListener('click', function (event) {
const ul = this.parentNode.querySelector("UL:first-of-type");
if (ul) {
ul.style.transition = 'max-height 0.3s ease'; // Add transition for slide effect
if (ul.style.display === 'none') {
ul.style.display = 'block';
ul.style.maxHeight = ul.scrollHeight + 'px'; // Set maxHeight for slide down
} else {
ul.style.maxHeight = '0'; // Set maxHeight to 0 for slide up
setTimeout(() => {
ul.style.display = 'none'; // Hide element after sliding up
}, 300); // Match transition duration
}
}
if (this.parentNode.classList.contains('tree-dir')) {
event.preventDefault();
}
});
});
},
viewer: {
img: function () {
// Collect all image URLs
const hrefs = [];
const pattern = /^(http|https|ftp)/;  // Exclude https
document.querySelectorAll('.viewImage').forEach(function (el) {
const href = el.getAttribute('href');
if (href !== '/admin/img/myface.jpg' && href !== '') {
hrefs.push(href);
}
});
// Remove duplicates
const uniqueHrefs = [...new Set(hrefs)];

                // Open modal image viewer
                document.addEventListener('click', function (e) {
                    if (e.target.matches('.viewImage, .viewVideo')) {
                        e.preventDefault();
                        const imgHref = e.target.getAttribute('href');
                        const imgid = e.target.parentElement.getAttribute('id');

                        // Get index of current image
                        const index = uniqueHrefs.indexOf(imgHref);

                        // Create modal HTML
                        const modalHtml = `
                    <div class="myPhotosGallery" id="modal${imgid}">
                        <div id="prev_${imgid}" class="arrowGalleryL"></div>
                        <img id="img_${imgid}" src="${imgHref}" width="100%">
                        <div id="next_${imgid}" class="arrowGalleryR"></div>
                        <div class="viewTitle"></div>
                    </div>`;

                        // Create and display the modal
                        const modal = document.createElement('div');
                        modal.innerHTML = modalHtml;
                        modal.classList.add('modal');
                        document.body.appendChild(modal);

                        // Set title with image counter
                        const viewCounter = document.getElementById('viewCounter');
                        viewCounter.textContent = `${index + 1} / ${uniqueHrefs.length}`;
                    }
                });

                // Handle image navigation (left/right)
                document.addEventListener('click', function (e) {
                    if (e.target.matches('.arrowGalleryR, .arrowGalleryL')) {
                        const imgid = e.target.parentElement.getAttribute('id').replace('modal', '');
                        const img = document.getElementById(`img_${imgid}`);
                        const href = img.getAttribute('src');

                        // Get current index and direction
                        const index = uniqueHrefs.indexOf(href);
                        const direction = e.target.classList.contains('arrowGalleryR') ? 'R' : 'L';

                        // Calculate new index
                        const newIndex = direction === 'R'
                            ? (index === uniqueHrefs.length - 1 ? 0 : index + 1)
                            : (index === 0 ? uniqueHrefs.length - 1 : index - 1);

                        // Update image and counter
                        document.getElementById('viewCounter').textContent = `${newIndex + 1} / ${uniqueHrefs.length}`;
                        img.style.opacity = 0;
                        setTimeout(function () {
                            img.setAttribute('src', uniqueHrefs[newIndex]);
                            img.style.opacity = 1;
                        }, 300); // Match transition duration
                    }
                });
            }
        },        /*
         * PDF VIEWER - DOWNLOADER
         * just add the class view-pdf and follow this time of format
         * <a class="printGrey  btn-primary view-pdf" href="https://"+document.domain+"/print/post.php?uname=upvolume&amp;pname=art18" id="print_12183" title="art18"></a>
         *
         * */
        pdf: function () {
            document.addEventListener('click', function (e) {
                if (e.target.matches('.view-pdf')) {
                    e.preventDefault();

                    var pdfLink = e.target.getAttribute('href');
                    var iframe = `<div class="iframe-container"><iframe src="${pdfLink}" width="100%" height="600px"></iframe></div>`;

                    // Create modal
                    var modal = document.createElement('div');
                    modal.classList.add('modal');
                    modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${e.target.getAttribute('title')}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${iframe}
                    </div>
                    <div class="modal-footer">
                        <button class="print-button">Print</button>
                    </div>
                </div>`;

                    document.body.appendChild(modal);

                    // Print button capabilities
                    modal.querySelector('.print-button').addEventListener('click', function () {
                        var iframe = modal.querySelector('iframe');
                        iframe.contentWindow.print();
                    });

                    // Close button capabilities
                    modal.querySelector('.modal-close').addEventListener('click', function () {
                        document.body.removeChild(modal);
                    });

                    return false;
                }
            });
        }
    },

    /**
     ActivityManager
     notification manager from ermis system
     USAGE: gs.activity.init();
     */
    activity : {
        maxVisibleActivities: 5,
        totalActivitiesToShow: 10,
        activities: [],
        activitySet: new Set(),
        currentIndex: 0,

        init() {
            document.getElementById('show-more-btn').addEventListener('click', () => {
                this.toggleActivityVisibility();
            });
        },

        add(text) {
            if (this.activitySet.has(text)) {
                console.log('Activity already exists, skipping:', text);
                return;
            }

            const activityList = document.getElementById('activity-list');
            const newActivity = document.createElement('div');
            newActivity.classList.add('activity');
            newActivity.textContent = text;

            // Prepend new activity to the start of the list
            activityList.insertBefore(newActivity, activityList.firstChild);

            this.activities.unshift(newActivity); // Add to the start of the array
            this.activitySet.add(text);

            // Remove the oldest activity if the total number exceeds the limit
            if (this.activities.length > this.totalActivitiesToShow) {
                const removed = this.activities.pop(); // Remove from the end of the array
                this.activitySet.delete(removed.textContent);
                removed.remove();
            }

            this.updateVisibility();
        },

        updateVisibility() {
            const visibleActivities = this.activities.slice(this.currentIndex, this.currentIndex + this.maxVisibleActivities);
            const hiddenActivities = this.activities.slice(this.currentIndex + this.maxVisibleActivities);

            visibleActivities.forEach(activity => activity.style.display = 'block');
            hiddenActivities.forEach(activity => activity.style.display = 'none');

            // Adjust button text based on visibility
            const showMoreBtn = document.getElementById('show-more-btn');
            if (hiddenActivities.length === 0) {
                showMoreBtn.textContent = '▲ Show Less';
            } else {
                showMoreBtn.textContent = '▼ Show More';
            }
        },

        toggleActivityVisibility() {
            this.currentIndex += this.maxVisibleActivities;
            if (this.currentIndex >= this.activities.length) {
                this.currentIndex = 0; // Reset to show from the beginning if reached end
            }
            this.updateVisibility();
        }
    }
};

    /**
API
access executes core.maria method
USAGE:
*/
const baseApi = {
_request: async (fun, query, params, database) => {
const pms = { query, params: params || [] };
const url= `${G.SITE_URL}api/v1/${database}/${fun}`;
console.log(pms);
console.log(url);
try {
const response = await fetch(url, {
method: 'POST',
body: JSON.stringify(pms),
headers: { 'Content-Type': 'application/json' }
});
if (!response.ok) {
throw new Error('HTTP error ' + response.status);
}
const jsonData = await response.json();
return jsonData;
} catch (error) {
console.error('Error:', error);
throw error; // Re-throw error to be caught by caller
}
}
};

gs.api = gs.api || {};
const databases = ['maria','gpm'];
// Methods to assign
const methods = ['fa', 'f', 'fl','inse', 'q','columns','form'];
// Dynamically assign to each database
databases.forEach((db) => {
gs.api[db] = Object.assign({}, baseApi);
methods.forEach((method) => {
gs.api[db][method] = async (query, params) => { // Add `async` here
return await gs.api[db]._request(method, query, params, db);
};
});
});

## ADMIN NAVIGATION

##CORE.maria
<?php
namespace Core;
use PDO;
use PDOException;

class Maria {
    public $_db;
    public $confd;
	//connect to maria/mysql
    public function __construct(string $database = ''){
            $dbhost="localhost";
            $dbuser="root";
            $dbpass="n130177!";
            try	{
                //mysql:unix_socket=/var/run/mysqld/mysqld.sock;charset=utf8mb4;dbname=$dbname
                $this->_db = new PDO("mysql:host=$dbhost;dbname=$database",$dbuser,$dbpass,
                    array(
                        PDO::ATTR_ERRMODE,
                        PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_EMULATE_PREPARES => FALSE,
                        PDO::MYSQL_ATTR_USE_BUFFERED_QUERY,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'",
                        PDO::ATTR_PERSISTENT => true
                    ));

            }	catch(PDOException $error)	{
             if ($e->getCode() == 23000) {
                    // Handle duplicate entry error specifically
                    echo "Warning: Duplicate entry for 'name'. Please try a different value or update existing one.";
                    }else{
               throw new Exception("Database connection failed: " . $error->getMessage());
               }
            }
    }

	//setting table
	public   function is(string $name): bool|string{
		$fetch = $this->db->f("SELECT val FROM gen_admin.globs WHERE name=?", array($name));
		if (!empty($fetch)) {
			return urldecode($fetch['val']);
		} else {
			return false;
		}
	}
    /*
     *	Fetch MANY result
     *	Updated with memcache
     */
    public function fjsonlist($query){
        $res=$this->fa($query);		
		if (!$res) {
			return FALSE;
		}else{
			$tags=array();
			for($i=0;$i<count($res);$i++){	
				if($res[$i]['json']!='[]'){
				$jsdecod=json_decode($res[$i]['json'],true);
			if(!empty($jsdecod)){
				foreach($jsdecod as $jsid => $jsval){		
					$tags[]=trim($jsval);
						}
			}
					}		
			}
		return $tags;
		}
        $res->closeCursor();
    }
    /*
   * INSERT WITH RETURN ID ,
   * UPDATE
   * A) RETURNS FALSE,
   * B) Autoincrement with NULL or insert $id NO NEED FOR fetchMax function  
   * c) NO NEED FOR QUESTIONMARKS
     * This function   works only if we insert all params except id
     * sequential array = array('apple', 'orange', 'tomato', 'carrot');
     * associative array = array('fruit1' => 'apple',
                    'fruit2' => 'orange',
                    'veg1' => 'tomato',
                    'veg2' => 'carrot');
     * if we want to insert specified number of params we need array('uid'=>$uid,'content'=>$content,etc)
   * */
    public function inse(string $table, array $params = array(),$id=NULL): int|bool|null{
        $qmk = implode(',', array_fill(0, count($params), '?'));
        if (is_assoc($params)) {
            $rows = $k = '(' . implode(',', array_keys($params)) . ')';
            $values = "$rows VALUES ($qmk)";
            $params = array_values($params);
        } else {
            $values = count($params) != count($this->columns($table)) && $id != NULL ? "VALUES ($id,$qmk)" : "VALUES ($qmk)";
        }
        $sql= "INSERT INTO $table $values";
        try {
                $res = $this->_db->prepare($sql);
                $res->execute($params);
                if (!$res){return false;}else{
                return !$this->_db->lastInsertId() ? true: $this->_db->lastInsertId(); //CASE OF CORRECT INSERT BUT WITH NO RETURN VALUE (eg NO ID table)
                }
            } catch (PDOException $e) {
               if ($e->getCode() == 23000) {
                    echo "Duplicate entry found for 'name'. Entry was not added.";
                } else {
                    echo "Database error occurred: " . $e->getMessage();
                }
            }
    }
    /*
get max value from table
*/
    public function fetchMax(string $row, string $table, $clause = ''): int{
        $selecti = $this->f("SELECT MAX($row) as max FROM $table $clause");
        return $selecti['max'];
    }

    /*
     *
     * meta retuns table all columns and types
     * LONG -> int
     * TINY ->tinyint
     * VAR_STRING ->varchar
     * STRING -> char
     * INT24 -> mediumint
     * */
	 public function listTables():array{
        $query = $this->_db->query('SHOW TABLES');
        return $query->fetchAll(PDO::FETCH_COLUMN);
    }

    public function types($table){
        $sel=array();
        $select = $this ->_db->query("SELECT * FROM $table");
        foreach($this->columns($table) as $colid => $col) {
            $meta= $select->getColumnMeta($colid);
            $sel[$meta['name']] = $meta['native_type'];
        }
        return $sel;
    }

    public function  comments(string $table): array{
        $sel=array();
        foreach($this->columns($table) as $colid => $col) {
            $select = $this->f("SHOW full columns from $table WHERE Field='$col'");
            $sel[$select['Field']] = $select['Comment'];
        }
        return $sel;
    }
    /*
     * RETURN TABLE char, varchar, text types
     *
     * */
    public function  char_types($table){
        $res = $this->types($table);
        foreach($res as $col => $type){
            if(in_array($type,array('VAR_STRING','STRING','BLOB'))){
                $cols[] = $col;
            }
        }
        return $cols;
    }

    public function  maria_con(string $dbhost,string $dbname,string $dbuser,string $dbpass){
        try	{
			//mysql:unix_socket=/var/run/mysqld/mysqld.sock;charset=utf8mb4;dbname=$dbname
            return new PDO("mysql:host=$dbhost;dbname=$dbname",$dbuser,$dbpass,
                array(
                    PDO::ATTR_ERRMODE,
                    PDO::ERRMODE_EXCEPTION,
                    PDO::ERRMODE_WARNING,
                    PDO::ATTR_EMULATE_PREPARES => FALSE,
					PDO::MYSQL_ATTR_USE_BUFFERED_QUERY,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'",
                    PDO::ATTR_PERSISTENT => false
                ));

        }	catch(PDOException $error)	{
            return $error->getCode();
        }

    }
	public function  create_db(string $dbname,string $dbhost,string $dbuser,string $dbpass){
	try {
		$this->_db = new PDO("mysql:host=$dbhost", $dbuser, $dbpass);
		$this->_db->exec("CREATE DATABASE `$dbname`;
				CREATE USER '$dbuser'@'localhost' IDENTIFIED BY '$dbpass';
				GRANT ALL ON `$dbname`.* TO '$dbuser'@'localhost';
				FLUSH PRIVILEGES;") 
		or die(print_r($this->_db->errorInfo(), true));

	} catch (PDOException $e) {
		die("DB ERROR: ". $e->getMessage());
	}
}
    /*
     * BASIC function
     * f FETCH
     * fa FETCH ALL
     * q QUERY (INSERT AND UPDATE)
     * INS
     * exec
    */
    public function exec(string $q){
		 $s= $this->_db->exec($q);
		 return $s;
	}
	/*
	api flaw, executes even if I pass update , so it needs validation
	*/
   public function f(string $q, array $params = []): array|string|bool {
       $queryType = strtoupper(strtok(trim($q), ' ')); // Get the first word of the query
       if ($queryType !== 'SELECT') {
           // If it's not a SELECT query, return an error or handle it accordingly
           return FALSE;
       }
            $res = $this->_db->prepare($q);
            $res->execute($params);
            if (!$res) return FALSE;
            return $res->fetch(PDO::FETCH_ASSOC);
    }
    /*
    *	Fetch MANY result
    *	Updated with memcache
    */
    public function fa(string $q, array $params = array()): bool|array    {
           $queryType = strtoupper(strtok(trim($q), ' ')); // Get the first word of the query
        if ($queryType !== 'SELECT') {
                   return FALSE;
               }
		$res = $this->_db->prepare($q);
            $res->execute($params);
		if(!$res) return FALSE;
            return $res->fetchAll(PDO::FETCH_ASSOC);
    }

    /*
    *Query Method replaces standard pdo query method
    Usage: with	INSERT, UPDATE, DELETE queries
    updated $q validation for API flows
    */
    public function q(string $q, array $params = []): bool {
           $queryType = strtoupper(strtok(trim($q), ' ')); // Get the first word of the query
    if ($queryType !== 'UPDATE' && $queryType !== 'INSERT' && $queryType !== 'DELETE') {
               return FALSE;
           }
            $res = $this->_db->prepare($q);
            $res->execute($params);
            if (!$res)return FALSE;            
            return true;
    }
    //count_ results
    public function count_(string $rowt, $table, $clause = null, $params = array()): ?int {
            $result = $this->_db->prepare("SELECT COUNT($rowt) FROM $table $clause");
            $result->execute($params);
            if (!$result) return FALSE;
            return $result->fetchColumn();
    }

    //count_ results
    public function counter(string $query = null, $params = array()){
            $result = $this->_db->prepare($query);
            $result->execute($params);
            if (!$result) return FALSE;
            return $result->fetchColumn();
    }

    public function columns(string $table, bool $list=false): ?array{
	//	return array_keys(jsonget(GAIAROOT."schema.json")[$table]);
        $q = $this->_db->prepare("DESCRIBE $table");
        $q->execute();		
        return $list ? $q->fetchAll(PDO::FETCH_COLUMN) : $q->fetchAll(PDO::FETCH_ASSOC);
    }
    /*
create key->value list with two rows from database
    fPairs to replace fetchCoupleList
    UPDATE WITH PDO::FETCH_KEY_PAIR
    NEW METHOD 1
*/
    public function  fPairs(string $row1, string $row2, string $table, $clause = ''): ?array {
        return $this->_db->query("SELECT $row1,$row2 FROM $table $clause")->fetchAll(PDO::FETCH_KEY_PAIR);
    }

/*
  fUnique SELECT uid,cv.* FROM cv returns [uid]=>array(id=1,title=asdfdsf)
  for cases we want unique id to avoid for loops
  NEW METHOD 2
 * */
    public function  fUnique(string $query): ?array {
        return $this->_db->query($query)->fetchAll(PDO::FETCH_UNIQUE);
    }
    /*
      fGroup SELECT uid,id,title FROM cv returns
      [uid]=>array(
             [0]=>(id=1,title=asdfdsf)
             [1]=>
      good for nested arrays to avoid for loops
      NEW METHOD 3
     * */
    public function  fGroup($query): ?array {
        return $this->_db->query($query)->fetchAll(PDO::FETCH_GROUP);
    }
    /*
      fPairs to replace fetchList and fetchRowList
      returns a simple array list
      NEW METHOD 4
     * */
    public function  fList(string|array $rows, string $table, $clause = ''): ?array {
        return $this->_db->query("SELECT $rows from $table $clause")->fetchAll(PDO::FETCH_COLUMN);
    }

    //FAST NEW function   FROM CMS CLASS
    //update of fetchRowList and fetchCoupleList
    public function  fetchList($rows, string $table, $clause=''): ?array {
        $list=array();
        //fetchRowList
        if(is_array($rows)){
            $row1=$rows[0];$row2=$rows[1];
            $fetch=$this->fa("SELECT $row1,$row2 FROM $table $clause");
            if(!empty($fetch)) {
                $row1 = strpos($row1, '.') !== false ? explode('.', $row1)[1] : $row1;
                $row2 = strpos($row2, '.') !== false ? explode('.', $row2)[1] : $row2;
                for ($i = 0; $i < count($fetch); $i++) {
                    $list[$fetch[$i][$row1]] = $fetch[$i][$row2];
                }
            }else{return false;}
            //fetchCoupleList
        }else{
            $fetch=$this->fa("SELECT $rows FROM $table $clause");
            if(!empty($fetch)) {
                for ($i = 0; $i < count($fetch); $i++) {
                    $list[] = $fetch[$i][$rows];
                }
            }else{return false;}
        }
        return $list;
    }

    public function truncate(string $table){
            $q = $this->_db->exec("TRUNCATE TABLE $table");
    }

    public function fetchList1(array $rows): ?array{
        if(is_array($rows)){
            $fetch=$this->fa("SELECT {$rows[0]} FROM {$rows[1]} {$rows[2]}");
            for($i=0;$i<count($fetch);$i++){
                $list[]=strpos($rows[0], '.') !== false	? $fetch[$i][explode('.',$rows[0])[1]] : $fetch[$i][$rows[0]];
            }
        }
        return $list;
    }
    //update of fetchRowList and fetchCoupleList
    public function fl(string|array $rows, string $table, $clause=''): bool|array{
            $list = array();
            //fetchRowList
            if (is_array($rows)) {
                //fetchCoupleList
                $row1 = $rows[0];
                $row2 = $rows[1];
                $fetch = $this->fa("SELECT $row1,$row2 FROM $table $clause");
                if (!empty($fetch)) {
                    for ($i = 0; $i < count($fetch); $i++) {
                        $list[$fetch[$i][$row1]] = $fetch[$i][$row2];
                    }
                    return $list;
                } else {
                    return false;
                }
            } else {
      //FETCHrOWLIST
                $fetch = $this->fa("SELECT $rows FROM $table $clause");
                if (!empty($fetch)) {
                    for ($i = 0; $i < count($fetch); $i++) {
                        $list[] = $fetch[$i][$rows];
                    }
                    return $list;
                } else {
                    return false;
                }
            }
    }

    //only for maria
    protected function trigger_list(){
        $triggers = $this->fetchAll("SHOW TRIGGERS");
        $list=array();
        if(!empty($triggers)) {
            for ($i = 0; $i < count($triggers); $i++) {
                $list[] = $triggers[$i]['Trigger'];
            }
        }
        return $list;
      }

  public function form(array $form, array $params=[]): int|false {
          // 1. Get table name from form data
          $table = $form['table'] ?? '';
          if (empty($table)) {
              error_log("Error: Missing 'table' parameter in form data.");
              return false;
          }
          // 2. Remove the 'table' element from the data to be inserted
          unset($form['table']);
          unset($form['a']);
        //  $sanitizedForm = $this->sanitizeFormData($form);
          return $this->inse($table,$form);
      }

       private function sanitizeFormData(array $form): array {
              $sanitizedData = [];
              foreach ($form as $key => $value) {
                  // Example: basic string sanitization (adapt as needed for your data types)
                  $sanitizedData[$key] = htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8');
              }
              return $sanitizedData;
          }

}


##ermis INDEX 
// index.js
const express = require('express');
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger.json");
const path = require('path'); // Import the path module
const config = require('./config.json');
const { setupWebSocket } = require('./services/ws');  // Import WebSocket setup function

//const openaiRouter = require('./services/openai/start');
//const aistudio = require('./services/aistudio/start');
//const huggingface = require('./services/huggingface/start');
const app = express();
const fs = require("fs"),
    {promisify} = require("util"),
    https = require('https'),
    cors = require("cors"),
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    bodyParser = require("body-parser");
const privateKey = fs.readFileSync('/etc/letsencrypt/live/'+config.domain+'/privkey.pem', 'utf8'),certificate = fs.readFileSync( '/etc/letsencrypt/live/'+config.domain+'/fullchain.pem', 'utf8'),credentials = {key: privateKey, cert: certificate};
const fun = require("./services/gaia/functions");

// Import the API routes
app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({credentials: true, origin: config.whitelist}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.use(bodyParser.urlencoded({limit: '300mb', extended: true}));
app.use(express.json());


//resources
const apiRouter = require('./services/gaia/start');
const timetableRouter = require('./services/timetable/timetableRouter');
const openaiRoutes = require('./services/openai/routes');
const aistudio = require('./services/aistudio/routes');
const botpressRouter = require('./services/botpress/test1'); // Import the Botpress route
const huggingface = require('./services/huggingface/start'); // Import the Botpress route
const test = require('./services/test/start'); // Import the Botpress route
const rapidapi = require('./services/rapidapi/start'); // Import the Botpress route

//includes
app.use('/ermis/v1/gaia',apiRouter);
app.use('/ermis/v1/timetable', timetableRouter);
app.use('/ermis/v1/openai', openaiRoutes);
app.use('/ermis/v1/chatgpt', aistudio);
app.use('/ermis/v1/botpress', botpressRouter); // Use Botpress route
app.use('/ermis/v1/hug', huggingface); // Use Botpress route
app.use('/ermis/v1/test', test); // Use test route
app.use('/ermis/v1/rapidapi', rapidapi); // Use test route
// Serve Swagger UI
app.use("/ermis/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//app.use('/ermis/v1/openai', openaiRouter);
//app.use('/ermis/v1/aistudio', aistudio);
//app.use('/ermis/v1/huggingface', huggingface);
//  AI Service Routes

//const watsonRoutes = require('./services/watson/routes');
// New routes for AI services
//app.use('/ermis/v1/watson', watsonRoutes);
//app.get('/chat', (req, res) => {
  //  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
//});

const server = https.createServer(credentials, app);
setupWebSocket(server);
server.listen("3010", function () {
    console.log('Server listening on port ' + "3010");
});

##GPY MAIN.PY
import redis
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from core.Maria import Maria
from pysolr import Solr
from config import settings

#resources
from services.cohere.routes import router as cohere_route
#from services.solr.routes import router as solr_route
from services.gemini.routes import router as gemini_route
#from services.tensorflow.routes import router as tensorflow_route
#from services.haystack.routes import router as haystack_route
#from services.langchain.routes import router as langchain_route
#from services.openai.routes import router as openai_route
from services.gaia.routes import router as gaia_route

#start fastapi
app = FastAPI(title="Gaia PYthon Resource (Kronos)",docs_url="/apy/v1/docs", redoc_url="/apy/v1/redoc",openapi_url="/apy/v1/openapi.json")
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis client
#redis_client = redis.Redis(host='localhost', port=6379, password='yjF1f7uiHttcp')

#includes
app.include_router(cohere_route, prefix="/apy/v1/cohere")
#app.include_router(solr_route, prefix="/apy/v1/solr")
app.include_router(gemini_route, prefix="/apy/v1/gemini")
#app.include_router(tensorflow_route, prefix="/apy/v1/tensorflow")
#app.include_router(haystack_route, prefix="/apy/v1/haystack")
#app.include_router(langchain_route, prefix="/apy/v1/langchain")
#app.include_router(openai_route, prefix="/apy/v1/openai")
app.include_router(gaia_route, prefix="/apy/v1/gaia")

#WSManager Initialize
#ws_manager = WSManager(settings.REDIS_URL)
#@app.websocket("/ws/{client_id}")
#async def websocket_endpoint(websocket: WebSocket, client_id: str):
#    await ws_manager.connect(websocket, client_id)
@app.on_event("startup")
async def startup():
    app.state.maria_vivalibro = Maria(settings.MARIA)
    app.state.maria_gpm = Maria(settings.MARIADMIN)
    app.state.solr = Solr(settings.DATABASE_SOLR_VIVALIBRO)

if __name__ == '__main__':
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,  # Enable auto-reload for development
        log_level=settings.LOG_LEVEL
    )


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