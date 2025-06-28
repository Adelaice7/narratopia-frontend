// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login a user
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

// Custom command to create a test project
Cypress.Commands.add('createTestProject', (projectName = 'Test Project') => {
  cy.get('[data-testid="new-project-button"]').click()
  cy.get('input[name="title"]').type(projectName)
  cy.get('textarea[name="description"]').type('Test project description')
  cy.get('button[type="submit"]').click()
  cy.contains(projectName).should('exist')
})

// Custom command to create a test chapter
Cypress.Commands.add('createTestChapter', (chapterTitle = 'Test Chapter') => {
  cy.get('[data-testid="add-chapter-button"]').click()
  cy.get('input[name="title"]').type(chapterTitle)
  cy.get('button[type="submit"]').click()
  cy.contains(chapterTitle).should('exist')
})