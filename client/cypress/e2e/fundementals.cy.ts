const loginDemo = () => {
  cy.visit('http://localhost:5173/')
  cy.contains('Użyj logowania demo').click()
  cy.get('input[type="email"]').type('test@example.com')
  cy.get('input[placeholder="Imię"]').type('Jan')
  cy.get('input[placeholder="Nazwisko"]').type('Kowalski')
  cy.contains('Zaloguj').click()
  cy.contains('ManageMe')
}

describe('auth', () => {
  it('have welcome text', () => {
    cy.visit('http://localhost:5173/')
    cy.contains('Witaj w ManageMe').should('be.visible')
  })

  it('allows user to login via demo', () => {
    loginDemo()
  })

})


describe('adding things', () => {
  it('add, delete and modify project', () => {
    loginDemo()

    // 1. Wait for table to load, then delete all existing "TrackYourBuild" projects
    cy.get('table').should('be.visible')
    cy.wait(1000)

    const cleanup = () => {
      cy.get('body').then(($body) => {
        const $rows = $body.find('tr:contains("TrackYourBuild")');
        if ($rows.length > 0) {
          cy.wrap($rows.first()).find('[aria-label="delete"]').click({ force: true });
          cy.wait(1000);
          cleanup();
        }
      });
    };
    cleanup();

    // 2. Add
    cy.get('input[data-test="adding-things-project-name"]').type('TrackYourBuild')
    cy.get('[data-test="adding-things-project-info"]').type('aplikacja mobilna')
    cy.get('[data-test="adding-things-add-project-button"]').click()

    cy.contains('TrackYourBuild').should('be.visible')

    // Close notification
    cy.get('.fixed.bottom-10.left-10')
      .find('button')
      .first()
      .click({ force: true });
    cy.wait(1000)
    // 3. Edit 
    cy.contains('tr', 'TrackYourBuild').find('[aria-label="Edit"]').click()

    // Find the inputs directly (they only appear after the edit click)
    cy.get('[data-test="project-name-input"]')
      .should('be.visible')
      .clear()
      .type('TrackYourBuild-updated')

    cy.get('[data-test="project-description-input"]')
      .should('be.visible')
      .clear()
      .type('updated description')

    // Click the new save button with data-test
    cy.get('[data-test="save-button"]').click()

    cy.contains('TrackYourBuild-updated').should('be.visible')
    cy.get('table').should('contain', 'updated description')
  })


  it('add story to project and delete it', () => {
    loginDemo()

    // Ensure the table is loaded
    cy.get('table').should('be.visible')

    // Check if the project exists; if not, add it
    cy.get('body').then(($body) => {
      if (!$body.text().includes('TrackYourBuild')) {
        cy.get('input[data-test="adding-things-project-name"]').type('TrackYourBuild')
        cy.get('[data-test="adding-things-project-info"]').type('aplikacja mobilna')
        cy.get('[data-test="adding-things-add-project-button"]').click()
      }
    })

    // Navigate to the project
    cy.contains('tr', 'TrackYourBuild')
      .find('[aria-label="viewProject"]')
      .should('be.visible')
      .click()

    // Verify navigation
    cy.url().should('include', '/project')
    cy.contains('TrackYourBuild').should('be.visible')

    cy.wait(1000)

    const cleanupStories = () => {
      cy.get('body').then(($body) => {
        const $rows = $body.find('tr:contains("TestStory")');
        if ($rows.length > 0) {
          cy.wrap($rows.first()).find('[aria-label="Delete"]').click({ force: true });
          cy.wait(1000);
          cleanupStories();
        }
      });
    };
    cleanupStories();

    // Add a story
    cy.get('[data-test="story-create-title-input"]').type('TestStory')
    cy.get('[data-test="story-create-description-input"]').type('initial description')
    cy.get('[data-test="story-create-add-button"]').click()

    cy.contains('TestStory').should('be.visible')
    cy.wait(500)

    // Edit the story
    cy.contains('tr', 'TestStory').find('[aria-label="Edit"]').click()

    cy.get('[data-test="story-edit-title-input"]')
      .should('be.visible')
      .clear()
      .type('TestStory-updated')

    cy.get('[data-test="story-edit-description-input"]')
      .clear()
      .type('updated description')

    cy.get('[aria-label="Save"]').click()

    cy.contains('TestStory-updated').should('be.visible')
    cy.contains('updated description').should('be.visible')

    // Verify initially in To Do
    cy.get('[data-test="todo-table"]').should('contain', 'TestStory-updated')

    // Move to In Progress
    cy.contains('tr', 'TestStory-updated').find('[aria-label="Move-down"]').click()
    cy.get('[data-test="inprogress-table"]').should('contain', 'TestStory-updated')
    cy.get('[data-test="todo-table"]').should('not.contain', 'TestStory-updated')
    cy.wait(500)

    // Move to Done
    cy.contains('tr', 'TestStory-updated').find('[aria-label="Move-down"]').click()
    cy.get('[data-test="done-table"]').should('contain', 'TestStory-updated')
    cy.get('[data-test="inprogress-table"]').should('not.contain', 'TestStory-updated')
    cy.wait(500)

    // Move back to In Progress
    cy.contains('tr', 'TestStory-updated').find('[aria-label="Move-up"]').click()
    cy.get('[data-test="inprogress-table"]').should('contain', 'TestStory-updated')
    cy.get('[data-test="done-table"]').should('not.contain', 'TestStory-updated')

  })
})
