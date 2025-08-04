# Shifty

## Description
Shifty is a web-based staff scheduling application that allows managers to create monthly schedules and gives staff easy online access to view their shifts. Built to replace error-prone spreadsheets with a reliable, user-friendly solution.

## Why?
This project was inspired by a real problem I witnessed: a Director of Nurses struggling with fragile Excel formulas that would corrupt their entire staff scheduling spreadsheet. This highlighted a widespread issue many managers face - spreadsheet-based scheduling is error-prone, and when formulas break, managers waste hours recreating schedules while staff remain uncertain about their shifts. Shifty eliminates this problem by providing a reliable, web-based alternative that abstracts complex scheduling logic into a user-friendly application.


## Quick Start
### Prerequisites & Setup
1. [Install NVM](docs/install-nvm.md)
2. [Install Node.js](docs/install-node-version.md) 
3. [Setup PostgreSQL](docs/setup-postgres.md)
4. [Configure Environment Variables](docs/environment-setup.md)

### Running the Application
1. Clone this repository
2. Install dependencies: `npm install`
3. Run database migrations: `npm run migrate`
4. Start the server: `npm start`
5. Visit `http://localhost:3000`