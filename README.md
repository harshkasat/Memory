# Memory: A Django-based Photo Album Application

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/harshkasat/Memory/actions/workflows/main.yml/badge.svg)](https://github.com/harshkasat/Memory/actions)


## 1. Project Overview

Memory is a Django web application designed for managing and organizing photo albums.  It allows users to upload, categorize, and view their photos.  The application provides a user-friendly interface for creating and managing personal photo collections.  This project aims to provide a robust and scalable solution for personal photo management.


## 2. Table of Contents

* [Project Overview](#project-overview)
* [Prerequisites](#prerequisites)
* [Installation Guide](#installation-guide)
* [Configuration](#configuration)
* [Project Architecture](#project-architecture)
* [Usage Examples](#usage-examples)
* [Contributing Guidelines](#contributing-guidelines)
* [License](#license)


## 3. Prerequisites

* Python 3.7 or higher
* pip (Python package installer)
* PostgreSQL (or another supported database;  the provided code suggests PostgreSQL is used)
* A virtual environment (recommended)
* Git (for cloning the repository)


## 4. Installation Guide

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshkasat/Memory.git
   cd Memory
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Migrate the database:**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser:**
   ```bash
   python manage.py createsuperuser
   ```  (Follow the prompts to set up your admin account)

6. **Run the development server:**
   ```bash
   python manage.py runserver
   ```


## 5. Configuration

The project uses a `settings.py` file for configuration.  Details about database settings, secret keys, and other configurations are found within this file.  You'll need to configure the database connection appropriately. The provided code snippets don't show explicit configuration details, but standard Django settings apply.  Ensure you have a properly configured database before running migrations.


## 6. Project Architecture

The project appears to be structured using the Model-View-Controller (MVC) architectural pattern, common in Django applications.  It's divided into several apps:

* **`account`:** Manages user accounts (including custom user model with email and profile picture).  This app includes models (`models.py`), serializers (`serializers.py`), views (`views.py`), and an admin registration (`admin.py`).  The `manager.py` file defines a custom user manager extending Django's `BaseUserManager`.

* **`album`:** Likely handles the album creation and management functionality.

* **`media`:** Probably manages the uploaded media files (images).

The `Memory` directory contains the main project settings and URLs.

## 7. Usage Examples

The provided code only shows the basic structure and setup.  Detailed usage examples would require more complete views and templates from the application.  The `manage.py` file is a standard Django management script.  The `account` app's `models.py` shows a custom user model with fields for username, email, profile picture, and timestamps.  The `manager.py` within the `account` app demonstrates a custom user manager for creating users and superusers.


```python
# Example from account/manager.py
class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        # ... (user creation logic) ...
```

## 8. Contributing Guidelines

(This section needs to be added based on the project's contribution policy.  It should include information on forking the repo, creating pull requests, and the project's code of conduct.)


## 9. License

(The project uses a MIT license as indicated by the badge.  The full license text should be included here.)


I am not sure about the specific features and functionalities beyond what's shown in the provided code snippets.  A more complete understanding requires examining the templates, views, and other parts of the application that were not included.
