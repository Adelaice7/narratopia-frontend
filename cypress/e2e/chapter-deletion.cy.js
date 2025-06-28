describe('Chapter Deletion', () => {
  beforeEach(() => {
    // Login before each test
    cy.login()
  })

  it('should delete a chapter when user confirms deletion', () => {
    const projectName = 'Test Project for Chapter Deletion'
    const chapterTitle = 'Chapter to Delete'

    // Create a test project
    cy.createTestProject(projectName)
    
    // Navigate to the project
    cy.contains(projectName).click()
    cy.url().should('include', '/projects/')
    
    // Create a test chapter
    cy.createTestChapter(chapterTitle)
    
    // Verify chapter exists
    cy.contains(chapterTitle).should('exist')
    
    // Find the chapter and click the menu button
    cy.contains(chapterTitle)
      .parent()
      .find('[data-testid="chapter-menu-button"]')
      .click()
    
    // Click delete option
    cy.get('[data-testid="delete-chapter-menu-item"]').click()
    
    // Verify confirmation dialog appears
    cy.get('[data-testid="delete-chapter-dialog"]').should('be.visible')
    cy.contains('Confirm Deletion').should('exist')
    cy.contains(`Are you sure you want to delete the chapter "${chapterTitle}"`).should('exist')
    
    // Click Delete button in confirmation dialog
    cy.get('[data-testid="confirm-delete-chapter-button"]').click()
    
    // Verify chapter is deleted
    cy.contains(chapterTitle).should('not.exist')
    
    // Verify success message
    cy.contains('Chapter deleted successfully').should('exist')
  })

  it('should cancel chapter deletion when user cancels', () => {
    const projectName = 'Test Project for Cancel Deletion'
    const chapterTitle = 'Chapter to Keep'

    // Create a test project
    cy.createTestProject(projectName)
    
    // Navigate to the project
    cy.contains(projectName).click()
    cy.url().should('include', '/projects/')
    
    // Create a test chapter
    cy.createTestChapter(chapterTitle)
    
    // Verify chapter exists
    cy.contains(chapterTitle).should('exist')
    
    // Find the chapter and click the menu button
    cy.contains(chapterTitle)
      .parent()
      .find('[data-testid="chapter-menu-button"]')
      .click()
    
    // Click delete option
    cy.get('[data-testid="delete-chapter-menu-item"]').click()
    
    // Verify confirmation dialog appears
    cy.get('[data-testid="delete-chapter-dialog"]').should('be.visible')
    
    // Click Cancel button
    cy.get('[data-testid="cancel-delete-chapter-button"]').click()
    
    // Verify chapter still exists
    cy.contains(chapterTitle).should('exist')
    
    // Verify dialog is closed
    cy.get('[data-testid="delete-chapter-dialog"]').should('not.exist')
  })

  it('should handle chapter deletion error gracefully', () => {
    const projectName = 'Test Project for Error Handling'
    const chapterTitle = 'Chapter with Error'

    // Create a test project
    cy.createTestProject(projectName)
    
    // Navigate to the project
    cy.contains(projectName).click()
    cy.url().should('include', '/projects/')
    
    // Create a test chapter
    cy.createTestChapter(chapterTitle)
    
    // Intercept the delete API call to simulate an error
    cy.intercept('DELETE', '/api/chapters/*', {
      statusCode: 500,
      body: { success: false, message: 'Server error' }
    }).as('deleteChapterError')
    
    // Find the chapter and click the menu button
    cy.contains(chapterTitle)
      .parent()
      .find('[data-testid="chapter-menu-button"]')
      .click()
    
    // Click delete option
    cy.get('[data-testid="delete-chapter-menu-item"]').click()
    
    // Click Delete button in confirmation dialog
    cy.get('[data-testid="confirm-delete-chapter-button"]').click()
    
    // Wait for the API call
    cy.wait('@deleteChapterError')
    
    // Verify error message
    cy.contains('Failed to delete chapter').should('exist')
    
    // Verify chapter still exists
    cy.contains(chapterTitle).should('exist')
  })
})